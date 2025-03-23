"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Sidebar, { substepNames, stepTitles } from "./Sidebar";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import SavingPopup from "./SavingPopup";
import { motion, AnimatePresence } from "framer-motion";

const Form: React.FC = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Local state for UI elements
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubstep, setCurrentSubstep] = useState(1);
  const [formId, setFormId] = useState<string>("");
  const [showSavingPopup, setShowSavingPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Initialize React Hook Form with default empty values
  // This ensures fields are defined even before data is loaded
  const methods = useForm({
    defaultValues: {
      "property-type": "",
      "property-address": "",
      depositAmount: "",
      depositMethod: "",
      escrowAgent: "",
      escrowAgentName: "",
      possession: "",
      possessionDate: "",
      closingDate: "",
      hasConditions: "",
      purchasePrice: "",
      status: "DRAFT",
      paymentStatus: "",
      createdAt: new Date().toISOString(),
    },
  });

  // Initialize form from URL or localStorage
  const initializeForm = useCallback(async () => {
    setIsLoading(true);

    try {
      // Check if form ID is in URL
      const urlId = searchParams?.get("id");
      let id = urlId || ""; // Ensure id is never null

      if (!id) {
        // Check if there's a form in progress
        if (session) {
          // Try to fetch existing forms from API
          try {
            const response = await fetch("/api/form/list");
            if (response.ok) {
              const forms = await response.json();
              // Find most recent draft
              const draftForm = forms.find(
                (form: any) => form.data && form.data.status === "DRAFT",
              );

              if (draftForm) {
                id = draftForm.id;
                methods.reset(draftForm.data);
                setFormId(id);
                return;
              }
            }
          } catch (error) {
            console.error("Error fetching forms:", error);
          }
        } else {
          // Check localStorage for anonymous users
          const storedId = localStorage.getItem("currentFormId");
          if (storedId) {
            const storedData = localStorage.getItem(`form_${storedId}`);
            if (storedData) {
              try {
                const parsedData = JSON.parse(storedData);
                if (parsedData && parsedData.status === "DRAFT") {
                  id = storedId;
                  methods.reset(parsedData);
                  setFormId(id);
                  return;
                }
              } catch (error) {
                console.error("Error parsing localStorage data:", error);
              }
            }
          }
        }

        // If no existing form, create new one
        id = uuidv4();
      } else {
        // Form ID is in URL, try to load it
        if (session) {
          const response = await fetch(`/api/form/get?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            methods.reset(data.data || data);
          }
        } else {
          // Try localStorage for the specific ID
          const storedData = localStorage.getItem(`form_${id}`);
          if (storedData) {
            try {
              methods.reset(JSON.parse(storedData));
            } catch (error) {
              console.error("Error parsing localStorage data:", error);
            }
          }
        }
      }

      // Set the form ID
      setFormId(id);

      // For new forms, initialize in DB/localStorage
      if (!urlId) {
        const initialData = methods.getValues();

        if (session) {
          try {
            await fetch("/api/forms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ formId: id, data: initialData }),
            });
          } catch (error) {
            console.error("Error creating form:", error);
          }
        } else {
          localStorage.setItem("currentFormId", id);
          localStorage.setItem(`form_${id}`, JSON.stringify(initialData));
        }
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      setSaveError(
        `Error initializing form: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, session, methods]);

  // Load form data on initial render
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  // Check if form is locked (paid)
  useEffect(() => {
    const formData = methods.getValues();
    setIsLocked(formData.paymentStatus === "PAID");
  }, [methods]);

  // Save form data
  const saveFormData = async () => {
    if (!formId) return;

    setShowSavingPopup(true);

    try {
      const data = methods.getValues();

      // Always save to localStorage
      localStorage.setItem(`form_${formId}`, JSON.stringify(data));

      // If logged in, save to server
      if (session) {
        const response = await fetch("/api/form/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId, data }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      setSaveError(null);
    } catch (error) {
      console.error("Error saving form:", error);
      setSaveError(
        `Error saving: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setTimeout(() => {
        setShowSavingPopup(false);
      }, 500);
    }
  };

  // Step navigation
  const getMaxSubsteps = (step: number): number => {
    const maxSteps = { 1: 1, 2: 3, 3: 2, 4: 8, 5: 1 };
    return maxSteps[step as keyof typeof maxSteps] || 1;
  };

  const nextSubstep = async () => {
    if (formId) {
      await saveFormData();
    }

    // Check if we're on the acceptance deadline page
    const hasConditions = methods.getValues("hasConditions");
    const isAcceptanceDeadlinePage =
      currentStep === 4 &&
      ((hasConditions === "Yes" && currentSubstep === 8) ||
        (hasConditions === "No" && currentSubstep === 7));

    if (isAcceptanceDeadlinePage) {
      // Go directly to step 5
      setCurrentStep(5);
      setCurrentSubstep(1);
    } else {
      const maxSubsteps = getMaxSubsteps(currentStep);
      if (currentSubstep < maxSubsteps) {
        setCurrentSubstep(currentSubstep + 1);
      } else if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        setCurrentSubstep(1);
      }
    }
  };

  const prevSubstep = async () => {
    if (formId) {
      await saveFormData();
    }

    if (currentSubstep > 1) {
      setCurrentSubstep(currentSubstep - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCurrentSubstep(getMaxSubsteps(currentStep - 1));
    }
  };

  const goToStep = async (step: number, substep: number = 1) => {
    if (formId) {
      await saveFormData();
    }

    setCurrentStep(step);
    setCurrentSubstep(substep);
  };

  // Helper to get previous step name for navigation
  const getPreviousSubstepName = (): string | null => {
    if (currentSubstep > 1) {
      return substepNames[currentStep]?.[currentSubstep - 1] || null;
    } else if (currentStep > 1) {
      const prevStep = currentStep - 1;
      if (
        Object.keys(substepNames[prevStep] || {}).length === 1 &&
        !substepNames[prevStep]?.[1]
      ) {
        return stepTitles[prevStep - 1];
      } else {
        const lastSubstep = Math.max(
          ...Object.keys(substepNames[prevStep] || {}).map(Number),
        );
        return substepNames[prevStep]?.[lastSubstep] || null;
      }
    }
    return null;
  };

  // Render the current step
  const renderStep = () => {
    const content = (
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
                <Step1 currentSubstep={currentSubstep} isLocked={isLocked} />
              );
            case 2:
              return (
                <Step2 currentSubstep={currentSubstep} isLocked={isLocked} />
              );
            case 3:
              return (
                <Step3 currentSubstep={currentSubstep} isLocked={isLocked} />
              );
            case 4:
              return (
                <Step4
                  currentSubstep={currentSubstep}
                  isLocked={isLocked}
                  handleSetStep={goToStep}
                />
              );
            case 5:
              return <Step5 formData={methods.getValues()} formId={formId} />;
            default:
              return null;
          }
        })()}
      </motion.div>
    );

    return <AnimatePresence mode="wait">{content}</AnimatePresence>;
  };

  // Handle email/download
  const handleDownloadOffer = async () => {
    // Only allow downloading if the form is purchased
    if (!isLocked) {
      toast.error("You need to purchase this offer before downloading");
      return;
    }

    setIsLoading(true);
    try {
      // Direct download approach using the generate-pdf endpoint
      window.location.href = `/api/generate-pdf?formId=${formId}`;
      // Wait a bit before setting loading to false
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("Error downloading offer:", error);
      toast.error("Failed to download your offer. Please try again.");
      setIsLoading(false);
    }
  };

  // Render form header with property address
  const renderFormHeader = () => {
    const address = methods.watch("property-address");
    if (address) {
      return (
        <div className="mb-6 rounded-lg border-gray-200 bg-gray-100 p-3">
          <h2 className="text-xl font-semibold capitalize text-emerald-800">
            Editing Offer: <p className="text-gray-700">{address}</p>
          </h2>
        </div>
      );
    }
    return null;
  };

  // Render locked notification for paid forms
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

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto mt-8 px-4 py-4">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:w-1/4">
            <div className="sticky top-24">
              <Sidebar
                currentStep={currentStep}
                currentSubstep={currentSubstep}
                handleSetStep={goToStep}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="md:w-3/4">
            {renderFormHeader()}
            {renderLockedNotification()}

            {/* Back navigation */}
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

            {/* Form content */}
            <div className="mb-8 rounded-lg bg-gray-100 p-8 shadow-lg">
              {renderStep()}
            </div>

            {/* Navigation buttons */}
            <div className="relative flex items-center justify-between">
              {(currentStep > 1 || currentSubstep > 1) && (
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
              )}

              {currentStep === 5 ? (
                <div className="mt-6 flex gap-4">
                  {isLocked ? (
                    <button
                      className={`rounded px-4 py-2 font-bold text-white ${
                        isLoading
                          ? "cursor-not-allowed bg-blue-300"
                          : "bg-blue-500 hover:bg-blue-700"
                      }`}
                      onClick={handleDownloadOffer}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Download My Offer"}
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={nextSubstep}
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

            {/* Error display */}
            {saveError && (
              <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-500">
                <p>{saveError}</p>
              </div>
            )}

            {/* Debug toggle */}
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
            {showDebug && (
              <div className="mt-8 rounded-lg border border-gray-300 bg-gray-100 p-4">
                <h3 className="text-lg font-bold text-gray-700">Form Data</h3>
                <pre className="mt-2 max-h-96 overflow-auto rounded border border-gray-200 bg-white p-3 text-xs">
                  {JSON.stringify(methods.getValues(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default Form;
