const nodemailer = require('nodemailer');

function getEmailConfig() {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = process.env.EMAIL_PASSWORD?.replace(/\s+/g, '');

  if (!emailUser || !emailPassword) {
    return null;
  }

  return {
    emailUser,
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    }),
  };
}

const sendContactEmail = async (contactData) => {
  try {
    const emailConfig = getEmailConfig();

    if (!emailConfig) {
      console.warn('Email delivery skipped: EMAIL_USER or EMAIL_PASSWORD is not configured.');
      return { delivered: false, reason: 'email_not_configured' };
    }

    const { emailUser, transporter } = emailConfig;

    // Email to you (admin)
    await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        <p><strong>Received at:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Confirmation email to user
    await transporter.sendMail({
      from: emailUser,
      to: contactData.email,
      subject: 'We received your message!',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${contactData.name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Rahul R</p>
      `,
    });

    return { delivered: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const verifyEmailConnection = async () => {
  const emailConfig = getEmailConfig();

  if (!emailConfig) {
    console.warn('Email is not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env.');
    return false;
  }

  try {
    await emailConfig.transporter.verify();
    console.log(`Email server ready for ${emailConfig.emailUser}`);
    return true;
  } catch (error) {
    console.error('Email configuration error:', error.message);
    return false;
  }
};

module.exports = { sendContactEmail, verifyEmailConnection };
