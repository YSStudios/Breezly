import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { formId, data } = await req.json();

    // Create new form in database
    const newForm = await prisma.formData.create({
      data: {
        id: formId,
        data: {
          ...data,
          status: "DRAFT"
        },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      formId: newForm.id 
    });

  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
} 