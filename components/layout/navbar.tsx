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
        className={`fixed top-0 flex w-full justify-center ${
          scrolled
            ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
        <Container className="py-2">
          <div className="flex h-16 w-full items-center justify-between">
            <Link href="/" className="flex items-center font-display text-2xl">
              <Image
                src="/breezlylogo-green.svg"
                alt="OfferApp"
                width="200"
                height="50"
                className="mr-2 rounded-sm"
              ></Image>
            </Link>

            <div className="flex items-center">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="mr-4 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Dashboard
                  </Link>
                  <UserDropdown session={session} />
                </>
              ) : (
                <button
                  className="rounded-md bg-emerald-500 px-8 py-2 text-center text-lg font-medium text-white"
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
