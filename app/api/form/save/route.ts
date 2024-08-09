import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	const { formId, data, userId } = await req.json();
  
	if (!formId || !data) {
	  return NextResponse.json({ message: "Form ID and data are required" }, { status: 400 });
	}
  
	try {
	  const formData = await prisma.formData.upsert({
		where: { id: formId },
		update: { 
		  data: data,
		  userId: session?.user?.id || userId || null,
		},
		create: {
		  id: formId,
		  data: data,
		  userId: session?.user?.id || userId || null,
		},
	  });
  
	  return NextResponse.json(formData);
	} catch (error) {
	  console.error('Error saving form data:', error);
	  return NextResponse.json({ message: "Error saving form data" }, { status: 500 });
	}
  }