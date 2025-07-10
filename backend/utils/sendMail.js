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
 * @param {string} text - Body of the email
 * @param {string[]} cc - (Optional) CC emails
 */
export const sendMail = async (to, subject, text, cc = []) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
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
