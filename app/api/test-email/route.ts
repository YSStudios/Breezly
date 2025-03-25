import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function GET(req: Request) {
  // IMPORTANT: This is only for development/testing purposes
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Endpoint only available in development mode" }, { status: 403 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get("email");
    
    if (!testEmail) {
      return NextResponse.json({ 
        message: "Email parameter is required" 
      }, { status: 400 });
    }
    
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json({ 
        message: "SendGrid not configured properly", 
        config: {
          SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
          EMAIL_FROM: !!process.env.EMAIL_FROM
        }
      }, { status: 500 });
    }
    
    // Send a test email
    const msg = {
      to: testEmail,
      from: process.env.EMAIL_FROM,
      subject: "Test Email from Breezly",
      text: "This is a test email to verify your SendGrid integration is working correctly.",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Test Email</h2>
          <p>Hello,</p>
          <p>This is a test email to verify your SendGrid integration is working correctly.</p>
          <p>If you received this email, your password reset functionality should be working.</p>
          <p>Best regards,<br>Breezly Team</p>
        </div>
      `,
    };
    
    await sgMail.send(msg);
    
    return NextResponse.json({ 
      message: "Test email sent successfully", 
      to: testEmail 
    });
    
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({ 
      message: "Error sending test email",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 