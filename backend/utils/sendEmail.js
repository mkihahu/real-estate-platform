const sendEmail = async (options) => {
  // 1) Create a transporter
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
      console.error("Brevo API key is not defined in environment variables");
      throw new Error("Brevo API key is not defined in environment variables");
    }

    const data = {
      sender: {
        name: "Josmart Real Estate Platform",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: options.email,
        },
      ],
      subject: options.subject,
      htmlContent: options.message,
    };

    const response = fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Email sent successfully:", result.messageId);
    } else {
      console.error("Failed to send email:", result);
      throw new Error(
        `Failed to send email: ${result.message}` ||
          "Unknown error. Could not send email.",
      );
    }
  } catch (error) {
    console.error("Error occurred while sending email:", error.message);
    throw error;
  }
};

export default sendEmail;
