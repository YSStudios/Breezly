// app/api/form/get.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ message: "Address is required" }, { status: 400 });
  }

  try {
    const formData = await prisma.formData.findUnique({
      where: {
        userId_address: {
          userId: session.user.id,
          address: address,
        },
      },
    });

    if (formData) {
      return NextResponse.json(formData);
    } else {
      return NextResponse.json({ message: "Form data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error('Error retrieving form data:', error);
    return NextResponse.json({ message: "Error retrieving form data" }, { status: 500 });
  }
}