"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Icons } from "@/components/ui/icons";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface SetupFormData {
  name: string;
}

export default function SetupProfile() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SetupFormData>();

  // Pre-fill the form with existing user data if available
  useEffect(() => {
    if (session?.user?.name) {
      setValue("name", session.user.name);
    }
  }, [session, setValue]);

  // If user is authenticated and has all required profile data, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Update user profile
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
          },
        });

        // Redirect to dashboard
        router.push(callbackUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Image
          src="/breezlylogo-green.svg"
          alt="Breezly"
          width={150}
          height={40}
          className="rounded-sm"
        />
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete your profile
          </h1>
          <p className="text-muted-foreground text-sm">
            We need a few more details to complete your account setup
          </p>
        </div>

        <div className="grid gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Your Name
              </label>
              <input
                id="name"
                placeholder="John Doe"
                {...register("name", { required: true })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-xs text-red-500">Your name is required</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md px-3 py-2 text-white transition-colors ${
                isLoading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Complete Setup"
              )}
            </button>
          </form>

          {error && (
            <div className="rounded-md bg-red-50 p-2 text-center text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
