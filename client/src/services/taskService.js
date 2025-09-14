import axios from "axios";

// Determine API base URLs based on environment
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const IS_DEV = import.meta.env.MODE === "development";

// Backend mounts:
//   app.use('/api/auth', authRoutes);
//   app.use('/api/function', teamRoutes);
// So we must target them separately instead of nesting /auth under /function
const AUTH_API_URL = IS_DEV ? "http://localhost:5000/api/auth" : `${API_BASE_URL}/api/auth`;
const FUNCTION_API_URL = IS_DEV ? "http://localhost:5000/api/function" : `${API_BASE_URL}/api/function`;

axios.defaults.withCredentials = true; // Essential for sending/receiving cookies (e.g., for authentication)

// --- User/Auth Related Service Calls ---
export const signupUser = async (email, username) => {
    const response = await axios.post(`${AUTH_API_URL}/signup`, { email, username });
    return response.data;
};

export const loginUser = async (email) => {
    const response = await axios.post(`${AUTH_API_URL}/login`, { email });
    return response.data;
};

export const saveUserDetail = async (email, phoneNumber, role) => {
    const response = await axios.post(`${AUTH_API_URL}/user-detail`, { email, phoneNumber, role });
    return response.data;
};

export const getUserProfile = async (email) => {
    const response = await axios.get(`${AUTH_API_URL}/profile/${email}`);
    return response.data;
};

export const getAllEmails = async () => {
    const response = await axios.get(`${FUNCTION_API_URL}/email`);
    return response.data.emails; // Assuming backend returns { emails: [...] }
};

// --- Task Related Service Calls (existing ones, adjusted to match potential backend path) ---

export const createTask = async (taskData) => {
    const response = await axios.post(`${FUNCTION_API_URL}/createtask`, taskData);
    return response.data;
};

export const acceptTask = async ({ taskId, email }) => { // Expects object for arguments
    const res = await axios.post(`${FUNCTION_API_URL}/accepttask`, { taskId, email });
    console.log("✅ Task accepted:", res.data.task);
    return res.data;
};

export const completeTask = async ({ taskId, email }) => { // Expects object for arguments
    const response = await axios.post(`${FUNCTION_API_URL}/updatetask`, { taskId, email });
    return response.data;
};

export const deleteTask = async ({ taskId }) => { // Expects object for arguments
    const res = await axios.post(`${FUNCTION_API_URL}/deletetask`, { taskId });
    console.log("🗑️ Task deleted:", res.data.message);
    return res.data;
};

export const getAssignedTasks = async (email) => {
    try {
        const res = await axios.get(`${FUNCTION_API_URL}/getTask`, { params: { email } });
        console.log("Fetched assigned tasks:", res.data.tasks);
        return res.data.tasks; // returns array of tasks
    } catch (error) {
        console.error("❌ Failed to fetch assigned tasks:", error);
        throw error;
    }
};


// --- NEW Task Detail and Updates Service Calls ---

export const getTaskById = async (taskId) => {
    const response = await axios.get(`${FUNCTION_API_URL}/tasks/${taskId}`);
    return response.data;
};

export const getTaskUpdates = async (taskId) => {
    const response = await axios.get(`${FUNCTION_API_URL}/tasks/${taskId}/updates`);
    return response.data;
};

export const createTaskUpdate = async (updateData) => {
    // updateData should contain { taskId, updateText, updatedBy, updateType }
    // The taskId is also part of the URL, so we extract it.
    const { taskId, ...restOfData } = updateData;
    const response = await axios.post(`${FUNCTION_API_URL}/tasks/${taskId}/updates`, restOfData);
    return response.data;
};
