import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  try {
    const formData = await prisma.formData.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (formData) {
      return NextResponse.json(formData.data);
    } else {
      return NextResponse.json({ message: "Form data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error('Error retrieving form data:', error);
    return NextResponse.json({ message: "Error retrieving form data" }, { status: 500 });
  }
}