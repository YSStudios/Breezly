import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

// route.ts (GET /api/form/list)
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const formId = searchParams.get('id');
  
	if (!formId) {
	  return NextResponse.json({ message: "Form ID is required" }, { status: 400 });
	}
  
	try {
	  const formData = await prisma.formData.findUnique({
		where: { id: formId },
		select: { data: true },
	  });
  
	  if (formData) {
		return NextResponse.json(formData.data);
	  } else {
		return NextResponse.json({ message: "Form not found" }, { status: 404 });
	  }
	} catch (error) {
	  console.error('Error retrieving form data:', error);
	  return NextResponse.json({ message: "Error retrieving form data" }, { status: 500 });
	}
  }
  