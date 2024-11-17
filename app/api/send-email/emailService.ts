import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailResponse {
  success: boolean;
  message: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<EmailResponse> {
  const msg = {
    to,
    from: 'info@breezly.co',
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    return {
      success: true,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

module.exports = { sendEmail }; // Export the function for use in other parts of your application
