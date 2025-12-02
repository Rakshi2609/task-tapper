import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/community`;

console.log("Loaded API_URL:", API_URL);

export const getAllCommunities = async () => {
  console.log("Requesting:", API_URL);
  const res = await axios.get(API_URL);
  console.log("Response data:", res.data);
  return res.data;
};
export const getCommunityDepartments = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}/departments`);
  return res.data;
};

export const getCommunityTeams = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}/teams`);
  return res.data;
};

export const getCommunityMembers = async (communityId) => {
  const res = await axios.get(`${API_URL}/${communityId}/members`);
  return res.data;
};

export const createCommunity = async (communityData) => {
    const res = await axios.post(`${API_URL}/create`, communityData);
    return res.data;
};

// ADD MEMBER (PARAM BASED — MATCHES BACKEND)
export const addMemberToCommunity = async (communityId, userId) => {
  const res = await axios.post(`${API_URL}/addMember/${communityId}/${userId}`);
  return res.data;
};

export const getAllUsers = async () => {
    const res = await axios.get(`${API_URL}/users`);
    return res.data;   // backend sends array directly
};

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
