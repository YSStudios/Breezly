import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

// Since we can't find the module, let's mock it temporarily
// Later, you can properly implement or import this function
async function generatePDF(data: any): Promise<Buffer> {
  // This is a placeholder - in reality, you'd use a PDF generation library
  console.log('Generating PDF for data:', data);
  // Return an empty buffer for now
  return Buffer.from('PDF content would go here');
}

// Support both POST and GET methods
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { formId } = await req.json();
    
    if (!formId) {
      return NextResponse.json({ error: "Form ID required" }, { status: 400 });
    }

    // Get form data from database
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });

    if (!formData) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if the user has paid for this offer
    const formDataObj = formData.data as any;
    if (!formDataObj.paymentStatus || formDataObj.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }

    // Generate PDF (server-side implementation)
    const pdfBuffer = await generatePDF(formDataObj);
    
    // Return the PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Offer_${formDataObj["property-address"]?.replace(/\s+/g, '_') || 'Document'}.pdf"`
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const formId = url.searchParams.get("formId");
    
    if (!formId) {
      return NextResponse.json({ error: "Form ID required" }, { status: 400 });
    }

    // Get form data from database
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });

    if (!formData) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if the user has paid for this offer
    const formDataObj = formData.data as any;
    if (!formDataObj.paymentStatus || formDataObj.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment required" }, { status: 403 });
    }

    // Generate PDF (server-side implementation)
    const pdfBuffer = await generatePDF(formDataObj);
    
    // Return the PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Offer_${formDataObj["property-address"]?.replace(/\s+/g, '_') || 'Document'}.pdf"`
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF" },
      { status: 500 }
    );
  }
} 