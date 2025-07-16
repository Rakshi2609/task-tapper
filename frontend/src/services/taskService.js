import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api/function"
  : `${API_BASE_URL}/api/function`;

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

export const getAssignedTasks = async (email) => {
  try {
    const res = await axios.get(`${API_URL}/getTask`, { params: { email } });
    console.log("Fetched assigned tasks:", res.data.tasks);
    return res.data.tasks; // returns array of tasks
  } catch (error) {
    console.error("❌ Failed to fetch assigned tasks:", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const res = await axios.post(`${API_URL}/deletetask`, { taskId });
    console.log("🗑️ Task deleted:", res.data.message);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to delete task:", error);
    throw error;
  }
};