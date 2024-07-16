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
      select: {
        id: true,
        updatedAt: true,
        data: true,
      },
    });

    if (formData) {
      // Assuming data contains some identifiable information like a title or name
      const formList = [{
        id: formData.id,
        updatedAt: formData.updatedAt,
      }];
      return NextResponse.json(formList);
    } else {
      return NextResponse.json([]); // Return an empty array if no form data found
    }
  } catch (error) {
    console.error('Error retrieving form list:', error);
    return NextResponse.json({ message: "Error retrieving form list" }, { status: 500 });
  }
}