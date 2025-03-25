import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
          throw new Error("Email and password are required");
        }
        
        console.log(`Auth attempt for email: ${credentials.email.substring(0, 3)}...`);
        
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            console.log("No user found with this email");
            throw new Error("No user found with this email");
          }
          
          if (!user.password) {
            console.log("User exists but has no password (social login only)");
            throw new Error("Please use Google to sign in");
          }
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            console.log("Invalid password provided");
            throw new Error("Invalid password");
          }
          
          console.log("Authentication successful");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    error: '/', // Redirect to home page on error
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error(`NextAuth error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`NextAuth debug: ${code}`, metadata);
    },
  },
};
