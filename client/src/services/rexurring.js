import axios from "axios";

// These variables are loaded from your .env file
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : `${API_BASE_URL}/api`;

/**
 * Fetches all recurring tasks.
 * @returns {Promise<Object>} The response data containing all recurring tasks.
 */
export const getAllRecurringTasks = async () => {
    const res = await axios.get(`${API_URL}/recurring-tasks`);
    return res.data;
};

/**
 * Creates a new recurring task.
 * @param {Object} taskData - The data for the new recurring task.
 * @returns {Promise<Object>} The response data for the created task.
 */
export const createRecurringTask = async (taskData) => {
    const res = await axios.post(`${API_URL}/recurring-tasks`, taskData);
    return res.data;
};

/**
 * Updates an existing recurring task by ID.
 * @param {string} id - The ID of the task to update.
 * @param {Object} taskData - The updated data for the task.
 * @returns {Promise<Object>} The response data for the updated task.
 */
export const updateRecurringTask = async (id, taskData) => {
    const res = await axios.put(`${API_URL}/recurring-tasks/${id}`, taskData);
    return res.data;
};

/**
 * Deletes an existing recurring task by ID.
 * @param {string} id - The ID of the task to delete.
 * @returns {Promise<Object>} The response data for the deleted task.
 */
export const deleteRecurringTask = async (id) => {
    const res = await axios.delete(`${API_URL}/recurring-tasks/${id}`);
    return res.data;
};

/**
 * Fetches a single recurring task by its ID.
 * @param {string} taskId - The ID of the recurring task.
 * @returns {Promise<Object>} The response data containing the recurring task details.
 */
export const getRecurringTaskById = async (taskId) => {
    const res = await axios.get(`${API_URL}/recurring-tasks/${taskId}`);
    return res.data;
};

/**
 * Fetches all updates for a specific recurring task.
 * @param {string} taskId - The ID of the recurring task.
 * @returns {Promise<Object>} The response data containing all task updates.
 */
export const getRecurringTaskUpdates = async (taskId) => {
    const res = await axios.get(`${API_URL}/recurring-tasks/${taskId}/updates`);
    return res.data;
};

/**
 * Creates a new update for a recurring task.
 * @param {Object} updateData - The data for the new update (taskId, updateText, updatedBy).
 * @returns {Promise<Object>} The response data for the created update.
 */
export const createRecurringTaskUpdate = async (updateData) => {
    const res = await axios.post(`${API_URL}/recurring-tasks/${updateData.taskId}/updates`, updateData);
    return res.data;
};

/**
 * Deletes a specific update for a recurring task by its update ID.
 * @param {string} updateId - The ID of the update to delete.
 * @returns {Promise<Object>} The response data for the deleted update.
 */
export const deleteRecurringTaskUpdate = async (updateId) => {
    const res = await axios.delete(`${API_URL}/recurring-tasks/updates/${updateId}`);
    return res.data;
};

/**
 * Marks a recurring task as complete by its ID.
 * @param {Object} data - Object containing taskId and email.
 * @returns {Promise<Object>} The response data for the updated task.
 */
export const completeRecurringTask = async ({ taskId, email }) => {
    const res = await axios.put(`${API_URL}/recurring-tasks/complete/${taskId}`, { email });
    return res.data;
};