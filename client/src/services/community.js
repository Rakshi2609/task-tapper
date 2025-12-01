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
