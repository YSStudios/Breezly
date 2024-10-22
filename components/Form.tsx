"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Sidebar, { substepNames } from "./Sidebar";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import { FormData } from "./types";
import generatePDF from "../utils/generatePDF";
import SavingPopup from "./SavingPopup";

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

  useEffect(() => {
    const initForm = async () => {
      const urlFormId = searchParams?.get("id");
      if (urlFormId) {
        setFormId(urlFormId);
        await fetchFormData(urlFormId);
      } else {
        const storedFormId = localStorage.getItem("currentFormId");
        if (storedFormId) {
          setFormId(storedFormId);
          await fetchFormData(storedFormId);
        } else {
          const newFormId = uuidv4();
          setFormId(newFormId);
          localStorage.setItem("currentFormId", newFormId);
        }
      }
    };

    initForm();
  }, [searchParams, session]);

  // New useEffect hook to log formData whenever it changes
  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  const fetchFormData = async (id: string) => {
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
  };

  const saveFormData = async () => {
    if (!formId) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      if (session) {
        // User is logged in, save to server
        console.log("Saving form data to server:");
        console.log("FormId:", formId);
        console.log("Form data:", JSON.stringify(formData, null, 2));
        console.log("Session status:", status);
        console.log("Session user:", JSON.stringify(session?.user, null, 2));

        const response = await fetch("/api/form/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formId,
            data: formData,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log("Save response:", result);
        } else {
          console.error("Error saving form:", result);
          let errorMessage = `Failed to save form: ${result.message}`;
          if (result.error) {
            errorMessage += DEBUG ? `\nError details: ${result.error}` : "";
          }
          setSaveError(errorMessage);
        }
      } else {
        // User is not logged in, save to local storage
        console.log("Saving form data to local storage:");
        console.log("FormId:", formId);
        console.log("Form data:", JSON.stringify(formData, null, 2));

        // Add a small delay to make the saving process more visible
        await new Promise((resolve) => setTimeout(resolve, 500));

        localStorage.setItem(`form_${formId}`, JSON.stringify(formData));
        console.log("Form data saved to local storage");
      }
    } catch (error) {
      console.error("Error saving form data:", error);
      setSaveError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSetStep = (step: number, substep: number = 1) => {
    setCurrentStep(step);
    setCurrentSubstep(substep);
  };

  const getPreviousSubstepName = (): string | null => {
    if (currentSubstep > 1) {
      return substepNames[currentStep]?.[currentSubstep - 1] || null;
    } else if (currentStep > 1) {
      const previousStepSubsteps = substepNames[currentStep - 1];
      const lastSubstepOfPreviousStep = Math.max(
        ...Object.keys(previousStepSubsteps).map(Number),
      );
      return previousStepSubsteps[lastSubstepOfPreviousStep] || null;
    }
    return null;
  };

  const nextSubstep = () => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      setCurrentSubstep(currentSubstep + 1);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setCurrentSubstep(1);
    }
  };

  const prevSubstep = () => {
    if (currentSubstep > 1) {
      setCurrentSubstep(currentSubstep - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCurrentSubstep(getMaxSubsteps(currentStep - 1));
    }
  };

  const getMaxSubsteps = (step: number): number => {
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
    switch (currentStep) {
      case 1:
        return (
          <Step1
            currentSubstep={currentSubstep}
            onInputChange={handleInputChange}
            formData={formData}
          />
        );
      case 2:
        return (
          <Step2
            currentSubstep={currentSubstep}
            onInputChange={handleInputChange}
            formData={formData}
          />
        );
      case 3:
        return (
          <Step3
            currentSubstep={currentSubstep}
            onInputChange={handleInputChange}
            formData={formData}
          />
        );
      case 4:
        return (
          <Step4
            currentSubstep={currentSubstep}
            onInputChange={handleInputChange}
            formData={formData}
          />
        );
      case 5:
        return <Step5 formData={formData} />;
      default:
        return null;
    }
  };

  const handleGeneratePDF = async () => {
	try {
	  const pdfBlob = await generatePDF(formData); // Generate the PDF
	  const url = URL.createObjectURL(pdfBlob); // Create a URL for the Blob
  
	  const link = document.createElement('a'); // Create a link element
	  link.href = url; // Set the URL as the link's href
	  link.download = 'offer.pdf'; // Set the default file name
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="md:w-1/4">
          <div className="sticky top-16">
            <Sidebar
              currentStep={currentStep}
              currentSubstep={currentSubstep}
              handleSetStep={handleSetStep}
            />
          </div>
        </div>
        <div className="md:w-3/4">
          {getPreviousSubstepName() && (
            <button
              onClick={() => handleSetStep(currentStep, currentSubstep - 1)}
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
              <button
                onClick={handleGeneratePDF}
                className="flex items-center rounded-full bg-purple-500 px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-purple-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download Offer
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={handleNextClick}
                  className="flex items-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 font-bold text-white transition-colors duration-300 hover:from-emerald-500 hover:to-teal-600"
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
    </div>
  );
};

export default Form;
