"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LayoutDashboard, LogOut } from "lucide-react";
import Popover from "@/components/shared/popover";
import Image from "next/image";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { getInitialsAvatar } from "@/lib/utils";

export default function UserDropdown({ session }: { session: Session }) {
  const { email, image, name } = session?.user || {};
  const [openPopover, setOpenPopover] = useState(false);
  const router = useRouter();

  if (!email) return null;

  // Generate avatar using our utility function for initials-based avatars
  const avatarUrl = getInitialsAvatar(name || email, image);

  return (
    <div className="relative inline-block text-left">
      <Popover
        content={
          <div className="w-full rounded-md bg-white p-2 sm:w-56">
            <div className="p-2">
              {session?.user?.name && (
                <p className="truncate text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
              )}
              <p className="truncate text-sm text-gray-500">
                {session?.user?.email}
              </p>
            </div>
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              <p className="text-sm">Dashboard</p>
            </button>
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={() =>
                signOut({ redirect: false }).then(() =>
                  window.location.reload(),
                )
              }
            >
              <LogOut className="h-4 w-4" />
              <p className="text-sm">Logout</p>
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-9 sm:w-9"
        >
          <Image alt={email} src={avatarUrl} width={40} height={40} />
        </button>
      </Popover>
    </div>
  );
}
