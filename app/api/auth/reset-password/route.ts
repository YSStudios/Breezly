import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("SendGrid API key configured");
} else {
  console.error("SENDGRID_API_KEY is not set in environment variables");
}

// Reset password schema for validation
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request data
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      }, { status: 400 });
    }
    
    const { email } = validation.data;
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    console.log(`Processing password reset for email: ${normalizedEmail}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(`User with email ${normalizedEmail} not found`);
      return NextResponse.json({ 
        message: "If an account exists with this email, a password reset link has been sent." 
      }, { status: 200 });
    }

    console.log(`Found user: ${user.id} (${user.email})`);

    // Generate a secure token - using 32 bytes for security
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log(`Generated token: ${resetToken.substring(0, 6)}...`); // Only log part of the token for security
    
    // Hash the token for storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log(`Hashed token for storage: ${hashedToken.substring(0, 6)}...`);

    // Save the token in database with expiry time (1 hour)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    try {
      // First, delete any existing tokens for this user
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: user.email as string
        }
      });
      console.log("Deleted any existing tokens for this user");
      
      // Create new token
      await prisma.verificationToken.create({
        data: {
          identifier: user.email as string,
          token: hashedToken,
          expires: tokenExpiry,
        }
      });
      
      console.log("Verification token stored in database");
    } catch (error) {
      console.error("Error storing verification token:", error);
      return NextResponse.json({ 
        message: "Error processing password reset" 
      }, { status: 500 });
    }

    // Construct the reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/new-password?token=${resetToken}&email=${encodeURIComponent(
      user.email as string
    )}`;
    console.log(`Reset URL generated: ${resetUrl.substring(0, baseUrl.length + 30)}...`); // Only log part of the URL for security

    // Make sure required environment variables exist
    if (!process.env.EMAIL_FROM) {
      console.error("EMAIL_FROM is not configured in environment variables");
      return NextResponse.json({ 
        message: "Server configuration error" 
      }, { status: 500 });
    }

    // Define email content
    const msg = {
      to: user.email as string,
      from: process.env.EMAIL_FROM as string,
      subject: "Reset Your Password",
      text: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}. The link expires in 1 hour.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello${user.name ? ` ${user.name}` : ""},</p>
          <p>You requested a password reset. Please click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>Breezly Team</p>
        </div>
      `,
    };

    // Send the email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send(msg);
        console.log(`Password reset email sent successfully to: ${user.email}`);
      } catch (error) {
        console.error("SendGrid error:", error);
        // Don't expose email sending failures to the client for security reasons
        return NextResponse.json({ 
          message: "If an account exists with this email, a password reset link has been sent." 
        }, { status: 200 });
      }
    } else {
      console.log("SendGrid not configured. Would have sent:", resetUrl);
      // In development, we could return the reset URL directly to make testing easier
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ 
          message: "Password reset link generated (SendGrid not configured)",
          resetUrl: resetUrl  // Only return this in development
        }, { status: 200 });
      }
    }

    return NextResponse.json({ 
      message: "If an account exists with this email, a password reset link has been sent." 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ 
      message: "Error processing password reset" 
    }, { status: 500 });
  }
} 