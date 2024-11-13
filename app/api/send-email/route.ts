import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { template, data } = await req.json();
    
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
      email: data["email"]
    };

    // Replace placeholders with actual data
    Object.entries(formattedOffer).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      emailContent = emailContent.replace(placeholder, String(value));
    });

    // Create the offer PDF and get its buffer
    // Note: You'll need to implement this part based on your PDF generation needs
    // const pdfBuffer = await generateOfferPDF(formattedOffer);

    // Prepare the email
    const msg = {
      to: "visualsbysina@gmail.com",
      from: process.env.SENDGRID_VERIFIED_EMAIL!,
      subject: 'Your Real Estate Offer is Ready!',
      html: emailContent,
      // Uncomment when PDF generation is implemented
      // attachments: [
      //   {
      //     content: pdfBuffer.toString('base64'),
      //     filename: 'real-estate-offer.pdf',
      //     type: 'application/pdf',
      //     disposition: 'attachment'
      //   }
      // ]
    };

    // Send the email using SendGrid
    await sgMail.send(msg);

    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.response ? error.response.body : error.message 
      },
      { status: 500 }
    );
  }
}