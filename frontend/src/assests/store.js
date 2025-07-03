import { create } from "zustand";
import axios from "axios";
import { persist } from "zustand/middleware";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
const API_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api/function"
  : `${API_BASE_URL}/api/function`;

axios.defaults.withCredentials = true;

//     user: null,
//     isAuthenticated: false,
//     error: null,
//     isLoading: false,
//     isCheckingAuth: true,
//     message: null,

//     signup: async (email, username ) => {
//         set({ isLoading: true, error: null });
//         try {
//             const response = await axios.post(`${API_URL}/signup`, {
//                 email,
//                 username
//             });

//             set({ user: response.data.user, isAuthenticated: true, isLoading: false });
//         } catch (error) {
//             set({
//                 error: error.response?.data?.message || "Error signing up",
//                 isLoading: false,
//             });
//             throw error;
//         }
//     },
    
//     login: async (email) => {
//         set({ isLoading: true, error: null });
//         console.log("EMAIL SENDING TO BACKEND:", email);
//         try {
//             const response = await axios.post(`${API_URL}/login`, {
//                 email, 
//             });
//             set({
//                 isAuthenticated: true,
//                 user: response.data.user,
//                 error: null,
//                 isLoading: false,
//             });
//         } catch (error) {
//             set({
//                 error: error.response?.data?.message || "Error logging in",
//                 isLoading: false,
//             });
//             throw error;
//         }
//     },

//     // checkAuthStatus: async () => {
//     //     set({ isCheckingAuth: true });
//     //     try {
//     //         // Make an API call to check if a session exists (e.g., a protected route)
//     //         // const response = await axios.get(`${API_URL}/session`); // Example endpoint
//     //         set({
//     //             // user: response.data.user,
//     //             isAuthenticated: true,
//     //             isCheckingAuth: false,
//     //             error: null,
//     //         });
//     //     } catch (error) {
//     //         // If session check fails, user is not authenticated
//     //         set({
//     //             user: null,
//     //             isAuthenticated: false,
//     //             isCheckingAuth: false,
//     //             error: null, // Or set an error if needed
//     //         });
//     //     }
//     // },

//     // logout: async () => { // Add a logout action too
//     //     set({ isLoading: true, error: null });
//     //     try {
//     //         await axios.post(`${API_URL}/logout`);
//     //         set({ user: null, isAuthenticated: false, isLoading: false });
//     //     } catch (error) {
//     //         set({
//     //             error: error.response?.data?.message || "Error logging out",
//     //             isLoading: false,
//     //         });
//     //     }
//     // },
    

// }));

// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import axios from "axios";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,
    tasks: [],

    signup: async (email, username ) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                username
            });

            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error signing up",
                isLoading: false,
            });
            throw error;
        }
    },
    
    login: async (email) => {
        set({ isLoading: true, error: null });
        console.log("EMAIL SENDING TO BACKEND:", email);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email, 
            });
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
            console.log("RESPONSE FROM BACKEND:", response.data.user);
            // console.log("RESPONSE FROM Front:", user);

        } catch (error) {
            set({
                error: error.response?.data?.message || "Error logging in",
                isLoading: false,
            });
            throw error;
        }
    },

    // checkAuthStatus: async () => {
    //     set({ isCheckingAuth: true });
    //     try {
    //         // Make an API call to check if a session exists (e.g., a protected route)
    //         // const response = await axios.get(`${API_URL}/session`); // Example endpoint
    //         set({
    //             // user: response.data.user,
    //             isAuthenticated: true,
    //             isCheckingAuth: false,
    //             error: null,
    //         });
    //     } catch (error) {
    //         // If session check fails, user is not authenticated
    //         set({
    //             user: null,
    //             isAuthenticated: false,
    //             isCheckingAuth: false,
    //             error: null, // Or set an error if needed
    //         });
    //     }
    // },

    // logout: async () => { // Add a logout action too
    //     set({ isLoading: true, error: null });
    //     try {
    //         await axios.post(`${API_URL}/logout`);
    //         set({ user: null, isAuthenticated: false, isLoading: false });
    //     } catch (error) {
    //         set({
    //             error: error.response?.data?.message || "Error logging out",
    //             isLoading: false,
    //         });
    //     }
    // },
    getUserProfile: async (email) => {
        set({ isLoading: true, error: null });

        try {
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
    }
  )
);

        export const createTask = async (taskData) => {
          const response = await axios.post(`${API_URL}/createtask`, taskData);
          return response.data;
        };
        
        // 2. Accept a task
        export const acceptTask = async ({ taskId, email }) => {
          const response = await axios.post(`${API_URL}/accepttask`, { taskId, email });
          return response.data;
        };
        
        // 3. Mark task as completed
        export const completeTask = async ({ taskId, email }) => {
          const response = await axios.post(`${API_URL}/updatetask`, { taskId, email });
          return response.data;
        };
