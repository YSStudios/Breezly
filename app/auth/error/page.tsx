"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication";

  // Map error codes to user-friendly messages
  if (error === "OAuthSignin")
    errorMessage = "Error starting the OAuth sign-in flow";
  if (error === "OAuthCallback")
    errorMessage = "Error during the OAuth callback";
  if (error === "OAuthCreateAccount")
    errorMessage = "Error creating OAuth provider user";
  if (error === "EmailCreateAccount")
    errorMessage = "Error creating email provider user";
  if (error === "Callback") errorMessage = "Error during the callback process";
  if (error === "OAuthAccountNotLinked")
    errorMessage = "Email already in use with another provider";
  if (error === "EmailSignin")
    errorMessage = "Error sending the verification email";
  if (error === "CredentialsSignin")
    errorMessage = "Invalid credentials. Please check your email and password";
  if (error === "SessionRequired")
    errorMessage = "Session required. Please sign in to access this page";
  if (error === "Default") errorMessage = "Unable to sign in";

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
          <h1 className="text-2xl font-semibold tracking-tight text-red-600">
            Authentication Error
          </h1>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
        </div>
        <div className="grid gap-4">
          <Link
            href="/auth/signin"
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-center text-white hover:bg-emerald-600"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-center hover:bg-gray-50"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
