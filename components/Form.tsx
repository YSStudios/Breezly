"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Sidebar, { substepNames, stepTitles } from "./Sidebar";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import {
  setStep,
  setSubstep,
  setFormData,
  setFormId,
  updateFormState,
} from "../app/store/slices/formSlice";
import type { RootState } from "../app/store/store";
// import generatePDF from "../utils/generatePDF";
import SavingPopup from "./SavingPopup";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const DEBUG = process.env.NODE_ENV === "development";

const Form: React.FC = () => {
  const dispatch = useDispatch();
  // const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Get state from Redux
  const currentStep = useSelector((state: RootState) => state.form.currentStep);
  const currentSubstep = useSelector(
    (state: RootState) => state.form.currentSubstep,
  );
  const formData = useSelector((state: RootState) => state.form.formData);
  const formId = useSelector((state: RootState) => state.form.formId);

  // Remove local state for step management since it's now in Redux
  const [showSavingPopup, setShowSavingPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Add a toggle for the debug panel
  const [showDebug, setShowDebug] = useState(false);

  //
  const fetchFormData = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setSaveError(null);
      console.log("Fetching form data for ID:", id);

      try {
        if (session) {
          // Check if this is a new form
          const isNewForm =
            id === searchParams?.get("id") && !searchParams?.get("existing");

          if (isNewForm) {
            console.log("Initializing new form:", id);
            // Initialize empty form data immediately
            const initialData = {
              status: "DRAFT",
              createdAt: new Date().toISOString(),
            };
            dispatch(setFormData(initialData));

            try {
              // Attempt to create in database but don't block on failure
              console.log("Creating form in database:", id);
              const response = await fetch("/api/forms", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  formId: id,
                  data: initialData,
                }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                console.error(
                  "Failed to initialize form in database:",
                  errorData,
                );
              } else {
                console.log("Form created successfully in database");
              }
            } catch (error) {
              // Log error but continue with empty form
              console.warn(
                "Failed to initialize form in database, continuing with empty form:",
                error,
              );
            }
          } else {
            // Try to fetch existing form
            console.log("Fetching existing form:", id);
            const response = await fetch(`/api/form/get?id=${id}`);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                `Failed to fetch form data: ${response.statusText}. ${
                  errorData.message || ""
                }`,
              );
            }

            const data = await response.json();
            console.log("Received form data:", data);

            // Check if the data is properly structured for form display
            if (data && typeof data === "object") {
              if (data.data && typeof data.data === "object") {
                // We have a nested data structure - use the inner data object
                console.log("Using nested data structure");
                dispatch(setFormData(data.data));
              } else {
                // Use the data as is
                console.log("Using direct data structure");
                dispatch(setFormData(data));
              }
            } else {
              console.warn("Received invalid form data:", data);
              dispatch(
                setFormData({
                  status: "DRAFT",
                  createdAt: new Date().toISOString(),
                }),
              );
            }
          }
        } else {
          // Handle unauthenticated users
          console.log("Handling unauthenticated user, checking localStorage");
          const storedData = localStorage.getItem(`form_${id}`);
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              console.log("Found form data in localStorage:", id);
              dispatch(setFormData(parsedData));
            } catch (error) {
              console.error("Error parsing stored form data:", error);
              dispatch(
                setFormData({
                  status: "DRAFT",
                  createdAt: new Date().toISOString(),
                }),
              );
            }
          } else {
            console.log("No stored data found, initializing new form");
            dispatch(
              setFormData({
                status: "DRAFT",
                createdAt: new Date().toISOString(),
              }),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        // For new forms, don't show error to user, just initialize empty form
        if (!searchParams?.get("existing")) {
          console.log("Error for new form, initializing empty form");
          dispatch(
            setFormData({
              status: "DRAFT",
              createdAt: new Date().toISOString(),
            }),
          );
        } else {
          setSaveError(
            `Error fetching form data: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [session, dispatch, searchParams],
  );

  useEffect(() => {
    const initForm = async () => {
      const urlFormId = searchParams?.get("id");

      if (urlFormId) {
        dispatch(setFormId(urlFormId));
        await fetchFormData(urlFormId);
      } else {
        // Check if there are any existing forms in progress before creating a new one
        if (session) {
          try {
            // Try to fetch existing forms
            const response = await fetch("/api/form/list");
            if (response.ok) {
              const forms = await response.json();
              console.log("Found existing forms:", forms);

              // Look for the most recent form that's in DRAFT state
              const draftForm = forms.find(
                (form: { id: string; data: any }) =>
                  form.data && form.data.status === "DRAFT",
              );

              if (draftForm) {
                // Use the existing draft form instead of creating a new one
                console.log("Using existing draft form:", draftForm.id);
                dispatch(setFormId(draftForm.id));
                dispatch(setFormData(draftForm.data));
                return;
              }
            }
          } catch (error) {
            console.error("Error checking for existing forms:", error);
          }
        } else {
          // For unauthenticated users, check localStorage
          const currentFormId = localStorage.getItem("currentFormId");
          if (currentFormId) {
            const storedData = localStorage.getItem(`form_${currentFormId}`);
            if (storedData) {
              try {
                const parsedData = JSON.parse(storedData);
                // Only use stored form if it's in draft state
                if (parsedData && parsedData.status === "DRAFT") {
                  console.log(
                    "Using stored form from localStorage:",
                    currentFormId,
                  );
                  dispatch(setFormId(currentFormId));
                  dispatch(setFormData(parsedData));
                  return;
                }
              } catch (error) {
                console.error("Error parsing stored form data:", error);
              }
            }
          }
        }

        // If no existing draft form was found, create a new one
        const newFormId = uuidv4();
        console.log("Creating new form with ID:", newFormId);

        // Set initial form data with basic required fields
        const initialFormData = {
          status: "DRAFT",
          createdAt: new Date().toISOString(),
        };

        dispatch(setFormId(newFormId));
        dispatch(setFormData(initialFormData));

        if (session) {
          try {
            console.log("Saving new form to server:", newFormId);
            const response = await fetch("/api/forms", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                formId: newFormId,
                data: initialFormData,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error("Failed to create new form:", errorData);
              setSaveError(
                `Failed to create new form: ${
                  errorData.error || response.statusText
                }`,
              );
            } else {
              console.log("Form created successfully");
            }
          } catch (error) {
            console.error("Error creating new form:", error);
            setSaveError(
              "Failed to initialize new form: " +
                (error instanceof Error ? error.message : "Unknown error"),
            );
          }
        } else {
          // For unauthenticated users, store in localStorage
          localStorage.setItem("currentFormId", newFormId);
          localStorage.setItem(
            `form_${newFormId}`,
            JSON.stringify(initialFormData),
          );
        }
      }
    };

    initForm();
  }, [searchParams, fetchFormData, dispatch, session]);

  useEffect(() => {
    if (
      formId &&
      formData &&
      formData.data &&
      formData.data.paymentStatus === "PAID"
    ) {
      setIsLocked(true);
    }
  }, [formId, formData]);

  // Update handlers to use Redux
  const handleSetStep = (step: number, substep?: number) => {
    dispatch(setStep(step));
    dispatch(setSubstep(substep || 1));
  };

  // Fix for handling boolean and array values in form data
  const handleInputChange = (name: string, value: any) => {
    if (isLocked && name === "property-address") {
      toast.error(
        "This offer has been purchased and the property address cannot be changed.",
      );
      return;
    }

    // Special handling for boolean values
    if (value === "true" || value === "false") {
      value = value === "true";
    }

    // Special handling for comma-separated strings (checkbox groups)
    if (typeof value === "string" && value.includes(",")) {
      // If the value looks like a comma-separated list from a checkbox group,
      // store it as both the original string and as an array for easier access
      const valueArray = value.split(",").filter((item) => item.trim() !== "");

      console.log(
        `Saving checkbox field ${name} with ${valueArray.length} values:`,
        valueArray,
      );

      dispatch(
        updateFormState({
          formData: {
            ...formData,
            [name]: value,
            [`${name}_array`]: valueArray, // Store the array version too
          },
        }),
      );

      // Save immediately when checkboxes change to ensure they're persisted
      setTimeout(() => saveFormData(), 100);
    } else {
      dispatch(
        updateFormState({
          formData: {
            ...formData,
            [name]: value,
          },
        }),
      );
    }
  };

  const saveFormData = () => {
    if (!formId) {
      setSaveError("No formId available for saving");
      return;
    }

    try {
      console.log("Saving form data with ID:", formId);

      // Process the form data before saving to ensure complex types are handled correctly
      const processedData = { ...formData };

      // Convert arrays to strings if needed
      Object.keys(processedData).forEach((key) => {
        if (Array.isArray(processedData[key])) {
          // For array values, store them as pipe-separated strings
          processedData[key] = processedData[key].join("|");
        }
      });

      // Save to localStorage
      localStorage.setItem(`form_${formId}`, JSON.stringify(processedData));

      if (session) {
        console.log("Saving to server with ID:", formId);
        fetch("/api/form/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formId, data: processedData }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to save form data to server");
            }
            setSaveError(null); // Clear any existing errors
            console.log("Form data saved successfully");
          })
          .catch((error) => {
            console.error("Error saving form data:", error);
            setSaveError(`Error saving form data: ${error.message}`);
          });
      }
    } catch (error) {
      console.error("Error saving form data:", error);
      setSaveError(
        `Error saving form data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  const getPreviousSubstepName = (): string | null => {
    if (currentSubstep > 1) {
      // If we're not on the first substep of current step
      return substepNames[currentStep]?.[currentSubstep - 1] || null;
    } else if (currentStep > 1) {
      // If we're on first substep of any step after step 1
      const previousStep = currentStep - 1;
      // Use stepTitles for steps without substeps
      if (
        Object.keys(substepNames[previousStep]).length === 1 &&
        !substepNames[previousStep][1]
      ) {
        return stepTitles[previousStep - 1];
      } else {
        // Get the last substep of the previous step
        const lastSubstepNumber = Math.max(
          ...Object.keys(substepNames[previousStep]).map(Number),
        );
        return substepNames[previousStep][lastSubstepNumber] || null;
      }
    }
    return null;
  };

  const nextSubstep = () => {
    const maxSubsteps = getMaxSubsteps(currentStep);
    if (currentSubstep < maxSubsteps) {
      dispatch(setSubstep(currentSubstep + 1));
    } else if (currentStep < 5) {
      // Assuming you have 5 steps total
      dispatch(setStep(currentStep + 1));
      dispatch(setSubstep(1));
    }
  };

  const prevSubstep = () => {
    if (currentSubstep > 1) {
      dispatch(setSubstep(currentSubstep - 1));
    } else if (currentStep > 1) {
      dispatch(setStep(currentStep - 1));
      // Get the max substeps for the previous step and set it as the current substep
      const maxSubstepsForPreviousStep = getMaxSubsteps(currentStep - 1);
      dispatch(setSubstep(maxSubstepsForPreviousStep));
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
              return <Step5 formData={formData} formId={formId || ""} />; // Pass formId here with a default value if null
            default:
              return null;
          }
        })()}
      </motion.div>
    );

    return <AnimatePresence mode="wait">{stepContent}</AnimatePresence>;
  };

  // const handleGeneratePDF = async () => {
  //   try {
  //     const pdfBlob = await generatePDF(formData); // Generate the PDF
  //     const url = URL.createObjectURL(pdfBlob); // Create a URL for the Blob

  //     const link = document.createElement("a"); // Create a link element
  //     link.href = url; // Set the URL as the link's href
  //     link.download = "offer.pdf"; // Set the default file name
  //     document.body.appendChild(link); // Append the link to the body
  //     link.click(); // Programmatically click the link to trigger the download
  //     document.body.removeChild(link); // Remove the link from the document
  //     URL.revokeObjectURL(url); // Clean up the URL object
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

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
    dispatch(
      updateFormState({
        formData: {
          ...formData,
          "property-type": propertyData.value,
        },
      }),
    );
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
          <h2 className="text-xl font-semibold capitalize text-gray-800">
            Offer for: {formData["property-address"]}
          </h2>
        </div>
      );
    }
    return null;
  };

  const renderLockedNotification = () => {
    if (isLocked) {
      return (
        <div className="mb-6 rounded-md bg-blue-50 p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm font-medium text-blue-800">
              This offer has been purchased and finalized. The property address
              cannot be modified.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Add schema information to the FormDebug component
  const FormDebug: React.FC<{ formData: any; showDebug: boolean }> = ({
    formData,
    showDebug,
  }) => {
    if (!showDebug) return null;

    // Create a safe stringify function that handles circular references
    const safeStringify = (obj: any, indent = 2) => {
      let cache: any[] = [];
      const retVal = JSON.stringify(
        obj,
        (key, value) => {
          if (typeof value === "object" && value !== null) {
            // Handle circular references
            if (cache.includes(value)) {
              return "[Circular Reference]";
            }
            cache.push(value);
          }
          return value;
        },
        indent,
      );
      cache = null as any; // Reset the cache
      return retVal;
    };

    // Generate an overview of checkboxes and their values
    const getCheckboxSummary = () => {
      const checkboxKeys = Object.keys(formData).filter(
        (key) =>
          typeof formData[key] === "string" && formData[key].includes(","),
      );

      if (checkboxKeys.length === 0) return "No checkbox fields detected";

      return checkboxKeys
        .map((key) => {
          const values = formData[key]
            .split(",")
            .filter((v: string) => v.trim() !== "");
          return `${key}: ${values.length} selected (${values.join(", ")})`;
        })
        .join("\n");
    };

    return (
      <div className="mt-8 rounded-lg border border-gray-300 bg-gray-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-700">Form Data Debug</h3>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => console.log("Form data:", formData)}
              className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
            >
              Log to Console
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">
              Checkbox Fields Overview
            </h4>
            <pre className="max-h-48 overflow-x-auto overflow-y-auto rounded border border-gray-200 bg-white p-3 text-xs">
              {getCheckboxSummary()}
            </pre>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Schema Overview</h4>
            <pre className="max-h-48 overflow-x-auto overflow-y-auto rounded border border-gray-200 bg-white p-3 text-xs">
              {Object.keys(formData)
                .map((key) => `${key}: ${typeof formData[key]}`)
                .join("\n")}
            </pre>
          </div>
        </div>

        <h4 className="mb-2 text-sm font-semibold">Complete Form Data</h4>
        <pre className="max-h-96 overflow-x-auto overflow-y-auto rounded border border-gray-200 bg-white p-3 text-xs">
          {safeStringify(formData)}
        </pre>
      </div>
    );
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  return (
    <div className="container mx-auto mt-8 px-4 py-4">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Desktop Sidebar - Hide on mobile */}
        <div className="hidden md:block md:w-1/4">
          <div className="sticky top-24">
            <Sidebar
              currentStep={currentStep}
              currentSubstep={currentSubstep}
              handleSetStep={handleSetStep}
            />
          </div>
        </div>

        {/* Rest of the form content */}
        <div className="md:w-3/4">
          {renderFormHeader()}
          {renderLockedNotification()}
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
          {/* Add debug toggle button */}
          <div className="mt-6 text-right">
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {showDebug ? "Hide Debug" : "Show Debug"}
            </button>
          </div>

          {/* Debug panel */}
          <FormDebug formData={formData} showDebug={showDebug} />
        </div>
      </div>
      {/* Remove any submit button if it exists */}
    </div>
  );
};

export default Form;
