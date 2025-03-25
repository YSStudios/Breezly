import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Provider } from "next-auth/providers";

// Define providers array with the ones that will always be available
const providers: Provider[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  }),
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }
      
      // Normalize email to lowercase
      const normalizedEmail = credentials.email.toLowerCase();
      
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      
      if (!user || !user.password) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
      
      if (!isPasswordValid) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

// Add Apple provider if credentials are available
if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // You can add other user properties here if needed
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Default redirect logic - move this up to avoid potential issues
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Don't try to do any complex logic in redirect to avoid loading issues
      // Just return the baseUrl as a safe fallback
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      // You can add logging or analytics here
      console.log("User signed in:", user.email);
    },
    async signOut() {
      // Clean up on sign out if needed
      console.log("User signed out");
    },
  },
  debug: process.env.NODE_ENV === "development",
};
