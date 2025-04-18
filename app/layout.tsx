import React, { Suspense } from "react";
import "./globals.css";
import cx from "classnames";
import { sfPro, argentCF, quicksand } from "./fonts";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import { getServerSession } from "next-auth/next";
import { CartProvider } from "contexts/CartContext";
import ReduxProvider from "@/components/providers/ReduxProvider";

export const metadata = {
  title: "Breezly - Send real estate offers quick and easy",
  description:
    "Breezly is a completely self-powered real-estate offer writing platform. Save thousands and get your real-estate offer sent quickly and easily.",
  metadataBase: new URL("https://www.breezly.co"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body
        className={cx(sfPro.variable, argentCF.variable, quicksand.variable)}
      >
        <ReduxProvider>
          <ClientSessionProvider session={session}>
            <CartProvider>
              <Suspense fallback="...">
                <Nav />
              </Suspense>
              <main className="flex w-full flex-col items-center justify-center pt-24">
                {children}
              </main>
              <Footer />
              <VercelAnalytics />
            </CartProvider>
          </ClientSessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
