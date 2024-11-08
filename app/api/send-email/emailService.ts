const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Ensure your SendGrid API key is set in environment variables

function sendEmail(to, subject, text) {
  const msg = {
    to: to,
    from: "info@breezly.co", // Use your verified SendGrid email
    subject: subject,
    text: text,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
}

module.exports = { sendEmail }; // Export the function for use in other parts of your application
