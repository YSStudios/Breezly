import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { jsPDF } from "jspdf";

/**
 * Generates a PDF from form data using jsPDF
 * @param data The form data object
 * @returns Buffer containing the PDF
 */
async function generatePDF(data: any): Promise<Buffer> {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('Real Estate Purchase Offer', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray color
    doc.text(`Document ID: ${data.id || 'N/A'}`, 105, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });
    
    // Define starting y position for content
    let y = 45;
    const lineHeight = 7;
    const sectionSpacing = 10;
    const leftMargin = 20;
    const pageWidth = 210 - 40; // A4 width minus margins
    
    // Helper function to add field with label
    const addField = (label: string, value: string | undefined, indent = 0) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(label, leftMargin + indent, y);
      
      doc.setFont('helvetica', 'normal');
      const valueText = value || 'N/A';
      
      // Handle long text with wrapping
      if (valueText.length > 60) {
        const splitText = doc.splitTextToSize(valueText, pageWidth - indent - 40);
        doc.text(splitText, leftMargin + indent + 40, y);
        y += (splitText.length - 1) * 5; // Adjust y position based on number of lines
      } else {
        doc.text(valueText, leftMargin + indent + 40, y);
      }
      
      y += lineHeight;
      
      // Check for page overflow and add new page if needed
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    };
    
    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      y += sectionSpacing;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175); // Darker blue
      doc.text(title, leftMargin, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, y + 2, 190, y + 2);
      y += lineHeight;
    };
    
    // Property Information Section
    addSectionHeader('Property Information');
    addField('Property Address:', data["property-address"]);
    addField('Purchase Price:', data.purchasePrice ? `$${Number(data.purchasePrice).toLocaleString()}` : undefined);
    addField('Closing Date:', data.closingDate);
    
    // Buyer Information Section
    addSectionHeader('Buyer Information');
    addField('Buyer Name:', `${data.buyerFirstName || ''} ${data.buyerLastName || ''}`);
    addField('Email:', data.buyerEmail);
    addField('Phone:', data.buyerPhone);
    addField('Current Address:', data.buyerAddress);
    
    // Offer Details Section
    addSectionHeader('Offer Details');
    addField('Earnest Money Deposit:', data.earnestMoney ? `$${Number(data.earnestMoney).toLocaleString()}` : undefined);
    addField('Financing Type:', data.financingType);
    addField('Loan Amount:', data.loanAmount ? `$${Number(data.loanAmount).toLocaleString()}` : undefined);
    addField('Down Payment:', data.downPayment ? `$${Number(data.downPayment).toLocaleString()}` : undefined);
    
    // Contingencies & Terms Section
    addSectionHeader('Contingencies & Terms');
    if (data.inspectionContingency) {
      addField('Inspection Contingency:', `Yes, ${data.inspectionDays || 'N/A'} days`);
    }
    if (data.financingContingency) {
      addField('Financing Contingency:', `Yes, ${data.financingDays || 'N/A'} days`);
    }
    if (data.appraisalContingency) {
      addField('Appraisal Contingency:', `Yes, ${data.appraisalDays || 'N/A'} days`);
    }
    addField('Special Terms:', data.specialTerms || 'None');
    
    // Additional Information Section
    addSectionHeader('Additional Information');
    addField('Additional Comments:', data.additionalComments || 'None');
    
    // Add footer
    y = 270;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This document is a legally binding contract. Please consult with a real estate attorney before signing.', 105, y, { align: 'center' });
    doc.text(`Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, y + 5, { align: 'center' });
    
    // Get PDF as buffer
    const pdfOutput = doc.output('arraybuffer');
    return Buffer.from(pdfOutput);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
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

    // Generate PDF with all form data
    const pdfBuffer = await generatePDF({
      id: formData.id,
      ...formDataObj
    });
    
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

    // Generate PDF with all form data
    const pdfBuffer = await generatePDF({
      id: formData.id,
      ...formDataObj
    });
    
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