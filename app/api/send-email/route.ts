import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: Request) {
  try {
    const msg = {
      to: 'kirillginko@gmail.com',
      from: process.env.SENDGRID_VERIFIED_EMAIL!, // Make sure this is your verified sender email
      subject: 'Test Email',
      text: 'The email send is working!',
      html: '<h1>The email send is working!</h1>',
    };

    await sgMail.send(msg);
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Error sending email' },
      { status: 500 }
    );
  }
}