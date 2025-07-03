import axios from "axios";

const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api/function"
  : "/api/function";

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/createtask`, taskData);
  return response.data;
};

export const acceptTask = async (taskId, email) => {
  try {
    const res = await axios.post(`${API_URL}/accepttask`, { taskId, email });
    console.log("✅ Task accepted:", res.data.task);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to accept task:", error);
    throw error;
  }
};

export const completeTask = async (taskId, email) => {
  const response = await axios.post(`${API_URL}/updatetask`, { taskId, email });
  return response.data;
};

export const getAllEmails = async () => {
  const res = await axios.get(`${API_URL}/email`);
  console.log("Fetched emails:", res.data.emails);
  return res.data.emails; // returns array of emails
};
