// IMPORTANT: This endpoint should only be available in development mode
// It's created to help debug token issues with password reset 

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Only available in development mode" }, { status: 403 });
  }
  
  try {
    const body = await req.json();
    const { email, token } = body;
    
    if (!email || !token) {
      return NextResponse.json({ 
        message: "Email and token are required" 
      }, { status: 400 });
    }
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    console.log(`[DEBUG] Checking token for email: ${normalizedEmail}`);
    console.log(`[DEBUG] Received token (first 6 chars): ${token.substring(0, 6)}...`);
    
    // Hash the token for verification
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    
    console.log(`[DEBUG] Hashed token: ${hashedToken.substring(0, 6)}...`);
    
    // Look for all tokens for this user
    const allTokens = await prisma.verificationToken.findMany({
      where: { identifier: normalizedEmail }
    });
    
    // Look for the token using direct match approach
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: hashedToken
      }
    });
    
    // Generate a direct match check without email
    const directMatch = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken
      }
    });
    
    const response: {
      email: string;
      tokenCount: number;
      tokens: Array<{
        identifier: string;
        tokenPreview: string;
        expires: Date;
        isExpired: boolean;
        matchesProvidedToken: boolean;
      }>;
      standardLookupResult: {
        found: boolean;
        tokenPreview?: string;
        isExpired?: boolean;
      };
      directMatch: {
        found: boolean;
        identifier?: string;
        tokenPreview?: string;
        isExpired?: boolean;
      };
      guidance: string[];
    } = {
      email: normalizedEmail,
      tokenCount: allTokens.length,
      tokens: allTokens.map(t => ({
        identifier: t.identifier,
        tokenPreview: t.token.substring(0, 6) + '...',
        expires: t.expires,
        isExpired: t.expires < new Date(),
        matchesProvidedToken: t.token === hashedToken
      })),
      standardLookupResult: tokenRecord ? {
        found: true,
        tokenPreview: tokenRecord.token.substring(0, 6) + '...',
        isExpired: tokenRecord.expires < new Date()
      } : {
        found: false
      },
      directMatch: directMatch ? {
        found: true,
        identifier: directMatch.identifier,
        tokenPreview: directMatch.token.substring(0, 6) + '...',
        isExpired: directMatch.expires < new Date(),
      } : {
        found: false
      },
      // Provide guidance
      guidance: []
    };
    
    // Add helpful guidance based on findings
    if (allTokens.length === 0) {
      response.guidance.push("No tokens found for this email. Try requesting a new password reset.");
    }
    
    if (tokenRecord && tokenRecord.expires < new Date()) {
      response.guidance.push("Token has expired. Password reset links are valid for 1 hour.");
    }
    
    if (directMatch && directMatch.identifier !== normalizedEmail) {
      response.guidance.push("Token exists but is associated with a different email. Check the URL parameters.");
    }
    
    if (response.guidance.length === 0) {
      if (tokenRecord) {
        response.guidance.push("Token appears valid. Try the password reset again or check for other issues.");
      } else if (directMatch) {
        response.guidance.push("Token exists but is associated with a different email. Try requesting a new password reset.");
      } else {
        response.guidance.push("Token validation failed. Request a new password reset link.");
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Token debug error:", error);
    return NextResponse.json({ 
      message: "Error checking token",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 