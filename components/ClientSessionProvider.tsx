"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface ClientSessionProviderProps {
  children: ReactNode;
  session: any; // Adjust this type as needed
}

const ClientSessionProvider = ({ children, session }: ClientSessionProviderProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default ClientSessionProvider;
