import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  console.log('Session:', JSON.stringify(session, null, 2));

  // Check if the user is authenticated
  if (!session || !session.user || !session.user.id) {
    console.error('Unauthorized access attempt');
    return NextResponse.json({ message: "Unauthorized. Please log in to save the form." }, { status: 401 });
  }

  const { formId, data } = await req.json();
  
  console.log('Attempting to save form with ID:', formId);
  console.log('Form data:', JSON.stringify(data, null, 2));
  console.log('Session user:', JSON.stringify(session.user, null, 2));
  
  if (!formId || !data) {
    console.error('Form ID or data is missing');
    return NextResponse.json({ message: "Form ID and data are required" }, { status: 400 });
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

    const formData = await prisma.formData.upsert({
      where: { id: formId },
      update: { 
        data: data,
        userId: user.id,
      },
      create: {
        id: formId,
        data: data,
        userId: user.id,
      },
    });
  
    console.log('Form saved successfully:', JSON.stringify(formData, null, 2));
    return NextResponse.json({
      message: "Form saved successfully",
      formId: formData.id,
      data: formData.data
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Error saving form: User not found in the database.", error: error.toString() }, { status: 400 });
    }
    return NextResponse.json({ message: "Error saving form data", error: error.toString() }, { status: 500 });
  }
}