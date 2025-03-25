import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    console.log('Reset password request with token:', token.substring(0, 10) + '...');
    
    // Verify token is valid and has not expired
    try {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
      });
      
      if (!verificationToken) {
        console.log('Invalid token provided for reset password');
        return NextResponse.json(
          { message: 'Invalid or expired token' },
          { status: 400 }
        );
      }
      
      if (new Date() > verificationToken.expires) {
        console.log('Expired token provided for reset password');
        // Delete expired token
        await prisma.verificationToken.delete({
          where: { token },
        });
        
        return NextResponse.json(
          { message: 'Token has expired' },
          { status: 400 }
        );
      }
      
      // Find user associated with the token
      const user = await prisma.user.findUnique({
        where: { email: verificationToken.identifier },
      });
      
      if (!user) {
        console.log('User not found for token identifier:', verificationToken.identifier);
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user's password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      // Delete the used token
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      console.log('Password reset successful for user:', user.email);
      return NextResponse.json(
        { message: 'Password reset successful' },
        { status: 200 }
      );
    } catch (dbError) {
      console.error('Database error during password reset:', dbError);
      return NextResponse.json(
        { message: 'Database error during password reset' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting the password' },
      { status: 500 }
    );
  }
} 