import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "You must be logged in with a valid user ID." }, { status: 401 });
  }

  try {
    const { data } = await req.json();

    const formData = await prisma.formData.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        data: data,
      },
      create: {
        userId: session.user.id,
        data: data,
      },
    });

    return NextResponse.json(formData);
  } catch (error) {
    console.error('Error saving form data:', error);
    return NextResponse.json({ message: "Error saving form data", error: error }, { status: 500 });
  }
}