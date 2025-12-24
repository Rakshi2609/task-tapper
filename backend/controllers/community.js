import User from '../models/User.js';
import Team from '../models/Team.js';
import Community from '../models/Community.js';
import CommunityDept from '../models/CommunityDept.js';
import RecurringTask from "../models/recurringTaskModel.js";
import { sendMail } from '../utils/sendMail.js';

import {createTask } from './team.js';
import { createRecurringTask } from './recurringTaskController.js';

export const getCommunityTeams = async (req, res) => {
    console.log("Entered getCommunityTeams function");
    try {
        console.log("Fetching teams for community");
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        const teams = await Team.find({ community: communityId });
        // const members = await User.find({ community: communityId });
        // const members = community.members;
        console.log(teams);
        res.json(teams);    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getCommunityDepts = async (req, res) => {
    console.log("Fetching departments for community");
    try {
        const { communityId } = req.params; 
        const { userId } = req.query; // Get userId from query params
        
        const community = await Community.findById(communityId);
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Check if user is member or owner
        if (userId) {
            const isOwner = community.CreatedBy.toString() === userId;
            const isMember = community.members.some(m => m.toString() === userId);
            
            if (!isOwner && !isMember) {
                console.log("User is not a member of this community");
                return res.status(403).json({ message: 'You must be a member to view departments' });
            }
        }
        
        const depts = await CommunityDept.find({ community: communityId }); 
        console.log(depts);
        res.json(depts);    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getCommunityMembers = async (req, res) => {
    console.log("Fetching members for community");
    try {
        const { communityId } = req.params; 
        const community = await Community.findById(communityId);
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Get all member IDs including the owner
        const allMemberIds = [...community.members];
        
        // Add owner if not already in members
        if (!allMemberIds.some(id => id.toString() === community.CreatedBy.toString())) {
            allMemberIds.push(community.CreatedBy);
        }
        
        const members = await User.find({ _id: { $in: allMemberIds } });
        console.log("Members (including owner):", members.length);
        res.json(members);    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAllCommunities = async (req, res) => {
    console.log("Fetching all communities");
    try {
        const communities = await Community.find(); 
        console.log(communities);
        res.json(communities);    
    }   catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }   
};

export const getCommunityById = async (req, res) => {
    console.log("Fetching community by ID");
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        console.log(community);
        res.json(community);    
    } catch (error) {
        console.log("Error fetching community by ID:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const user1 = async (req, res) => {
    console.log("Fetching all users");  
    try{
        const users = await User.find();
        console.log(users);
        res.json(users);
    } catch (error) {
        console.log("Error fetching all users:", error.message);    
    }
};

export const createCommunity = async (req, res) => {
    console.log("Creating new community");
    console.log("Request body:", req.body);
    try {
        const { name, description, CreatedBy } = req.body;
        
        // Validate required fields
        if (!name || !description || !CreatedBy) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { name: !!name, description: !!description, CreatedBy: !!CreatedBy }
            });
        }

        const community = new Community({ name, description, CreatedBy });
        console.log("Community object:", community);
        await community.save();
        console.log("Community created successfully");
        res.status(201).json(community);
    } catch (error) {
        console.log("Error creating community:", error.message);
        console.log("Full error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addMemberToCommunity = async (req, res) => {
  console.log("Adding member to community");

  try {
    const { communityId, userId } = req.params;

    // ✅ The user who is TRYING to add a member (SENDER)
    // This must come from token/middleware or frontend param
    const { requesterId } = req.body;  // 👈 IMPORTANT

    // ✅ Find community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // ✅ ONLY CREATOR CAN ADD MEMBERS
    if (community.CreatedBy.toString() !== requesterId) {
      return res.status(403).json({
        message: "Only the community owner can add members",
      });
    }

    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Prevent duplicate members (FIXED ObjectId check)
    const alreadyMember = community.members.some(
      (id) => id.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User already a member" });
    }

    // ✅ Add member
    community.members.push(userId);
    community.totalMembers = community.members.length;

    await community.save();

    // 📧 Send email notification to the added user (non-blocking)
    const emailContent = `
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
            <p>Hi <strong>${user.username || user.email}</strong>,</p>
            
            <div class="highlight">
              <p><strong>Great news!</strong> You have been added to the community <strong>"${community.name}"</strong>.</p>
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
    
    // Send email in background without blocking the response
    sendMail(
      user.email,
      `🎉 You've been added to ${community.name}`,
      emailContent
    ).then(() => {
      console.log(`📧 Welcome email sent to ${user.email}`);
    }).catch((emailError) => {
      console.error("❌ Failed to send welcome email:", emailError.message);
    });

    console.log("✅ Member added successfully");

    const updated = await Community.findById(communityId)
      .populate("members", "username email");

    res.json(updated);
  } catch (error) {
    console.log("❌ Error adding member:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const removeMemberFromCommunity = async (req, res) => {
    console.log("Removing member from community");
    try {
        const { communityId, userId } = req.params;
        const community = await Community.findById(communityId);    
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        community.members = community.members.filter(member => member.toString() !== userId);
        await community.save();
        console.log("Member removed successfully");
        res.json(community);
    } catch (error) {
        console.log("Error removing member from community:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteCommunity = async (req, res) => {
    console.log("Deleting community");
    try {
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        await Community.findByIdAndDelete(communityId);
        console.log("Community deleted successfully");
        res.json({ message: 'Community deleted successfully' });
    } catch (error) {
        console.log("Error deleting community:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const applyToJoinCommunity = async (req, res) => {
  console.log("Applying to join community");

  try {
    const { communityId, userId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const alreadyApplied = community.waitingApproval.some(
      (id) => id.toString() === userId
    );

    if (alreadyApplied) {
      return res.status(400).json({
        message: "User has already applied to join this community",
      });
    }

    community.waitingApproval.push(userId);
    await community.save();

    console.log("✅ Application submitted");
    res.json({ message: "Application to join community submitted successfully" });

    // 📧 Send email notifications (non-blocking)
    Promise.all([
      User.findById(userId),
      User.findById(community.CreatedBy)
    ]).then(([applicant, owner]) => {
      if (applicant && owner) {
        // Email to applicant
        const applicantEmail = `
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
                <p>Hi <strong>${applicant.username || applicant.email}</strong>,</p>
                
                <div class="status-box">
                  <p><strong>Your application to join "${community.name}" has been submitted successfully!</strong></p>
                </div>
                
                <p>The community owner will review your application shortly. You will receive a notification once your application is reviewed.</p>
                
                <div class="info-box">
                  <p><strong>Community Details:</strong></p>
                  <p>📌 <strong>Name:</strong> ${community.name}</p>
                  <p>📝 <strong>Description:</strong> ${community.description}</p>
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

        sendMail(
          applicant.email,
          `✅ Application Submitted: ${community.name}`,
          applicantEmail
        ).then(() => {
          console.log(`📧 Application confirmation sent to ${applicant.email}`);
        }).catch((err) => {
          console.error("❌ Failed to send application confirmation:", err.message);
        });

        // Email to owner
        const ownerEmail = `
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
                <p>Hi <strong>${owner.username || owner.email}</strong>,</p>
                
                <div class="alert-box">
                  <p><strong>You have a new application for your community "${community.name}"!</strong></p>
                </div>
                
                <div class="applicant-info">
                  <p><strong>Applicant:</strong> ${applicant.username || applicant.email}</p>
                  <p><strong>Email:</strong> ${applicant.email}</p>
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

        sendMail(
          owner.email,
          `📬 New Application for ${community.name}`,
          ownerEmail
        ).then(() => {
          console.log(`📧 Application notification sent to owner ${owner.email}`);
        }).catch((err) => {
          console.error("❌ Failed to send owner notification:", err.message);
        });
      }
    }).catch((err) => {
      console.error("❌ Error fetching user details for emails:", err.message);
    });
  } catch (error) {
    console.log("❌ Apply error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveMemberApplication = async (req, res) => {
    console.log("Approving member application");
    try { 
        const { communityId, userId } = req.params;
        const { requesterId } = req.body;
        
        const community = await Community.findById(communityId);
        if(!community){
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Check if requester is the community owner
        if(community.CreatedBy.toString() !== requesterId){
            return res.status(403).json({ message: 'Only the community owner can approve applications' });
        }
        
        if(!community.waitingApproval.includes(userId)){
            console.log("No application found for this user");
            return res.status(400).json({ message: 'No application found for this user' });
        }
        
        community.waitingApproval = community.waitingApproval.filter(member => member.toString() !== userId);
        community.members.push(userId);
        community.totalMembers = community.members.length;
        await community.save();
        
        console.log("Member application approved successfully");
        res.json({ message: 'Member application approved successfully' });
        
        // 📧 Send approval email to the user (non-blocking)
        User.findById(userId).then((approvedUser) => {
          if (approvedUser) {
            const emailContent = `
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
                    <p>Hi <strong>${approvedUser.username || approvedUser.email}</strong>,</p>
                    
                    <div class="celebration">🎊 🥳 🎈</div>
                    
                    <div class="success-box">
                      <h2>Welcome to ${community.name}!</h2>
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

            sendMail(
              approvedUser.email,
              `🎉 Application Approved: ${community.name}`,
              emailContent
            ).then(() => {
              console.log(`📧 Approval email sent to ${approvedUser.email}`);
            }).catch((err) => {
              console.error("❌ Failed to send approval email:", err.message);
            });
          }
        }).catch((err) => {
          console.error("❌ Error fetching user for approval email:", err.message);
        });
    } catch (error) {
        console.log("Error approving member application:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const rejectMemberApplication = async (req, res) => {
    console.log("Rejecting member application");
    try { 
        const { communityId, userId } = req.params;
        const { requesterId } = req.body;
        
        const community = await Community.findById(communityId);
        if(!community){
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        
        // Check if requester is the community owner
        if(community.CreatedBy.toString() !== requesterId){
            return res.status(403).json({ message: 'Only the community owner can reject applications' });
        }
        
        if(!community.waitingApproval.includes(userId)){
            console.log("No application found for this user");
            return res.status(400).json({ message: 'No application found for this user' });
        }
        
        community.waitingApproval = community.waitingApproval.filter(member => member.toString() !== userId);
        await community.save();
        
        console.log("Member application rejected successfully");
        res.json({ message: 'Member application rejected successfully' });
        
        // 📧 Send rejection email to the user (non-blocking)
        User.findById(userId).then((rejectedUser) => {
          if (rejectedUser) {
            const emailContent = `
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
                    <p>Hi <strong>${rejectedUser.username || rejectedUser.email}</strong>,</p>
                    
                    <div class="info-box">
                      <p>We regret to inform you that your application to join <strong>"${community.name}"</strong> was not approved at this time.</p>
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

            sendMail(
              rejectedUser.email,
              `Application Update: ${community.name}`,
              emailContent
            ).then(() => {
              console.log(`📧 Rejection email sent to ${rejectedUser.email}`);
            }).catch((err) => {
              console.error("❌ Failed to send rejection email:", err.message);
            });
          }
        }).catch((err) => {
          console.error("❌ Error fetching user for rejection email:", err.message);
        });
    } catch (error) {
        console.log("Error rejecting member application:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const indi = async (req, res) => {
  console.log("Fetching individual community");
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    console.log(community);
    res.json(community); // ✅ THIS WAS MISSING
  } catch (error) {
    console.log("Fetch individual community error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const createTaskCommunity = async (req, res) => {
  console.log("Creating community task");
  
  try {
    const { communityId, communityDeptId } = req.params;
    
    req.body.community = communityId;
    req.body.communityDept = communityDeptId || null;
    
    console.log("Entered the createTaskCommunity function");
    // ✅ Reuse existing logic (NO DUPLICATION)
    return createTask(req, res);

  } catch (err) {
    console.error("Create Community Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ CREATE COMMUNITY RECURRING TASK (WRAPPER)
export const createRecurringTaskCommunity = async (req, res) => {
  console.log("Creating community recurring task");

  try {
    const { communityId, communityDeptId } = req.params;

    // ✅ Inject community references into body
    req.body.community = communityId;
    req.body.communityDept = communityDeptId || null;

    console.log("Entered createRecurringTaskCommunity wrapper");

    // ✅ Reuse existing recurring controller (NO DUPLICATION)
    return createRecurringTask(req, res);

  } catch (err) {
    console.error("Create Community Recurring Task Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createCommunityDept = async (req, res) => {
  console.log("Creating community department");

  try {
    const { communityId } = req.params;
    const { name, description, requesterId } = req.body;

    // ✅ Find community
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // ✅ CHECK: requester must be the owner or a member
    const isMember =
      community.CreatedBy.toString() === requesterId ||
      community.members.some((id) => id.toString() === requesterId);

    if (!isMember) {
      return res.status(403).json({
        message: "Only community members and owner can create departments",
      });
    }

    // ✅ CREATE DEPARTMENT
    const dept = new CommunityDept({
      name,
      description,
      community: communityId,
      CreatedBy: requesterId,
    });

    await dept.save();

    console.log("✅ Department created successfully");

    res.status(201).json(dept);
  } catch (error) {
    console.error("❌ Create department error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const getDeptTasks = async (req, res) => {
  try {
    const { communityDeptId } = req.params;
    
    console.log("🔍 Fetching tasks for dept:", communityDeptId);

    // Normal tasks (assignedTo is a String, not a reference)
    const tasks = await Team.find({ communityDept: communityDeptId });
    
    console.log("📋 Tasks found:", tasks.length);

    // Recurring tasks
    const recurring = await RecurringTask.find({ communityDept: communityDeptId })
      .populate("taskAssignedTo", "email username")
      .populate("taskAssignedBy", "email username");
    
    console.log("🔁 Recurring tasks found:", recurring.length);

    res.json({
      success: true,
      tasks,
      recurringTasks: recurring
    });
  } catch (err) {
    console.error("❌ Dept tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};