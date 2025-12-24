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

/**
 * Send email with retry mechanism for production environments
 * @param {string} to - Recipient email
 * @param {string} subject - Subject of the email
 * @param {string} content - Body of the email (can be plain text or HTML)
 * @param {string[]} cc - (Optional) CC emails
 * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} retryDelay - Delay between retries in ms (default: 5000)
 */
export const sendMailWithRetry = async (to, subject, content, cc = [], maxRetries = 5, retryDelay = 5000) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`📧 Attempt ${attempt}/${maxRetries} - Sending email to ${to}...`);
      
      const result = await sendMail(to, subject, content, cc);
      console.log(`✅ Email successfully delivered to ${to} on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed for ${to}:`, error.message);
      
      if (attempt >= maxRetries) {
        console.error(`💔 All ${maxRetries} attempts failed for ${to}. Giving up.`);
        throw new Error(`Failed to send email after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying
      console.log(`⏳ Waiting ${retryDelay / 1000}s before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Increase delay for next attempt (exponential backoff)
      retryDelay = Math.min(retryDelay * 1.5, 30000); // Cap at 30 seconds
    }
  }
};
