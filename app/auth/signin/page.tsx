"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(error || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setAuthError(result.error);
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setAuthError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
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
            Sign in to your account
          </h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to sign in to your account
          </p>
        </div>

        <div className="grid gap-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
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
              {isLoading ? "Loading..." : "Sign In"}
            </button>
          </form>

          {authError && (
            <div className="rounded-md bg-red-50 p-2 text-center text-sm text-red-500">
              {authError}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            className="flex items-center justify-center space-x-2 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 488 512"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-500 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
