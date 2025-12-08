import User from '../models/User.js';
import Team from '../models/Team.js';
import Community from '../models/Community.js';
import CommunityDept from '../models/CommunityDept.js';

import {createTask} from './team.js';

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
        const community = await Community.findById(communityId);
        if (!community) {
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
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
        const members = await User.find({ _id: { $in: community.members } });
        console.log(members);
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
    try {
        const { name, description, CreatedBy } = req.body;
        const community = new Community({ name, description, CreatedBy });
        console.log(community);
        await community.save();
        console.log("Community created successfully");
        res.status(201).json(community);
    } catch (error) {
        console.log("Error creating community:", error.message);
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
  } catch (error) {
    console.log("❌ Apply error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveMemberApplication = async (req, res) => {
    console.log("Approving member application");
    try { 
        const { communityId, userId } = req.params;
        const community = await Community.findById(communityId);
        if(!community){
            console.log("Community not found");
            return res.status(404).json({ message: 'Community not found' });
        }
        if(!community.waitingApproval.includes(userId)){
            console.log("No application found for this user");
            return res.status(400).json({ message: 'No application found for this user' });
        }
        community.waitingApproval = community.waitingApproval.filter(member => member.toString() !== userId);
        community.members.push(userId);
        await community.save();
        console.log("Member application approved successfully");
        res.json({ message: 'Member application approved successfully' });
    } catch (error) {
        console.log("Error approving member application:", error.message);
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
    
    // ✅ Inject community data into body BEFORE calling createTask
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
