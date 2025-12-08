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
  deleteCommunity,
  applyToJoinCommunity,
  indi,
} from "../controllers/community.js";

const router = express.Router();

/* ✅ SAFE ROUTE ORDER */
router.get("/", getAllCommunities);
router.get("/users", user1);

// ✅ SINGLE COMMUNITY (must be BEFORE nested routes)
router.get("/:communityId", indi);

router.get("/:communityId/teams", getCommunityTeams);
router.get("/:communityId/departments", getCommunityDepts);
router.get("/:communityId/members", getCommunityMembers);

router.post("/create", createCommunity);

// ✅ ADD MEMBER
router.post("/addMember/:communityId/:userId", addMemberToCommunity);

// ✅ APPLY TO JOIN  (🔥 FIXED PARAM NAME)
router.post("/:communityId/:userId/apply", applyToJoinCommunity);
// ✅ DELETE COMMUNITY
router.post("/delete/:communityID", deleteCommunity);

export default router;
