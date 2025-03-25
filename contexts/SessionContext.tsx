import React, { createContext, useContext } from "react";
import { Session } from "next-auth";

interface SessionContextProps {
  session: Session | null;
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined,
);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
};
