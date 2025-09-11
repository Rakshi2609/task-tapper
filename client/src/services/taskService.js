import axios from "axios";

// Determine API URL based on environment
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/function" // Corrected this base URL to '/api'
    : `${API_BASE_URL}/api/function`; // Use the environment variable for production

axios.defaults.withCredentials = true; // Essential for sending/receiving cookies (e.g., for authentication)

// --- User/Auth Related Service Calls ---
export const signupUser = async (email, username) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { email, username });
    return response.data;
};

export const loginUser = async (email) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email });
    return response.data;
};

export const saveUserDetail = async (email, phoneNumber, role) => {
    const response = await axios.post(`${API_URL}/auth/user-details`, { email, phoneNumber, role });
    return response.data;
};

export const getUserProfile = async (email) => {
    const response = await axios.get(`${API_URL}/auth/profile/${email}`); // Assuming profile endpoint
    return response.data;
};

export const getAllEmails = async () => {
    const response = await axios.get(`${API_URL}/email`); // Adjust endpoint if needed (e.g., /auth/emails)
    return response.data.emails; // Assuming backend returns { emails: [...] }
};

// --- Task Related Service Calls (existing ones, adjusted to match potential backend path) ---

export const createTask = async (taskData) => {
    const response = await axios.post(`${API_URL}/createtask`, taskData);
    return response.data;
};

export const acceptTask = async ({ taskId, email }) => { // Expects object for arguments
    const res = await axios.post(`${API_URL}/accepttask`, { taskId, email });
    console.log("✅ Task accepted:", res.data.task);
    return res.data;
};

export const completeTask = async ({ taskId, email }) => { // Expects object for arguments
    const response = await axios.post(`${API_URL}/updatetask`, { taskId, email });
    return response.data;
};

export const deleteTask = async ({ taskId }) => { // Expects object for arguments
    const res = await axios.post(`${API_URL}/deletetask`, { taskId });
    console.log("🗑️ Task deleted:", res.data.message);
    return res.data;
};

export const getAssignedTasks = async (email) => {
    try {
        const res = await axios.get(`${API_URL}/getTask`, { params: { email } }); // This was /getTask previously, ensure it matches backend
        console.log("Fetched assigned tasks:", res.data.tasks);
        return res.data.tasks; // returns array of tasks
    } catch (error) {
        console.error("❌ Failed to fetch assigned tasks:", error);
        throw error;
    }
};


// --- NEW Task Detail and Updates Service Calls ---

export const getTaskById = async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`); // Matches backend route: /api/tasks/:taskId
    return response.data;
};

export const getTaskUpdates = async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/updates`); // Matches backend route: /api/tasks/:taskId/updates
    return response.data;
};

export const createTaskUpdate = async (updateData) => {
    // updateData should contain { taskId, updateText, updatedBy, updateType }
    // The taskId is also part of the URL, so we extract it.
    const { taskId, ...restOfData } = updateData;
    const response = await axios.post(`${API_URL}/tasks/${taskId}/updates`, restOfData); // Matches backend route
    return response.data;
};
