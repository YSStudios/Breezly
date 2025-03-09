"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import heroImg from "../public/hero.jpeg";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const Hero = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      if (session) {
        // For authenticated users, check if there are any existing draft forms
        const response = await fetch("/api/form/list");
        if (response.ok) {
          const forms = await response.json();

          // Look for the most recent form that's in DRAFT state
          const draftForm = forms.find(
            (form: { id: string; data: any }) =>
              form.data && form.data.status === "DRAFT",
          );

          if (draftForm) {
            // Use the existing draft form instead of creating a new one
            router.push(`/offerform?id=${draftForm.id}&existing=true`);
            return;
          }
        }

        // No existing draft form, create a new one
        const newFormId = uuidv4();
        router.push(`/offerform?id=${newFormId}`);
      } else {
        // For unauthenticated users, check localStorage for existing drafts
        const currentFormId = localStorage.getItem("currentFormId");
        if (currentFormId) {
          const storedData = localStorage.getItem(`form_${currentFormId}`);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            // Only use stored form if it exists and is in draft state
            if (parsedData && parsedData.status === "DRAFT") {
              router.push(`/offerform?id=${currentFormId}`);
              return;
            }
          }
        }

        // No existing draft form, create a new one
        const newFormId = uuidv4();
        localStorage.setItem("currentFormId", newFormId);
        router.push(`/offerform?id=${newFormId}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container className="relative flex flex-wrap">
        <div className="flex w-full items-center lg:w-1/2">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-4xl font-bold leading-snug tracking-tight text-gray-800 lg:text-4xl lg:leading-tight xl:text-6xl xl:leading-tight">
              Create a real estate offer in minutes.
            </h1>
            <p className="py-5 text-xl leading-normal text-gray-500 lg:text-xl xl:text-2xl">
              Breezly takes the complexity out of real estate offers. Create,
              customize, and send your offers to sellers in minutes, all while
              saving thousands in commissions.
            </p>
            <div className="mt-3">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="inline-block transform rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-10 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Get Started"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center lg:w-1/2">
          <div className="">
            <Image
              src={heroImg}
              width="616"
              height="617"
              className={"object-cover"}
              alt="Hero Illustration"
              loading="eager"
              placeholder="blur"
            />
          </div>
        </div>
      </Container>
    </>
  );
};
