// // backend/utils/sendMail.js
// import FormData from 'form-data';
// import Mailgun from 'mailgun.js';
// import dotenv from 'dotenv';

// dotenv.config();

// // Check if email credentials are configured
// if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
//   console.warn('⚠️ MAILGUN_API_KEY or MAILGUN_DOMAIN environment variables not set. Email functionality will not work.');
// }

// // Initialize Mailgun
// const mailgun = new Mailgun(FormData);
// const mg = mailgun.client({
//   username: 'api',
//   key: process.env.MAILGUN_API_KEY || '',
//   url: "https://api.eu.mailgun.net" // Uncomment for EU domains
// });

// /**
//  * Send email using Mailgun
//  * @param {string} to - Recipient email
//  * @param {string} subject - Subject of the email
//  * @param {string} content - Body of the email (can be plain text or HTML)
//  * @param {string[]} cc - (Optional) CC emails
//  */
// export const sendMail = async (to, subject, content, cc = []) => {
//   // Check if Mailgun is configured
//   if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
//     const error = new Error('Email configuration missing. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.');
//     console.error('❌', error.message);
//     throw error;
//   }

//   // Check if content contains HTML tags
//   const isHTML = /<[a-z][\s\S]*>/i.test(content);

//   console.log(`📧 Sending ${isHTML ? 'HTML' : 'text'} email to ${to}...`);

//   const mailOptions = {
//     from: `Task Tapper <postmaster@${process.env.MAILGUN_DOMAIN}>`,
//     to: [to],
//     subject,
//     ...(isHTML ? { html: content } : { text: content }),
//   };

//   // Add CC if provided
//   if (cc && cc.length > 0) {
//     mailOptions.cc = cc;
//   }

//   try {
//     const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);
//     console.log(`✅ Email sent successfully to ${to}:`, response.id);
//     return response;
//   } catch (err) {
//     console.error(`❌ Error sending email to ${to}:`, err);
//     throw err;
//   }
// };

// /**
//  * Send email with retry mechanism for production environments
//  * @param {string} to - Recipient email
//  * @param {string} subject - Subject of the email
//  * @param {string} content - Body of the email (can be plain text or HTML)
//  * @param {string[]} cc - (Optional) CC emails
//  * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
//  * @param {number} retryDelay - Delay between retries in ms (default: 5000)
//  */
// export const sendMailWithRetry = async (to, subject, content, cc = [], maxRetries = 5, retryDelay = 5000) => {
//   let attempt = 0;

//   while (attempt < maxRetries) {
//     try {
//       attempt++;
//       console.log(`📧 Attempt ${attempt}/${maxRetries} - Sending email to ${to}...`);

//       const result = await sendMail(to, subject, content, cc);
//       console.log(`✅ Email successfully delivered to ${to} on attempt ${attempt}`);
//       return result;

//     } catch (error) {
//       console.error(`❌ Attempt ${attempt}/${maxRetries} failed for ${to}:`, error.message);

//       if (attempt >= maxRetries) {
//         console.error(`💔 All ${maxRetries} attempts failed for ${to}. Giving up.`);
//         throw new Error(`Failed to send email after ${maxRetries} attempts: ${error.message}`);
//       }

//       // Wait before retrying
//       console.log(`⏳ Waiting ${retryDelay / 1000}s before retry ${attempt + 1}...`);
//       await new Promise(resolve => setTimeout(resolve, retryDelay));

//       // Increase delay for next attempt (exponential backoff)
//       retryDelay = Math.min(retryDelay * 1.5, 30000); // Cap at 30 seconds
//     }
//   }
// };




// --- Nodemailer fallback (commented out) ---
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.APP_PASSWORD,
//   },
// });
// export const sendMailNodemailer = async (to, subject, content, cc = []) => {
//   if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
//     const error = new Error('Email credentials missing in .env file.');
//     console.error('❌', error.message);
//     throw error;
//   }
//   const isHTML = /<[a-z][\s\S]*>/i.test(content);
//   console.log(`📧 Sending ${isHTML ? 'HTML' : 'text'} email to ${to} via Nodemailer...`);
//   const mailOptions = {
//     from: `"Task Tapper" <${process.env.EMAIL}>`,
//     to,
//     subject,
//     cc,
//     [isHTML ? 'html' : 'text']: content,
//   };
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
//     return info;
//   } catch (err) {
//     console.error(`❌ Error sending email to ${to}:`, err.message);
//     throw err;
//   }
// };

import axios from 'axios';
const APPSCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz9vtfw3hGAYm6PwXuVy7A-BZrf16X4UQKzX9KJYcc58N7vbRKevJY7Q6mDeo8Yw05MZg/exec';

/**
 * Send email using Google Apps Script Web App
 * @param {string} to - Recipient email
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML body of the email
 */
export const sendMailViaAppScript = async (to, subject, html) => {
  if (!to || !subject || !html) {
    throw new Error('Missing required fields for sending email via AppScript');
  }
  try {
    const response = await axios.post(APPSCRIPT_URL, { to, subject, html }, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.data && response.data.success) {
      console.log(`✅ Email sent successfully to ${to} via AppScript.`);
      return response.data;
    } else {
      throw new Error(response.data && response.data.message ? response.data.message : 'Unknown error from AppScript');
    }
  } catch (err) {
    console.error(`❌ Error sending email to ${to} via AppScript:`, err.message);
    throw err;
  }
};

/**
 * Send email with retry mechanism using AppScript
 */
export const sendMailWithRetry = async (to, subject, html, cc = [], maxRetries = 3, retryDelay = 5000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      return await sendMailViaAppScript(to, subject, html);
    } catch (error) {
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// For compatibility: sendMail now uses AppScript
export const sendMail = async (to, subject, content, cc = []) => {
  // If content is not HTML, wrap it in <pre> for basic formatting
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  const html = isHTML ? content : `<pre>${content}</pre>`;
  return sendMailViaAppScript(to, subject, html);
};