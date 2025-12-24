import axios from "axios";


const API_URL = `${import.meta.env.VITE_API_URL}/community`;

console.log("Loaded API_URL:", API_URL);

// ✅ Get all communities
export const getAllCommunities = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ✅ Get departments
export const getCommunityDepartments = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}/departments`);
  return res.data;
};

// ✅ Get teams
export const getCommunityTeams = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}/teams`);
  return res.data;
};

// ✅ Get members
export const getCommunityMembers = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}/members`);
  return res.data;
};

// ✅ Create community
export const createCommunity = async (communityData) => {
  const res = await axios.post(`${API_URL}/create`, communityData);
  return res.data;
};

// ✅ Add member (ADMIN)
export const addMemberToCommunity = async (communityId, userId, requesterId) => {
  const res = await axios.post(
    `${API_URL}/addMember/${communityId}/${userId}`,
    { requesterId }   // ✅ IMPORTANT
  );
  return res.data;
};



// ✅ Get all users
export const getAllUsers = async () => {
  const res = await axios.get(`${API_URL}/users`);
  return res.data; // backend sends array directly
};

// ✅ ✅ ✅ APPLY TO JOIN COMMUNITY (USER REQUEST)
export const applyToJoinCommunity = async (communityId, userId) => {
  try {
    const res = await axios.post(
      `${API_URL}/${communityId}/${userId}/apply`
    );
    return res.data;
  } catch (error) {
    console.error("Apply to join community error:", error);
    throw error;
  }
};

export const createCommunityTask = async (communityId, communityDeptId, taskData) => {
  const res = await axios.post(
    `${API_URL}/${communityId}/${communityDeptId}/task`,
    taskData,
    { withCredentials: true }
  );
  return res.data;
};

// ✅ ✅ ✅ CREATE COMMUNITY RECURRING TASK
export const createCommunityRecurringTask = async (
  communityId,
  communityDeptId,
  taskData
) => {
  const res = await axios.post(
    `${API_URL}/${communityId}/${communityDeptId}/recurring/create`,
    taskData,
    { withCredentials: true }
  );
  return res.data;
};

export const getDeptTasks = async (communityId, deptId) => {
  const res = await axios.get(`${API_URL}/${communityId}/${deptId}/tasks`);
  return res.data;
};

// ✅ GET COMMUNITY BY ID (with waiting approval list)
export const getCommunityById = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}`);
  return res.data;
};

// ✅ APPROVE APPLICATION
export const approveMemberApplication = async (communityId, userId, requesterId) => {
  const res = await axios.post(
    `${API_URL}/${communityId}/${userId}/approve`,
    { requesterId }
  );
  return res.data;
};

// ✅ REJECT APPLICATION
export const rejectMemberApplication = async (communityId, userId, requesterId) => {
  const res = await axios.post(
    `${API_URL}/${communityId}/${userId}/reject`,
    { requesterId }
  );
  return res.data;
};
