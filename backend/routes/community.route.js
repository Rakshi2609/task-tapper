    import express from 'express';
    import Community from '../models/Community.js';
    import { getCommunityTeams, getCommunityDepts, getCommunityMembers, getAllCommunities } from '../controllers/community.js';

    const router = express.Router();

    router.get('/:communityId/teams', getCommunityTeams);
    router.get('/:communityId/departments', getCommunityDepts);
    router.get('/:communityId/members', getCommunityMembers);  
    router.get('/', getAllCommunities);

    export default router;