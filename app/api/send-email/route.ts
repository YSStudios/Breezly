import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import sendgrid from '@sendgrid/mail';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

// Make sure to initialize sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { template, data, formId } = await req.json();
    
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    
    // Log the received data
    console.log('Received template:', template);
    console.log('Received data:', { 
      ...data, 
      propertyAddress: data["property-address"],
      senderEmail: data.senderEmail
    });
    console.log('Session email:', sessionEmail);

    // Validate required data
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    if (!data.email) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
    }
    
    // Extract form creator's email from various possible field names
    const formCreatorEmail = data["email"] || data["creator_email"] || data["user_email"] || "";
    
    // Use session email, fallback to form creator's email
    let senderEmail = sessionEmail || formCreatorEmail || "";
    console.log('Using sender email for confirmation:', senderEmail);
    
    // Read the email template for recipient
    try {
      const recipientTemplatePath = join(process.cwd(), 'emails', `${template}.html`);
      var recipientEmailTemplate = readFileSync(recipientTemplatePath, 'utf-8');
    } catch (error) {
      console.error('Error reading email template:', error);
      return NextResponse.json({ 
        error: 'Failed to read email template',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Format the offer data for the email - FOR RECIPIENT
    const recipientFormattedOffer = {
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
      offerDownloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-pdf?formId=${formId}`,
      
      // Add summary section for the email
      offerSummary: `
        <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Offer Summary</h3>
          <p><strong>Property:</strong> ${data["property-address"] || "N/A"}</p>
          <p><strong>Purchase Price:</strong> $${Number(data["purchasePrice"] || 0).toLocaleString()}</p>
          <p><strong>Buyer:</strong> ${data["name-buyer-0"] || "N/A"}</p>
          <p><strong>Seller:</strong> ${data["name-seller-0"] || "N/A"}</p>
          <p><strong>Deposit Amount:</strong> $${data["depositAmount"] || "N/A"}</p>
          <p><strong>Closing Date:</strong> ${data["closingDate"] || "N/A"}</p>
          <p><strong>Acceptance Deadline:</strong> ${data["acceptanceDeadline"] || "N/A"}</p>
        </div>
      `,
      
      // Add custom message if provided
      customMessage: data.message 
        ? `<div style="padding: 15px; border-left: 4px solid #187ffd; margin-bottom: 20px;">
            <p style="margin: 0; font-style: italic;">${data.message}</p>
          </div>`
        : '',
        
      // Empty string for recipient (they don't need the sender confirmation)
      senderConfirmation: ''
    };

    // Prepare the recipient email content
    let recipientEmailContent = recipientEmailTemplate;
    Object.entries(recipientFormattedOffer).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      recipientEmailContent = recipientEmailContent.replace(placeholder, String(value || ''));
    });

    // Get the form data
    try {
      var formData = await prisma.formData.findUnique({
        where: { id: formId },
        include: {
          user: true // Include the associated user
        }
      });
      
      if (!formData) {
        return NextResponse.json({ error: "Form not found" }, { status: 404 });
      }

      // If we don't have a sender email yet but the form has an associated user
      if (!senderEmail && formData.user?.email) {
        const userEmail = formData.user.email;
        console.log('Found user email from form association:', userEmail);
        // Use this as the sender email
        senderEmail = userEmail;
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to retrieve form data',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
    // Create PDF attachment
    let pdfAttachment;
    try {
      const pdfBuffer = Buffer.from(`
Real Estate Offer

Property: ${data["property-address"] || "N/A"}
Purchase Price: $${Number(data["purchasePrice"] || 0).toLocaleString()}
Buyer: ${data["name-buyer-0"] || "N/A"}
Seller: ${data["name-seller-0"] || "N/A"}
Closing Date: ${data["closingDate"] || "N/A"}
Acceptance Deadline: ${data["acceptanceDeadline"] || "N/A"}

This is a placeholder PDF. In production, a properly formatted PDF would be attached.
      `);
      
      pdfAttachment = {
        content: pdfBuffer.toString('base64'),
        filename: `Offer_for_${data["property-address"]?.replace(/\s+/g, '_') || 'Property'}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      };
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      pdfAttachment = null;
    }

    // Send emails
    try {
      // Track email sending status
      let recipientEmailSent = false;
      let senderEmailSent = false;
      
      // 1. First send to the recipient
      const recipientMsg = {
        to: data.email,
        from: process.env.SENDGRID_VERIFIED_EMAIL || 'info@breezly.co',
        subject: `Real Estate Offer for ${data["property-address"] || 'Property'}`,
        html: recipientEmailContent,
        attachments: pdfAttachment ? [pdfAttachment] : []
      };
      
      try {
        await sendgrid.send(recipientMsg);
        console.log(`✅ Successfully sent offer email to recipient: ${data.email}`);
        recipientEmailSent = true;
      } catch (recipientError: any) {
        console.error(`❌ Failed to send email to recipient ${data.email}:`, recipientError);
        if (recipientError.response) {
          console.error('SendGrid recipient error details:', recipientError.response.body);
        }
      }
      
      // 2. Then send confirmation to the sender if we have their email
      if (senderEmail) {
        // Create sender confirmation content
        const senderSubject = 'Your Real Estate Offer Has Been Sent';
        const senderContent = `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding-bottom: 20px;">
              <img src="http://cdn.mcauto-images-production.sendgrid.net/2e3126f924a8a1bb/6c5b913d-26bc-4435-b672-9d53a73e14e8/3162x879.png" alt="Breezly Logo" style="max-width: 200px;">
            </div>
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #187ffd; text-align: center; margin-top: 0;">Your Offer Has Been Sent!</h2>
              <p style="margin-bottom: 20px; text-align: center;">Your offer for the property at ${data["property-address"] || 'N/A'} has been successfully sent to <strong>${data.email}</strong>.</p>
              
              <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Offer Summary</h3>
                <p><strong>Property:</strong> ${data["property-address"] || "N/A"}</p>
                <p><strong>Purchase Price:</strong> $${Number(data["purchasePrice"] || 0).toLocaleString()}</p>
                <p><strong>Buyer:</strong> ${data["name-buyer-0"] || "N/A"}</p>
                <p><strong>Seller:</strong> ${data["name-seller-0"] || "N/A"}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-pdf?formId=${formId}`}" 
                   style="background-color: #187ffd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                   Download Your Offer
                </a>
              </div>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>© Breezly - Real Estate Offer Platform</p>
            </div>
          </div>
        `;
        
        // Send confirmation to the sender
        const senderMsg = {
          to: senderEmail,
          from: process.env.SENDGRID_VERIFIED_EMAIL || 'info@breezly.co',
          subject: senderSubject,
          html: senderContent,
          attachments: pdfAttachment ? [pdfAttachment] : []
        };
        
        try {
          console.log(`Attempting to send confirmation email to sender: ${senderEmail}`);
          await sendgrid.send(senderMsg);
          console.log(`✅ Successfully sent confirmation email to sender: ${senderEmail}`);
          senderEmailSent = true;
        } catch (senderError: any) {
          console.error(`❌ Failed to send email to sender ${senderEmail}:`, senderError);
          if (senderError.response) {
            console.error('SendGrid sender error details:', senderError.response.body);
          }
        }
      } else {
        console.log('⚠️ No sender email provided, skipping confirmation email');
      }
      
      // Return response based on email sending status
      if (recipientEmailSent && senderEmailSent) {
        // Update form status to PENDING in the database
        try {
          const currentData = formData.data as Record<string, any>;
          await prisma.formData.update({
            where: { id: formId },
            data: {
              data: {
                ...currentData,
                status: "PENDING",
                emailedTo: data.email,
                emailedAt: new Date().toISOString()
              }
            }
          });
          console.log(`✅ Form ${formId} marked as PENDING after email sent`);
        } catch (updateError) {
          console.error('Error updating form status to PENDING:', updateError);
          // Continue with the response even if the status update fails
        }
        
        return NextResponse.json({ success: true, message: "Both recipient and sender emails sent successfully" });
      } else if (recipientEmailSent) {
        // Update form status to PENDING in the database even if sender email failed
        try {
          const currentData = formData.data as Record<string, any>;
          await prisma.formData.update({
            where: { id: formId },
            data: {
              data: {
                ...currentData,
                status: "PENDING",
                emailedTo: data.email,
                emailedAt: new Date().toISOString()
              }
            }
          });
          console.log(`✅ Form ${formId} marked as PENDING after email sent (despite sender email failure)`);
        } catch (updateError) {
          console.error('Error updating form status to PENDING:', updateError);
          // Continue with the response even if the status update fails
        }
        
        return NextResponse.json({ 
          success: true, 
          message: "Recipient email sent, but sender confirmation failed", 
          senderEmailProblem: true 
        });
      } else {
        return NextResponse.json({ 
          error: "Failed to send emails", 
          recipientEmailSent,
          senderEmailSent
        }, { status: 500 });
      }
    } catch (emailError: any) {
      console.error('SendGrid error:', emailError);
      if (emailError.response) {
        console.error('SendGrid error details:', emailError.response.body);
      }
      return NextResponse.json({ 
        error: 'Failed to send email via SendGrid',
        details: emailError instanceof Error ? emailError.message : 'Unknown SendGrid error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error in send-email route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process email request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}