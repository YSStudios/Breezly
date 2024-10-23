"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";
import { Session } from "next-auth";
import { Container } from "../Container";
import CartPullout from "../Cartpullout";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "contexts/CartContext";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, updateCart } = useCart();

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await updateCart();
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <>
      <SignInModal />
      <CartPullout isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
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
                src="/breezlylogo.svg"
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
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative mr-4 p-2 text-gray-600 hover:text-gray-900"
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
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
