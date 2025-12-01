import express from "express";
import Community from "../models/Community.js";
import {
  getCommunityTeams,
  getCommunityDepts,
  getCommunityMembers,
  getAllCommunities,
  createCommunity,
  addMemberToCommunity,
  user1,
} from "../controllers/community.js";

const router = express.Router();

router.get("/:communityId/teams", getCommunityTeams);
router.get("/:communityId/departments", getCommunityDepts);
router.get("/:communityId/members", getCommunityMembers);
router.get("/", getAllCommunities);
router.get("/users", user1);

router.post('/create', createCommunity);
router.post('/addMember/:communityId/:userId', addMemberToCommunity);

export default router;
