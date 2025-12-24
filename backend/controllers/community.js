import User from '../models/User.js';
import Team from '../models/Team.js';
import Community from '../models/Community.js';
import CommunityDept from '../models/CommunityDept.js';
import RecurringTask from "../models/recurringTaskModel.js";
import { sendMail, sendMailWithRetry } from '../utils/sendMail.js';
import { 
  welcomeEmailTemplate,
  applicationSubmittedTemplate,
  applicationNotificationTemplate,
  applicationApprovedTemplate,
  applicationRejectedTemplate
} from '../utils/emailTemplates.js';

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

    console.log("✅ Member added successfully");

    // 📧 Send email notification to the added user (non-blocking)
    console.log(`📧 Preparing to send welcome email to ${user.email}...`);
    const emailContent = welcomeEmailTemplate(
      user.username || user.email,
      community.name,
      communityId
    );
    
    // Send email in background without blocking the response
    sendMailWithRetry(
      user.email,
      `🎉 You've been added to ${community.name}`,
      emailContent
    ).then(async () => {
      console.log(`✅ Welcome email successfully sent to ${user.email}`);
      // Track email sent status
      await Community.findByIdAndUpdate(communityId, {
        $push: {
          memberEmailStatus: {
            userId: userId,
            emailSent: true,
            sentAt: new Date(),
            emailType: 'welcome'
          }
        }
      });
    }).catch(async (emailError) => {
      console.error(`❌ Failed to send welcome email to ${user.email}:`, emailError);
      // Track email failed status
      await Community.findByIdAndUpdate(communityId, {
        $push: {
          memberEmailStatus: {
            userId: userId,
            emailSent: false,
            emailType: 'welcome'
          }
        }
      });
    });

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
        const applicantEmail = applicationSubmittedTemplate(
          applicant.username || applicant.email,
          community.name,
          community.description
        );

        sendMailWithRetry(
          applicant.email,
          `✅ Application Submitted: ${community.name}`,
          applicantEmail
        ).then(() => {
          console.log(`📧 Application confirmation sent to ${applicant.email}`);
        }).catch((err) => {
          console.error("❌ Failed to send application confirmation:", err.message);
        });

        // Email to owner
        const ownerEmail = applicationNotificationTemplate(
          owner.username || owner.email,
          community.name,
          applicant.username || applicant.email,
          applicant.email,
          communityId
        );

        sendMailWithRetry(
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
            const emailContent = applicationApprovedTemplate(
              approvedUser.username || approvedUser.email,
              community.name,
              communityId
            );

            sendMailWithRetry(
              approvedUser.email,
              `🎉 Application Approved: ${community.name}`,
              emailContent
            ).then(async () => {
              console.log(`📧 Approval email sent to ${approvedUser.email}`);
              // Track email sent status
              await Community.findByIdAndUpdate(communityId, {
                $push: {
                  memberEmailStatus: {
                    userId: userId,
                    emailSent: true,
                    sentAt: new Date(),
                    emailType: 'approved'
                  }
                }
              });
            }).catch(async (err) => {
              console.error("❌ Failed to send approval email:", err.message);
              // Track email failed status
              await Community.findByIdAndUpdate(communityId, {
                $push: {
                  memberEmailStatus: {
                    userId: userId,
                    emailSent: false,
                    emailType: 'approved'
                  }
                }
              });
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
            const emailContent = applicationRejectedTemplate(
              rejectedUser.username || rejectedUser.email,
              community.name
            );

            sendMailWithRetry(
              rejectedUser.email,
              `Application Update: ${community.name}`,
              emailContent
            ).then(async () => {
              console.log(`📧 Rejection email sent to ${rejectedUser.email}`);
              // Track email sent status
              await Community.findByIdAndUpdate(communityId, {
                $push: {
                  memberEmailStatus: {
                    userId: userId,
                    emailSent: true,
                    sentAt: new Date(),
                    emailType: 'rejected'
                  }
                }
              });
            }).catch(async (err) => {
              console.error("❌ Failed to send rejection email:", err.message);
              // Track email failed status
              await Community.findByIdAndUpdate(communityId, {
                $push: {
                  memberEmailStatus: {
                    userId: userId,
                    emailSent: false,
                    emailType: 'rejected'
                  }
                }
              });
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