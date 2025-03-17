import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }
  
  const url = new URL(req.url);
  const formId = url.searchParams.get("formId");
  
  if (!formId) {
    return NextResponse.json({ message: "Form ID is required" }, { status: 400 });
  }
  
  try {
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });
    
    if (!formData) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }
    
    // Check if the form has payment data
    const formDataObj = formData.data as any;
    const isPurchased = 
      formDataObj.paymentStatus === "PAID" && 
      formDataObj.paymentId !== undefined;
    
    return NextResponse.json({ isPurchased });
  } catch (error) {
    console.error("Error checking purchase status:", error);
    return NextResponse.json(
      { message: "Error checking purchase status" }, 
      { status: 500 }
    );
  }
}

// Add POST method to mark a form as purchased (for testing only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  }
  
  try {
    // Get formId from query params
    const url = new URL(req.url);
    const formId = url.searchParams.get("formId");
    
    if (!formId) {
      return NextResponse.json({ message: "Form ID is required" }, { status: 400 });
    }
    
    // Get request body
    const body = await req.json();
    const markAsPurchased = body.markAsPurchased === true;
    
    if (!markAsPurchased) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    
    // Get the form
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });
    
    if (!formData) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }
    
    // Mark as purchased
    const updatedForm = await prisma.formData.update({
      where: { id: formId },
      data: {
        data: {
          ...(formData.data as any),
          paymentStatus: "PAID",
          paymentId: `test_payment_${Date.now()}`,
          purchasedAt: new Date().toISOString()
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Form marked as purchased", 
      formId,
      isPurchased: true
    });
  } catch (error) {
    console.error("Error marking form as purchased:", error);
    return NextResponse.json(
      { success: false, message: "Error marking form as purchased" }, 
      { status: 500 }
    );
  }
} 