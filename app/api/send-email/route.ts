import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import sendgrid from '@sendgrid/mail';
import prisma from "@/lib/prisma";

// Since we can't find the module, let's mock it temporarily
// Later, you can properly implement or import this function
async function generatePDF(data: any): Promise<Buffer> {
  // This is a placeholder - in reality, you'd use a PDF generation library
  console.log('Generating PDF for data:', data);
  // Return an empty buffer for now
  return Buffer.from('PDF content would go here');
}

// Make sure to initialize sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { template, data, formId } = await req.json();
    
    // Log the received data
    console.log('Received template:', template);
    console.log('Received data:', data);

    // Read the email template
    const templatePath = join(process.cwd(), 'emails', `${template}.html`);
    let emailContent = readFileSync(templatePath, 'utf-8');

    // Format the offer data for the email
    const formattedOffer = {
      buyerName: data["name-buyer-0"],
      buyerAddress: data["address-buyer-0"],
      sellerName: data["name-seller-0"],
      sellerAddress: data["address-seller-0"],
      propertyAddress: data["property-address"],
      legalDescription: data["legal-land-description"] || "N/A",
      features: data["additional-features-text"] || "N/A",
      purchasePrice: Number(data["purchasePrice"] || 0).toLocaleString(),
      depositAmount: data["depositAmount"],
      depositMethod: data["depositMethod"],
      depositDueDate: data["depositDueDate"],
      escrowAgent: data["escrowAgentName"],
      acceptanceDeadline: data["acceptanceDeadline"],
      email: data["email"],
      offerDownloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-pdf?formId=${formId}`
    };

    // Replace placeholders with actual data
    Object.entries(formattedOffer).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      emailContent = emailContent.replace(placeholder, String(value));
    });

    // Generate the PDF
    const formData = await prisma.formData.findUnique({
      where: { id: formId }
    });
    
    if (!formData) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    
    const pdfBuffer = await generatePDF(formData.data);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Prepare the email
    const msg = {
      to: data.email || "visualsbysina@gmail.com", // Use the buyer's email if available
      from: process.env.SENDGRID_VERIFIED_EMAIL!,
      subject: 'Your Real Estate Offer is Ready!',
      html: emailContent,
      attachments: [
        {
          content: pdfBase64,
          filename: `Offer_for_${data["property-address"].replace(/\s+/g, '_')}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Send the email
    await sendgrid.send(msg);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}