"use client";

import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";

export default function VerifyRequest() {
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
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-emerald-100 p-6">
            <Icons.email className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm">
            A verification link has been sent to your email address. Please
            check your inbox and click the link to verify your account.
          </p>
        </div>
        <div className="grid gap-4">
          <p className="text-center text-sm text-gray-500">
            If you don&apos;t see the email, check your spam folder or contact
            support.
          </p>
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
