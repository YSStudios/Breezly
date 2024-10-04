import localFont from "next/font/local";
import { Inter, Quicksand } from "next/font/google";

export const sfPro = localFont({
  src: "./SF-Pro-Display-Medium.otf",
  variable: "--font-sf",
});

export const argentCF = localFont({
	src: "./ArgentCF-Regular.ttf",
	variable: "--font-argent",
});

export const quicksand = Quicksand({
	variable: "--font-quicksand",
	subsets: ["latin"],
	weight: "500",
});
