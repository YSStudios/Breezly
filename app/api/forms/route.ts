import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      console.error("Unauthorized access attempt - no session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId, data } = await req.json();
    
    if (!formId) {
      console.error("Missing formId");
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    console.log("Creating form with ID:", formId);
    console.log("User ID:", session.user.id);
    console.log("Form data:", JSON.stringify(data || {}, null, 2));

    // Ensure data is an object
    const formData = data || {};
    
    // Ensure status is set
    if (!formData.status) {
      formData.status = "DRAFT";
    }

    // Create new form in database with all required fields
    const newForm = await prisma.formData.create({
      data: {
        id: formId,
        data: formData,
        userId: session.user.id,
      },
    });

    console.log("Form created successfully:", newForm.id);
    return NextResponse.json({ 
      success: true, 
      formId: newForm.id 
    });

  } catch (error) {
    console.error("Error creating form:", error);
    // More detailed error response
    let errorMessage = "Failed to create form";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
          errorMessage = "A form with this ID already exists";
          statusCode = 409;
        } else if (prismaError.code === 'P2003') {
          errorMessage = "The provided user ID does not exist";
          statusCode = 400;
        }
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 