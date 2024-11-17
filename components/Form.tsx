"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Sidebar, { substepNames, stepTitles } from "./Sidebar";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import { FormData } from "./types";
import generatePDF from "../utils/generatePDF";
import SavingPopup from "./SavingPopup";
import { motion, AnimatePresence } from "framer-motion";

const DEBUG = process.env.NODE_ENV === "development";

const Form: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubstep, setCurrentSubstep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [formId, setFormId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [showSavingPopup, setShowSavingPopup] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const fetchFormData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        if (session) {
          // User is logged in, fetch from server
          const response = await fetch(`/api/form/get?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched form data from server:", data);
            setFormData(data);
          } else if (response.status === 404) {
            console.log("Form not found on server, creating a new one");
            setFormData({});
          } else {
            console.error(
              "Error fetching form data from server:",
              await response.text(),
            );
          }
        } else {
          // User is not logged in, fetch from local storage
          const storedData = localStorage.getItem(`form_${id}`);
          if (storedData) {
            const data = JSON.parse(storedData);
            console.log("Fetched form data from local storage:", data);
            setFormData(data);
          } else {
            console.log("Form not found in local storage, creating a new one");
            setFormData({});
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  ); // Add session as a dependency

  useEffect(() => {
    const initForm = async () => {
      const urlFormId = searchParams?.get("id");
      console.log("URL Form ID:", urlFormId); // Add debug log
      
      if (urlFormId) {
        console.log("Using URL Form ID:", urlFormId);
        setFormId(urlFormId);
        await fetchFormData(urlFormId);
      } else {
        const storedFormId = localStorage.getItem("currentFormId");
        console.log("Stored Form ID:", storedFormId); // Add debug log
        
        if (storedFormId) {
          console.log("Using stored Form ID:", storedFormId);
          setFormId(storedFormId);
          await fetchFormData(storedFormId);
        } else {
          const newFormId = uuidv4();
          console.log("Generated new Form ID:", newFormId);
          setFormId(newFormId);
          localStorage.setItem("currentFormId", newFormId);
        }
      }
    };

    initForm();
  }, [searchParams, fetchFormData]); // Add fetchFormData to the dependency array

  // New useEffect hook to log formData whenever it changes
  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  const saveFormData = () => {
    if (!formId) {
      console.error("No formId available for saving");
      return;
    }

    console.log("Saving form data with ID:", formId);
    localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
    
    if (session) {
      console.log("Saving to server with ID:", formId);
      fetch('/api/form/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId, data: formData }),
      }).catch(error => console.error('Error saving form data:', error));
    }
  };

  const handleInputChange = (name: string, value: any) => {
    console.log(`Saving form data - ${name}:`, value);
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      console.log("Updated complete form data:", newData);
      return newData;
    });
  };

  const handleSetStep = (step: number, substep?: number) => {
    setCurrentStep(step);
    setCurrentSubstep(substep || 1);
  };

  const getPreviousSubstepName = (): string | null => {
    if (currentSubstep > 1) {
      // If we're not on the first substep of current step
      return substepNames[currentStep]?.[currentSubstep - 1] || null;
    } else if (currentStep > 1) {
      // If we're on first substep of any step after step 1
      const previousStep = currentStep - 1;
      // Use stepTitles for steps without substeps
      if (Object.keys(substepNames[previousStep]).length === 1 && !substepNames[previousStep][1]) {
        return stepTitles[previousStep - 1];
      } else {
        // Get the last substep of the previous step
        const lastSubstepNumber = Math.max(
          ...Object.keys(substepNames[previousStep]).map(Number)
        );
        return substepNames[previousStep][lastSubstepNumber] || null;
      }
    }
    return null;
  };

  const nextSubstep = () => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      setCurrentSubstep(currentSubstep + 1);
    } else if (currentStep < 5) {
      // Assuming you have 5 steps total
      setCurrentStep(currentStep + 1);
      setCurrentSubstep(1);
    }
  };

  const prevSubstep = () => {
    if (currentSubstep > 1) {
      setCurrentSubstep(currentSubstep - 1);
    } else if (currentStep > 1) {
      const previousStep = currentStep - 1;
      setCurrentStep(previousStep);
      // Get the max substeps for the previous step and set it as the current substep
      const maxSubstepsForPreviousStep = getMaxSubsteps(previousStep);
      setCurrentSubstep(maxSubstepsForPreviousStep);
    }
  };

  const getMaxSubsteps = (step: number): number => {
    // Define the number of substeps for each step
    switch (step) {
      case 1:
        return 1;
      case 2:
        return 4;
      case 3:
        return 2;
      case 4:
        return 8;
      case 5:
        return 1;
      default:
        return 1;
    }
  };

  const renderStep = () => {
    console.log("Rendering step, formData:", formData);
    const stepContent = (
      <motion.div
        key={`step-${currentStep}-${currentSubstep}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {(() => {
          switch (currentStep) {
            case 1:
              return (
                <Step1
                  currentSubstep={currentSubstep}
                  onInputChange={handleInputChange}
                  formData={formData}
                  onPropertySelect={handlePropertySelection}
                />
              );
            case 2:
              return (
                <Step2
                  currentSubstep={currentSubstep}
                  onInputChange={handleInputChange}
                  formData={formData}
                  onPropertySelect={handlePropertySelection}
                />
              );
            case 3:
              return (
                <Step3
                  currentSubstep={currentSubstep}
                  onInputChange={handleInputChange}
                  formData={formData}
                  onPropertySelect={handlePropertySelection}
                />
              );
            case 4:
              return (
                <Step4
                  currentSubstep={currentSubstep}
                  onInputChange={handleInputChange}
                  formData={formData}
                  onPropertySelect={handlePropertySelection}
                />
              );
            case 5:
              return <Step5 formData={formData} formId={formId || ''} />; // Pass formId here with a default value if null
            default:
              return null;
          }
        })()}
      </motion.div>
    );

    return <AnimatePresence mode="wait">{stepContent}</AnimatePresence>;
  };

  const handleGeneratePDF = async () => {
    try {
      const pdfBlob = await generatePDF(formData); // Generate the PDF
      const url = URL.createObjectURL(pdfBlob); // Create a URL for the Blob

      const link = document.createElement("a"); // Create a link element
      link.href = url; // Set the URL as the link's href
      link.download = "offer.pdf"; // Set the default file name
      document.body.appendChild(link); // Append the link to the body
      link.click(); // Programmatically click the link to trigger the download
      document.body.removeChild(link); // Remove the link from the document
      URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleNextClick = async () => {
    setShowSavingPopup(true);
    await saveFormData();

    // Wait for the animation to complete before moving to the next step
    setTimeout(() => {
      nextSubstep();
      setShowSavingPopup(false);
    }, 500); // Adjust this time to match your animation duration
  };

  const handlePropertySelection = (propertyData: any) => {
    console.log("Selected property data:", propertyData);
    setFormData((prevData) => ({
      ...prevData,
      "property-type": propertyData.value,
    }));
  };

  const confirmPropertySelection = () => {
    if (selectedProperty) {
      setFormData((prevData) => ({
        ...prevData,
        "property-address": selectedProperty.address,
        "property-type": selectedProperty.type,
        // Add any other relevant property data
      }));
      nextSubstep();
      setSelectedProperty(null);
    }
  };

  const handleComplete = () => {
    if (!formId) {
      console.error("No formId available");
      return;
    }
    
    saveFormData();
    console.log("Navigating to plans page with formId:", formId);
    router.push(`/plans?formId=${formId}`);
  };
  const handleDownloadOffer = async () => {
    console.log("Template:", "offer-sent");
    console.log("Form Data:", formData);

    setIsLoading(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template: "offer-sent", data: formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Email API Error:", errorData);
        throw new Error("Failed to send email");
      }

      alert("Offer has been sent via email!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send offer via email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormHeader = () => {
    console.log("Form Data in header:", formData);
    if (formData["property-address"]) {
      return (
        <div className="mb-6 border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            Offer for: {formData["property-address"]}
          </h2>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-4 mt-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="md:w-1/4">
          <div className="sticky top-24">
            <Sidebar
              currentStep={currentStep}
              currentSubstep={currentSubstep}
              handleSetStep={handleSetStep}
            />
          </div>
        </div>
        <div className="md:w-3/4">
          {renderFormHeader()}
          {getPreviousSubstepName() && (
            <button
              onClick={prevSubstep}
              className="mb-4 flex items-center text-emerald-600 hover:text-emerald-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {getPreviousSubstepName()}
            </button>
          )}
          <div className="mb-8 rounded-lg bg-white p-8 shadow-lg">
            {renderStep()}
          </div>
          <div className="relative flex items-center justify-between">
            {currentStep > 1 || currentSubstep > 1 ? (
              <button
                onClick={prevSubstep}
                className="flex items-center rounded-full bg-gray-200 px-6 py-3 font-bold text-gray-700 transition-colors duration-300 hover:bg-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Previous
              </button>
            ) : (
              <div></div>
            )}
            {currentStep === 5 ? (
              <div className="mt-6 flex gap-4">
                <button
                  className={`rounded px-4 py-2 font-bold text-white ${
                    isLoading
                      ? "cursor-not-allowed bg-blue-300"
                      : "bg-blue-500 hover:bg-blue-700"
                  }`}
                  onClick={handleDownloadOffer}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Download My Offer"}
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={handleNextClick}
                  className="flex items-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 font-bold text-white transition-all duration-300 hover:from-purple-500 hover:to-indigo-600"
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <SavingPopup isVisible={showSavingPopup} />
              </div>
            )}
          </div>
          {saveError && (
            <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-500">
              <p>{saveError}</p>
              {DEBUG && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Debug Information
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs">
                    {JSON.stringify({ session, formId, formData }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Remove any submit button if it exists */}
    </div>
  );
};

export default Form;
