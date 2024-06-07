"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";
import { Session } from "next-auth";
import { Container } from "../Container";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);

  return (
    <>
      <SignInModal />
      <div
        className={`fixed top-0 w-full flex justify-center ${
          scrolled
            ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
		<Container className="py-2">
        <div className="flex h-16 items-center justify-between w-full">
          <Link href="/" className="flex items-center font-display text-2xl dark:text-white">
            <Image
              src="/applogo.webp"
              alt="OfferApp"
              width="30"
              height="30"
              className="mr-2 rounded-sm"
            ></Image>
            <p>OfferApp</p>
          </Link>
          <div>
            {session ? (
              <UserDropdown session={session} />
            ) : (
              <button
                className="px-8 py-2 text-lg font-medium text-center text-white bg-emerald-500 rounded-md"
                onClick={() => setShowSignInModal(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
		</Container>
      </div>
    </>
  );
}
