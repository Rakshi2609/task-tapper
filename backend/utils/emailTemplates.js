// Email templates for community notifications

export const welcomeEmailTemplate = (userName, communityName, communityId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .highlight { background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .features { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .features ul { list-style: none; padding: 0; }
    .features li { padding: 8px 0; padding-left: 25px; position: relative; }
    .features li:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to the Community!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <div class="highlight">
        <p><strong>Great news!</strong> You have been added to the community <strong>"${communityName}"</strong>.</p>
      </div>
      
      <div class="features">
        <p><strong>You can now:</strong></p>
        <ul>
          <li>View and participate in community departments</li>
          <li>Collaborate with other members</li>
          <li>Access community tasks and resources</li>
          <li>Contribute to community projects</li>
        </ul>
      </div>
      
      <center>
        <a href="https://task-tapper-blush.vercel.app/communities/${communityId}/departments" class="button">
          Visit Community Now →
        </a>
      </center>
      
      <p style="margin-top: 30px;">Welcome aboard! We're excited to have you as part of our community.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>Task Tapper Team</strong></p>
      <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const applicationSubmittedTemplate = (applicantName, communityName, communityDescription) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .status-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .info-box { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .info-box p { margin: 5px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Application Submitted</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${applicantName}</strong>,</p>
      
      <div class="status-box">
        <p><strong>Your application to join "${communityName}" has been submitted successfully!</strong></p>
      </div>
      
      <p>The community owner will review your application shortly. You will receive a notification once your application is reviewed.</p>
      
      <div class="info-box">
        <p><strong>Community Details:</strong></p>
        <p>📌 <strong>Name:</strong> ${communityName}</p>
        <p>📝 <strong>Description:</strong> ${communityDescription}</p>
      </div>
      
      <p>Thank you for your interest in joining our community!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>Task Tapper Team</strong></p>
    </div>
  </div>
</body>
</html>
`;

export const applicationNotificationTemplate = (ownerName, communityName, applicantName, applicantEmail, communityId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #d97706; }
    .applicant-info { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Application Alert</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${ownerName}</strong>,</p>
      
      <div class="alert-box">
        <p><strong>You have a new application for your community "${communityName}"!</strong></p>
      </div>
      
      <div class="applicant-info">
        <p><strong>Applicant:</strong> ${applicantName}</p>
        <p><strong>Email:</strong> ${applicantEmail}</p>
      </div>
      
      <p>Please review and approve or reject this application from your community management page.</p>
      
      <center>
        <a href="https://task-tapper-blush.vercel.app/communities/${communityId}/pending" class="button">
          Review Application →
        </a>
      </center>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>Task Tapper Team</strong></p>
    </div>
  </div>
</body>
</html>
`;

export const applicationApprovedTemplate = (userName, communityName, communityId) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; }
    .header p { margin: 10px 0 0 0; font-size: 18px; opacity: 0.9; }
    .content { padding: 30px 20px; }
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .success-box h2 { margin: 0 0 10px 0; color: #059669; }
    .features { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .features ul { list-style: none; padding: 0; margin: 10px 0; }
    .features li { padding: 8px 0; padding-left: 30px; position: relative; font-size: 15px; }
    .features li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
    .button:hover { background: #059669; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .celebration { font-size: 48px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
      <p>Your application has been approved</p>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <div class="celebration">🎊 🥳 🎈</div>
      
      <div class="success-box">
        <h2>Welcome to ${communityName}!</h2>
        <p>Your application has been approved and you are now an official member.</p>
      </div>
      
      <div class="features">
        <p><strong>As a member, you can now:</strong></p>
        <ul>
          <li>Access all community departments and resources</li>
          <li>Participate in community tasks and projects</li>
          <li>Collaborate with other community members</li>
          <li>Contribute to discussions and initiatives</li>
        </ul>
      </div>
      
      <center>
        <a href="https://task-tapper-blush.vercel.app/communities/${communityId}/departments" class="button">
          Explore Community Now →
        </a>
      </center>
      
      <p style="margin-top: 30px; text-align: center;">We're thrilled to have you as part of our community! 🚀</p>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>Task Tapper Team</strong></p>
      <p style="font-size: 12px; color: #999; margin-top: 10px;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const applicationRejectedTemplate = (userName, communityName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; }
    .info-box { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .suggestions { background: #fef3c7; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .suggestions ul { margin: 10px 0; padding-left: 20px; }
    .suggestions li { padding: 5px 0; }
    .button { display: inline-block; background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #4b5563; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <div class="info-box">
        <p>We regret to inform you that your application to join <strong>"${communityName}"</strong> was not approved at this time.</p>
      </div>
      
      <div class="suggestions">
        <p><strong>What's next?</strong></p>
        <ul>
          <li>Explore other communities that match your interests</li>
          <li>Consider reapplying in the future</li>
          <li>Create your own community</li>
        </ul>
      </div>
      
      <center>
        <a href="https://task-tapper-blush.vercel.app/communities" class="button">
          Browse Communities →
        </a>
      </center>
      
      <p style="margin-top: 30px;">Thank you for your interest in joining our community platform!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br><strong>Task Tapper Team</strong></p>
    </div>
  </div>
</body>
</html>
`;
