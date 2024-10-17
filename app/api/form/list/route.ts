import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }

  try {
    const forms = await prisma.formData.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        data: true,
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error retrieving form list:', error);
    return NextResponse.json({ message: "Error retrieving form list" }, { status: 500 });
  }
}
