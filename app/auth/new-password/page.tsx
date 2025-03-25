"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NewPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [invalidParams, setInvalidParams] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [tokenDebugResult, setTokenDebugResult] = useState<any>(null);
  const [isDebugLoading, setIsDebugLoading] = useState<boolean>(false);

  // Get token and email from URL
  const token = searchParams?.get("token");
  const email = searchParams?.get("email");

  useEffect(() => {
    // Check if token and email are present
    if (!token || !email) {
      setInvalidParams(true);
      setError(
        "Missing required parameters. Please request a new password reset link.",
      );
    } else {
      // Show token debug info (first 6 chars only for security)
      if (process.env.NODE_ENV === "development") {
        setDebugInfo(`Token (first 6 chars): ${token.substring(0, 6)}...`);
      }
    }
  }, [token, email]);

  // Password strength check
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains special char
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset error state
    setError("");

    try {
      // Validation
      if (!email || !token) {
        setError("Invalid reset link. Please request a new password reset.");
        return;
      }

      // Validate password
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setIsLoading(true);

      // Submit new password
      const response = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Success
      setIsSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const debugToken = async () => {
    if (!email || !token) return;

    setIsDebugLoading(true);
    try {
      const response = await fetch("/api/debug/token-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();
      setTokenDebugResult(data);
    } catch (error) {
      console.error("Token debug error:", error);
    } finally {
      setIsDebugLoading(false);
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
        {isSuccess ? (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-emerald-100 p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Password Reset Successful
            </h1>
            <p className="text-muted-foreground text-sm">
              Your password has been reset. You will be redirected to the
              sign-in page shortly.
            </p>
            <Link
              href="/auth/signin"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-center hover:bg-gray-50"
            >
              Back to Sign In
            </Link>
          </div>
        ) : invalidParams ? (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-red-100 p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Invalid Reset Link
            </h1>
            <p className="text-muted-foreground text-sm">
              The password reset link is invalid or has expired. Please request
              a new password reset link.
            </p>
            <Link
              href="/auth/reset-password"
              className="w-full rounded-md bg-emerald-500 px-3 py-2 text-center text-white hover:bg-emerald-600"
            >
              Request New Link
            </Link>
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
                Set New Password
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your new password below
              </p>
            </div>
            {debugInfo && process.env.NODE_ENV === "development" && (
              <>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-2 text-sm text-blue-800">
                  <p className="font-medium">Debug Info</p>
                  <p className="text-xs">{debugInfo}</p>
                  <p className="text-xs">Email: {email}</p>
                  <button
                    type="button"
                    onClick={debugToken}
                    disabled={isDebugLoading}
                    className="mt-2 rounded border border-blue-500 bg-blue-100 px-2 py-1 text-xs text-blue-600 hover:bg-blue-200"
                  >
                    {isDebugLoading ? "Checking..." : "Debug Token"}
                  </button>
                </div>

                {tokenDebugResult && (
                  <div className="max-h-80 overflow-auto rounded-md border border-blue-200 bg-blue-50 p-2 text-sm text-blue-800">
                    <p className="font-medium">Token Debug Results</p>
                    <div className="mt-2 text-xs">
                      <p>
                        <strong>Email:</strong> {tokenDebugResult.email}
                      </p>
                      <p>
                        <strong>Token Count:</strong>{" "}
                        {tokenDebugResult.tokenCount}
                      </p>

                      {tokenDebugResult.standardLookupResult?.found ? (
                        <div className="mt-1">
                          <p>
                            <strong>Standard Lookup:</strong> Found
                          </p>
                          <p>
                            <strong>Token:</strong>{" "}
                            {tokenDebugResult.standardLookupResult.tokenPreview}
                          </p>
                          <p>
                            <strong>Expired:</strong>{" "}
                            {tokenDebugResult.standardLookupResult.isExpired
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-red-500">
                          <strong>Standard Lookup:</strong> Not Found
                        </p>
                      )}

                      {tokenDebugResult.directMatch?.found ? (
                        <div className="mt-1">
                          <p>
                            <strong>Direct Match:</strong> Found
                          </p>
                          <p>
                            <strong>Identifier:</strong>{" "}
                            {tokenDebugResult.directMatch.identifier}
                          </p>
                          <p>
                            <strong>Token:</strong>{" "}
                            {tokenDebugResult.directMatch.tokenPreview}
                          </p>
                          <p>
                            <strong>Expired:</strong>{" "}
                            {tokenDebugResult.directMatch.isExpired
                              ? "Yes"
                              : "No"}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-red-500">
                          <strong>Direct Match:</strong> Not Found
                        </p>
                      )}

                      {tokenDebugResult.guidance &&
                        tokenDebugResult.guidance.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Guidance:</p>
                            <ul className="list-disc pl-4">
                              {tokenDebugResult.guidance.map(
                                (item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="grid gap-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {password && (
                    <div className="mt-1">
                      <div className="flex h-2 items-center space-x-1 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full ${
                            passwordStrength === 0
                              ? "bg-gray-200"
                              : passwordStrength === 1
                              ? "w-1/4 bg-red-500"
                              : passwordStrength === 2
                              ? "w-2/4 bg-yellow-500"
                              : passwordStrength === 3
                              ? "w-3/4 bg-blue-500"
                              : "w-full bg-green-500"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {passwordStrength === 0
                          ? "Enter a password"
                          : passwordStrength === 1
                          ? "Weak password"
                          : passwordStrength === 2
                          ? "Fair password"
                          : passwordStrength === 3
                          ? "Good password"
                          : "Strong password"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className="text-xs text-red-500">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                  }
                  className={`w-full rounded-md px-3 py-2 text-white transition-colors ${
                    isLoading ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Set New Password"
                  )}
                </button>
              </form>

              {error && (
                <div className="rounded-md bg-red-50 p-2 text-center text-sm text-red-500">
                  {error}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mt-2 text-left text-xs">
                      <p className="font-medium">Debugging Help:</p>
                      <ol className="list-decimal pl-4">
                        <li>
                          Make sure you&apos;re using the most recent reset link
                        </li>
                        <li>Try requesting a new password reset</li>
                        <li>
                          Check server logs for token verification details
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
