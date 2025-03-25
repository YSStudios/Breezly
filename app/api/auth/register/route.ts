import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Registration schema for validation
const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request data
    const validation = registrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      }, { status: 400 });
    }
    
    const { email, password, name } = validation.data;
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "User already exists with this email" 
      }, { status: 400 });
    }

    // Hash password with strong salt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || null,
      },
    });

    // Create a safe user object without the password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      image: user.image
    };

    return NextResponse.json({ 
      message: "User registered successfully",
      user: userWithoutPassword
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ 
      message: "Error creating user" 
    }, { status: 500 });
  }
} 