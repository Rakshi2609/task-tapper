import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/auth" // Assuming your auth/user detail routes are under /api/auth
    : `${API_BASE_URL}/api/auth`;

axios.defaults.withCredentials = true;

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null, // Core user data (email, username, task counts)
            userDetail: null, // New state for additional details (phone, role)
            isAuthenticated: false,
            error: null,
            isLoading: false,
            isCheckingAuth: true,
            message: null,
            tasks: [], // For assigned tasks

            // --- Authentication Actions ---
            signup: async (email, username) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post(`${API_URL}/signup`, {
                        email,
                        username
                    });

                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false
                    });

                    return true; // ✅ RETURN success
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error signing up",
                        isLoading: false,
                    });
                    console.error("❌ Signup failed in store:", error);
                    return false; // ❌ RETURN failure
                }
            },

            login: async (email) => {
                set({ isLoading: true, error: null });
                console.log("EMAIL SENDING TO BACKEND:", email);
                try {
                    const response = await axios.post(`${API_URL}/login`, { email });

                    set({
                        isAuthenticated: true,
                        user: response.data.user,
                        error: null,
                        isLoading: false,
                    });

                    console.log("RESPONSE FROM BACKEND:", response.data.user);

                    return true; // ✅ RETURN success
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error logging in",
                        isLoading: false,
                    });
                    console.error("❌ Login failed in store:", error);
                    return false; // ❌ RETURN failure
                }
            },

            // --- User Profile & Task Data Actions ---

            getUserProfile: async (email) => {
                set({ isLoading: true, error: null });

                try {
                    // Assuming this route returns the *core* user object (username, email, task counts)
                    const response = await axios.get(`${API_URL}/profile/${email}`);
                    set({
                        user: response.data.user,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error fetching profile",
                        isLoading: false,
                    });
                }
            },

            /**
             * Fetches detailed user information (phone number, role) for a given email.
             * Updates the `userDetail` state in the store.
             * @param {string} email - The email of the user whose details are to be fetched.
             * @returns {boolean} True if successful, false otherwise.
             */
            fetchUserDetail: async (email) => {
                set({ isLoading: true, error: null });
                console.log(`[fetchUserDetail] Fetching details for email: ${email}`);
                try {
                    // Make sure this matches your backend route (e.g., /api/auth/user-detail?email=...)
                    const response = await axios.get(`${API_URL}/user-detail`, { params: { email } });
                    console.log("[fetchUserDetail] User detail response:", response.data.userDetail);

                    set({
                        userDetail: response.data.userDetail, // Store the fetched user detail
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error fetching user details",
                        isLoading: false,
                        userDetail: null, // Clear userDetail on error
                    });
                    console.error("❌ Failed to fetch user details:", error);
                    return false;
                }
            },

            /**
             * Saves (creates or updates) detailed user information (phone number, role) for a user.
             * Expects the user to be already authenticated and `user` state to be set.
             * @param {string} email - The email of the user.
             * @param {string} phoneNumber - The user's phone number.
             * @param {string} role - The user's role.
             * @returns {boolean} True if successful, false otherwise.
             */
            saveUserDetail: async (email, phoneNumber, role) => {
                set({ isLoading: true, error: null });
                console.log(`[saveUserDetail] Saving details for email: ${email}`);
                try {
                    // This endpoint needs to be implemented on your backend
                    // It should find the User by email and then create/update the UserDetail document
                    const response = await axios.post(`${API_URL}/user-detail`, {
                        email,
                        phoneNumber,
                        role
                    });
                    console.log("[saveUserDetail] User detail save response:", response.data.userDetail);

                    set({
                        userDetail: response.data.userDetail, // Update userDetail state with the saved data
                        isLoading: false,
                        error: null,
                    });
                    return true;
                } catch (error) {
                    set({
                        error: error.response?.data?.message || "Error saving user details",
                        isLoading: false,
                    });
                    console.error("❌ Failed to save user details:", error);
                    return false;
                }
            },

            getAssignedByMe: async (email) => {
                set({ isLoading: true, error: null });

                try {
                    const res = await axios.get(`${API_URL}/assignedByMe`, { params: { email } });
                    console.log("📤 Tasks you assigned:", res.data.tasks);
                    set({ tasks: res.data.tasks || [], isLoading: false });
                } catch (error) {
                    console.error("❌ Failed to fetch assigned tasks:", error);
                    set({ tasks: [], error: "Failed to fetch assigned tasks", isLoading: false });
                }
            },

            getUserTasks: async (email) => {
                set({ isLoading: true, error: null });

                try {
                    console.log("📤 Fetching tasks for:", email);
                    const response = await axios.get(`${API_URL}/tasks/${email}`);
                    console.log("📥 Tasks fetched:", response.data.tasks);

                    set({
                        tasks: response.data.tasks || [],
                        isLoading: false,
                    });
                } catch (error) {
                    console.error("❌ Error fetching tasks:", error);
                    set({
                        error: error.response?.data?.message || "Error fetching tasks",
                        isLoading: false,
                        tasks: [], // fallback in case of error
                    });
                }
            },
        }),
        {
            name: "auth-storage", // localStorage key
            // You might want to omit `userDetail` from persistence if it changes frequently
            // or if you prefer to always fetch it fresh.
            // If you want to persist it, make sure its structure is simple and JSON-serializable.
            // partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, userDetail: state.userDetail }),
        }
    )
);

// --- Task Service Actions (can remain separate or be integrated if preferred) ---
// These are currently outside the useAuthStore definition, which is fine if they are
// general services. If they rely heavily on auth state, you might consider moving them
// inside the store or passing necessary auth data to them.

// export const createTask = async (taskData) => {
//     const response = await axios.post(`${API_URL}/createtask`, taskData);
//     return response.data;
// };

// export const acceptTask = async ({ taskId, email }) => {
//     const response = await axios.post(`${API_URL}/accepttask`, { taskId, email });
//     return response.data;
// };

// export const completeTask = async ({ taskId, email }) => {
//     const response = await axios.post(`${API_URL}/updatetask`, { taskId, email });
//     return response.data;
// };

// // If you have an endpoint for getting all emails outside of a user-specific context
// export const getAllEmails = async () => {
//     const response = await axios.get(`${API_URL}/getallemails`); // Adjust this endpoint if needed
//     return response.data.emails;
// };
