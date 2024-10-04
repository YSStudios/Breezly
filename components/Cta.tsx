import React from "react";
import { Container } from "@/components/Container";

export const Cta = () => {
  return (
    <Container>
      <div className="relative flex flex-wrap items-center justify-between w-full max-w-4xl gap-5 mx-auto text-white bg-slate-100 px-7 py-7 lg:px-12 lg:py-12 lg:flex-nowrap rounded-xl">
        <div className="flex-grow text-center lg:text-left">
          <h2 className="text-2xl text-gray-600 font-medium lg:text-3xl">
            Ready to create your offer?
          </h2>
          <p className="mt-2 font-medium text-gray-600 text-opacity-90 lg:text-xl">
            Don&apos;t let agents tell you what to do.
          </p>
        </div>
        <div className="flex-shrink-0 w-full text-center lg:w-auto">
          <a
            href="https://github.com/web3templates"
            target="_blank"
            rel="noopene noreferrer"
            className="inline-block transform rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-10 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Get Started
          </a>
        </div>
      </div>
    </Container>
  );
};
