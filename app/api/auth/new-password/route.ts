import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// New password schema for validation
const newPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("Received password reset request with token");
    
    // Validate request data
    const validation = newPasswordSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors);
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      }, { status: 400 });
    }
    
    const { email, token, password } = validation.data;
    
    // Debug token received (first 6 chars only for security)
    console.log(`Received token (first 6 chars): ${token.substring(0, 6)}...`);
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    console.log(`Processing password reset for email: ${normalizedEmail}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log(`User with email ${normalizedEmail} not found`);
      return NextResponse.json({ 
        message: "Invalid or expired token" 
      }, { status: 400 });
    }

    console.log(`Found user: ${user.id}`);

    // Hash the token for verification
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    
    console.log(`Hashed received token (first 6 chars): ${hashedToken.substring(0, 6)}...`);
    console.log("Looking for token in database...");

    // Check all verification tokens for debugging purposes
    const allTokens = await prisma.verificationToken.findMany({
      where: { identifier: normalizedEmail }
    });
    
    console.log(`Found ${allTokens.length} token records for this email`);
    
    for (const t of allTokens) {
      console.log(`Token record: id=${t.identifier}, token=${t.token.substring(0, 6)}..., expires=${t.expires}`);
    }

    // Get the reset token from database - look directly for the hashed token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: hashedToken
      }
    });

    // Output debug info about the token
    if (!tokenRecord) {
      console.log("No token record found with matching hash");
      
      // Additional debugging - check if there's a token with this hash directly
      const directTokenMatch = await prisma.verificationToken.findFirst({
        where: { token: hashedToken }
      });
      
      if (directTokenMatch) {
        console.log(`Found token directly by hash, but identifier was: ${directTokenMatch.identifier}`);
      } else {
        console.log("No token found with this hash in the entire database");
      }
      
      return NextResponse.json({ 
        message: "Invalid or expired token" 
      }, { status: 400 });
    }

    console.log(`Token record found, expires: ${tokenRecord.expires}`);
    console.log(`Current time: ${new Date()}`);
    console.log(`Stored token (first 6 chars): ${tokenRecord.token.substring(0, 6)}...`);
    
    // Check if token is expired
    if (tokenRecord.expires < new Date()) {
      console.log("Token has expired");
      return NextResponse.json({ 
        message: "Invalid or expired token" 
      }, { status: 400 });
    }

    console.log("Token is valid, updating password");

    // Generate a secure salt and hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log("Password updated successfully");

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: normalizedEmail,
          token: hashedToken
        }
      }
    });

    console.log("Token deleted");

    return NextResponse.json({ 
      message: "Password updated successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("New password error:", error);
    return NextResponse.json({ 
      message: "Error updating password" 
    }, { status: 500 });
  }
} 