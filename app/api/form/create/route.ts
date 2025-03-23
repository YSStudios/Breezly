import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Check if the user is authenticated
  if (!session || !session.user || !session.user.id) {
    console.error('Unauthorized access attempt to create form');
    return NextResponse.json({ message: "Unauthorized. Please log in to create a form." }, { status: 401 });
  }

  const { id, data } = await req.json();
  
  console.log('Attempting to create form with ID:', id);
  console.log('Initial form data:', JSON.stringify(data, null, 2));
  
  if (!id) {
    console.error('Form ID is missing');
    return NextResponse.json({ message: "Form ID is required" }, { status: 400 });
  }
  
  try {
    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error('User not found in database:', session.user.id);
      return NextResponse.json({ message: "User not found. Please try logging in again." }, { status: 404 });
    }

    // Create a new form entry
    const formData = await prisma.formData.create({
      data: {
        id: id,
        data: data || { status: "DRAFT" },
        userId: user.id,
      },
    });
  
    console.log('Form created successfully:', JSON.stringify(formData, null, 2));
    return NextResponse.json({
      message: "Form created successfully",
      formId: formData.id,
      data: formData.data
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating form:', error.message);
      // Check for duplicate ID error
      if ('code' in error && (error as any).code === 'P2002') {
        return NextResponse.json({ message: "A form with this ID already exists." }, { status: 400 });
      }
      // Check for foreign key constraint error
      if ('code' in error && (error as any).code === 'P2003') {
        return NextResponse.json({ message: "Error creating form: User not found in the database." }, { status: 400 });
      }
      return NextResponse.json({ message: "Error creating form data", error: error.message }, { status: 500 });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ message: "An unknown error occurred while creating the form." }, { status: 500 });
    }
  }
} 