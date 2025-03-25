"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";
import { useForm } from "react-hook-form";

interface ResetFormData {
  email: string;
}

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [resetLink, setResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>();

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError("");
    setResetLink(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        // Check if we're in development mode and a reset link was provided
        if (responseData.resetUrl) {
          setResetLink(responseData.resetUrl);
        }
      } else {
        setError(responseData.message || "Failed to request password reset");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        {isSubmitted ? (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-emerald-100 p-6">
              <Icons.email className="h-12 w-12 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Check your email
            </h1>
            <p className="text-muted-foreground text-sm">
              If an account exists with this email, we&apos;ve sent a password
              reset link. Please check your inbox.
            </p>
            {resetLink && (
              <div className="mt-4 w-full rounded-md border border-yellow-300 bg-yellow-50 p-3 text-left">
                <p className="mb-2 text-sm font-medium text-yellow-800">
                  Development Mode: Reset Link
                </p>
                <p className="mb-2 text-xs text-yellow-700">
                  Since SendGrid is not configured or you&apos;re in development
                  mode, you can use this link to reset your password:
                </p>
                <div className="break-all text-xs text-blue-600">
                  <Link href={resetLink} className="hover:underline">
                    {resetLink}
                  </Link>
                </div>
              </div>
            )}
            <Link
              href="/auth/signin"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-center hover:bg-gray-50"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Reset your password
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your email address and we&apos;ll send you a link to reset
                your password
              </p>
            </div>
            <div className="grid gap-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email", {
                      required: true,
                      pattern: /^\S+@\S+$/i,
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      Valid email is required
                    </p>
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
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {error && (
                <div className="rounded-md bg-red-50 p-2 text-center text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
