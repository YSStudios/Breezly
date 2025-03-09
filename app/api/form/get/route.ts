import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('id');

    console.log('Attempting to retrieve form with ID:', formId);
    console.log('User session:', session?.user?.id);

    if (!formId) {
      console.error('Form ID is missing in the request');
      return NextResponse.json({ message: "Form ID is required" }, { status: 400 });
    }

    // Get the form data
    const formData = await prisma.formData.findUnique({
      where: { id: formId },
    });

    if (!formData) {
      console.error('Form not found for ID:', formId);
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    // Check if the user has permission to access this form
    if (session?.user?.id && formData.userId !== session.user.id) {
      console.error('User does not have permission to access this form', {
        userId: session.user.id,
        formUserId: formData.userId
      });
      return NextResponse.json({ message: "You don't have permission to access this form" }, { status: 403 });
    }

    console.log('Form data retrieved successfully');
    console.log('Form data structure:', {
      id: formData.id,
      userId: formData.userId,
      createdAt: formData.createdAt,
      dataKeys: Object.keys(formData.data as object || {})
    });
    
    // Ensure we're returning the data in a consistent format
    if (formData.data && typeof formData.data === 'object') {
      // Return actual form data with some metadata
      return NextResponse.json({
        ...formData.data,
        _form_id: formData.id, // Add the ID to the data for reference
        _created_at: formData.createdAt
      });
    } else {
      // If there's an issue with the data structure, log it and return a more predictable format
      console.warn('Form data has unexpected structure:', formData);
      return NextResponse.json({ 
        status: "DRAFT",
        createdAt: formData.createdAt,
        id: formData.id
      });
    }
  } catch (error) {
    console.error('Error retrieving form data:', error);
    return NextResponse.json({ 
      message: "Error retrieving form data", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}