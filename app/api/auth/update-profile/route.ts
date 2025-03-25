import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/options";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Profile update schema for validation
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function PUT(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ 
        message: "Unauthorized" 
      }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: validation.error.errors 
      }, { status: 400 });
    }
    
    const { name } = validation.data;
    
    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ 
      message: "Error updating profile" 
    }, { status: 500 });
  }
} 