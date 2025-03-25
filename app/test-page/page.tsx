"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function TestPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Test Page</h1>
      <p className="mb-4">
        This is a simple test page to check if client-side rendering is working.
      </p>
      <p className="mb-4">Rendered on: {isClient ? "Client" : "Server"}</p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Home
        </Link>
        <Link
          href="/auth/signin"
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Sign In Page
        </Link>
      </div>
    </div>
  );
}
