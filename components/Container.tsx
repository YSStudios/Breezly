import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={`container p-8 mx-auto xl:px-0 ${
        className ? className : ""
      }`}
    >
      {children}
    </div>
  );
}
