import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    providers: {
      google: {
        configured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      },
      apple: {
        configured: !!process.env.APPLE_ID && !!process.env.APPLE_SECRET,
      },
    },
    nextauth: {
      url: process.env.NEXTAUTH_URL || 'Not configured',
      secret: !!process.env.NEXTAUTH_SECRET,
      jwt_secret: !!process.env.JWT_SECRET,
    },
    environment: process.env.NODE_ENV,
  });
} 