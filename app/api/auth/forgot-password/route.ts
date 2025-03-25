import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with the API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_VERIFIED_EMAIL = process.env.SENDGRID_VERIFIED_EMAIL;

if (!SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set in environment variables');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if SendGrid API key is set
    if (!SENDGRID_API_KEY || !SENDGRID_VERIFIED_EMAIL) {
      console.error('Password reset request failed: SendGrid configuration is missing');
      return NextResponse.json(
        { message: 'Email service is not configured' },
        { status: 500 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json(
        { message: 'If your email exists in our system, you will receive a password reset link' },
        { status: 200 }
      );
    }
    
    // Generate reset token and expiry
    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Check if NEXT_PUBLIC_APP_URL is set
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (!appUrl) {
      console.warn('Password reset request warning: Neither NEXT_PUBLIC_APP_URL nor NEXT_PUBLIC_BASE_URL is set');
    }

    // Generate the reset URL
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
    
    // Store the reset token
    try {
      await prisma.verificationToken.create({
        data: {
          identifier: user.email as string,
          token: resetToken,
          expires,
        },
      });
    } catch (error) {
      console.error('Failed to store reset token:', error);
      return NextResponse.json(
        { message: 'An error occurred processing your request' },
        { status: 500 }
      );
    }
    
    // Send the reset email using SendGrid
    try {
      const msg = {
        to: email,
        from: SENDGRID_VERIFIED_EMAIL,
        subject: 'Reset your Breezly password',
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        `,
      };
      
      await sgMail.send(msg);
      console.log('Reset email sent successfully to:', email);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      // Don't return an error to the client for security reasons
    }
    
    return NextResponse.json(
      { message: 'If your email exists in our system, you will receive a password reset link' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
} 