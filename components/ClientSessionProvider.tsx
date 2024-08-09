"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

interface ClientSessionProviderProps {
  children: ReactNode;
  session: any;
}

const ClientSessionProvider = ({ children, session }: ClientSessionProviderProps) => {
  useEffect(() => {
    console.log("ClientSessionProvider received session:", session);
  }, [session]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default ClientSessionProvider;