// backend/utils/sendMail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Check if email credentials are configured
if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
  console.warn('⚠️ EMAIL or APP_PASSWORD environment variables not set. Email functionality will not work.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
  // Add these for production stability
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

/**
 * Send email using Gmail + Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Subject of the email
 * @param {string} content - Body of the email (can be plain text or HTML)
 * @param {string[]} cc - (Optional) CC emails
 */
export const sendMail = async (to, subject, content, cc = []) => {
  // Check if email is configured
  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    const error = new Error('Email configuration missing. Please set EMAIL and APP_PASSWORD environment variables.');
    console.error('❌', error.message);
    throw error;
  }

  // Check if content contains HTML tags
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  
  console.log(`📧 Sending ${isHTML ? 'HTML' : 'text'} email to ${to}...`);
  
  const mailOptions = { 
    from: process.env.EMAIL,
    to,
    subject,
    ...(isHTML ? { html: content } : { text: content }),
    cc,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, info.response);
    return info;
  } catch (err) {
    console.error(`❌ Error sending email to ${to}:`, err);
    throw err;
  }
};
