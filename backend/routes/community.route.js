import express from "express";
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
  createTaskCommunity,
} from "../controllers/community.js";

const router = express.Router();

/* ✅ 1. BASE ROUTES FIRST */
router.get("/", getAllCommunities);
router.get("/users", user1);

/* ✅ 2. NESTED COLLECTION ROUTES */
router.get("/:communityId/teams", getCommunityTeams);
router.get("/:communityId/departments", getCommunityDepts);
router.get("/:communityId/members", getCommunityMembers);

/* ✅ 3. COMMUNITY TASK CREATION (🔥 THIS MUST BE BEFORE :communityId) */
router.post(
  "/:communityId/:communityDeptId/task",
  createTaskCommunity
);

/* ✅ 4. COMMUNITY CORE ACTIONS */
router.post("/create", createCommunity);
router.post("/addMember/:communityId/:userId", addMemberToCommunity);
router.post("/:communityId/:userId/apply", applyToJoinCommunity);
router.post("/delete/:communityID", deleteCommunity);

/* ✅ 5. SINGLE COMMUNITY (KEEP THIS LAST!!) */
router.get("/:communityId", indi);

export default router;
