// backend/utils/sendMail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,          // Make sure this is correct
    pass: process.env.APP_PASSWORD,   // App Password from Gmail
  },
});

/**
 * Send email using Gmail + Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Subject of the email
 * @param {string} content - Body of the email (can be plain text or HTML)
 * @param {string[]} cc - (Optional) CC emails
 */
export const sendMail = async (to, subject, content, cc = []) => {
  // Check if content contains HTML tags
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  
  const mailOptions = { 
    from: process.env.EMAIL,
    to,
    subject,
    ...(isHTML ? { html: content } : { text: content }),
    cc,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (err) {
    console.error('❌ Error sending email:', err);
    throw err;
  }
};
