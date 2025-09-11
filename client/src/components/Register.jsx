import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendEmailVerification // Import this if you want to explicitly send verification emails for non-Google sign-in, though less common for Google Auth.
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import { useAuthStore } from "../assests/store";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaSpinner, FaPhone, FaUserTag, FaChevronDown } from "react-icons/fa"; // Added new icons

const Register = () => {
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();
    const { user, signup, saveUserDetail } = useAuthStore(); // Destructure saveUserDetail
    const [loading, setLoading] = useState(false);
    const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
    const [userDetails, setUserDetails] = useState({
        phoneNumber: "",
        role: "user", // Default role
    });
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const roleDropdownRef = useRef(null); // Ref for click-outside detection

    const roleOptions = [
        { value: "user", label: "👤 User" },
        { value: "admin", label: "👑 Admin" },
        { value: "manager", label: "💼 Manager" },
        { value: "guest", label: "👋 Guest" },
    ];

    // Effect to check if user is already signed up and has core user data
    // This can trigger the user details form if they somehow end up here again
    // after initial signup but before completing details.
    useEffect(() => {
        // If the user object is present after a successful signup but userDetail is not,
        // and we are not already showing the form, display it.
        // This helps if they refresh the page after Google auth but before submitting details.
        // Also ensure the user's email is verified before showing the form.
        if (user && user.email && auth.currentUser?.emailVerified && !useAuthStore.getState().userDetail && !showUserDetailsForm) {
            setShowUserDetailsForm(true);
        }
    }, [user, showUserDetailsForm]);


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                setShowRoleDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            console.log("🔐 Starting Google Sign-Up...");
            const result = await signInWithPopup(auth, googleProvider);
            const currentUser = result.user; // Get user from result

            if (!currentUser?.email) {
                toast.error("❌ Google email not found. Please try again.");
                setLoading(false);
                return;
            }

            // --- IMPORTANT: Email Verification Check ---
            // For Google Sign-in, Firebase usually sets emailVerified to true automatically.
            // This check ensures it's indeed true before proceeding.
            if (!currentUser.emailVerified) {
                console.warn("🚫 Google email not verified by Firebase. Stopping signup.");
                toast.error("❌ Your Google email is not verified. Please verify your email through Google before signing up.");
                // Optionally, you might want to sign them out of Firebase here if their email isn't verified.
                await signOut(auth);
                setLoading(false);
                return;
            }
            // --- End Email Verification Check ---


            const email = currentUser.email;
            const displayName = currentUser.displayName;

            console.log("📤 Sending signup to backend for:", email, displayName);

            const signupSuccess = await signup(email, displayName); // Zustand call

            if (signupSuccess) {
                toast.success("🎉 Google Sign-Up successful! Please provide a few more details.");
                setShowUserDetailsForm(true); // Show the next form
            } else {
                console.warn("🚫 Zustand backend signup failed. Attempting to delete Firebase user.");
                useAuthStore.setState({ user: null }); // Clear user from store

                try {
                    await currentUser.delete(); // Delete Firebase Auth user if backend signup failed
                    console.log("🗑️ Firebase user deleted due to backend signup failure.");
                } catch (err) {
                    console.error("❌ Failed to delete Firebase user:", err);
                }
                toast.error("Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("❌ Google Sign-Up error:", error.message);
            let errorMessage = "Google Sign-Up failed. Please try again.";

            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-up cancelled. You closed the pop-up.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Sign-up request cancelled. Please try again.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account with this email already exists. Try logging in with a different method.';
            } else {
                // Generic error for other Firebase auth issues
                errorMessage = `Sign-Up failed: ${error.message}`;
            }

            toast.error(`❌ ${errorMessage}`);
            useAuthStore.setState({ user: null }); // Clear any partial user state

            // Attempt to sign out from Firebase to ensure clean state
            try {
                await signOut(auth);
                console.log("🧹 Firebase logout after failure.");
            } catch (logoutErr) {
                console.error("❌ Error logging out from Firebase:", logoutErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUserDetailsChange = (e) => {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
    };

    const handleSelectRole = (roleValue) => {
        setUserDetails({ ...userDetails, role: roleValue });
        setShowRoleDropdown(false);
    };

    const handleSaveUserDetails = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Ensure user is still authenticated and we have their email
        if (!user || !user.email || !auth.currentUser?.emailVerified) {
            toast.error("Authentication session invalid or email not verified. Please sign up again.");
            setLoading(false);
            return;
        }
        if (!userDetails.phoneNumber || !userDetails.role) {
            toast.error("Phone number and role are required.");
            setLoading(false);
            return;
        }

        try {
            console.log("📤 Sending user details to backend for:", user.email);
            const saveSuccess = await saveUserDetail(user.email, userDetails.phoneNumber, userDetails.role);

            if (saveSuccess) {
                toast.success("Details saved successfully! Welcome to TaskEase!");
                navigate("/profile"); // Navigate to profile after all details are saved
            } else {
                toast.error("Failed to save user details. Please try again.");
            }
        } catch (error) {
            console.error("❌ Error saving user details:", error);
            toast.error("An error occurred while saving details.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to get display label for selected dropdown value
    const getDisplayLabel = (value, options, placeholder) => {
        const selectedOption = options.find(option => option.value === value);
        return selectedOption ? selectedOption.label : placeholder;
    };

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut",
            },
        },
    };

    const buttonVariants = {
        hover: {
            scale: 1.07,
            boxShadow: "0px 10px 20px rgba(59, 130, 246, 0.4)",
            y: -5,
            transition: { duration: 0.2 },
        },
        tap: {
            scale: 0.93,
        },
    };

    const formFieldVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    };


    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                className="max-w-md w-full mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-blue-200 text-center relative overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

                <motion.h2
                    className="text-4xl font-extrabold mb-8 text-gray-900 drop-shadow-md"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <span className="text-blue-600">{showUserDetailsForm ? "Almost Done!" : "Join"}</span> TaskEase!
                </motion.h2>

                <AnimatePresence mode="wait">
                    {!showUserDetailsForm ? (
                        <motion.div
                            key="google-signup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.p
                                className="text-lg text-gray-700 mb-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                Create your account to start managing tasks and collaborating with your team.
                            </motion.p>

                            <motion.button
                                disabled={loading}
                                onClick={handleGoogleAuth}
                                className={`flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-2xl text-lg shadow-lg focus:outline-none focus:ring-4 transform transition-all duration-300 w-full
                                    ${loading
                                        ? "bg-blue-400 cursor-not-allowed text-gray-200"
                                        : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl focus:ring-blue-300"
                                    }`}
                                variants={buttonVariants}
                                whileHover={!loading ? "hover" : ""}
                                whileTap={!loading ? "tap" : ""}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-2xl" /> Signing you up...
                                    </>
                                ) : (
                                    <>
                                        <FaGoogle className="text-2xl" /> Sign Up with Google
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="user-details-form"
                            onSubmit={handleSaveUserDetails}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="space-y-6"
                        >
                            <p className="text-lg text-gray-700 mb-8">
                                Just a few more details to set up your profile.
                            </p>

                            {/* Phone Number Input */}
                            <motion.div
                                className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
                                variants={formFieldVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <FaPhone className="text-blue-500 ml-4 mr-2" />
                                <input
                                    type="tel" // Use tel for phone numbers
                                    name="phoneNumber"
                                    placeholder="Your Phone Number"
                                    value={userDetails.phoneNumber}
                                    onChange={handleUserDetailsChange}
                                    className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                                    required
                                />
                            </motion.div>

                            {/* Role Dropdown */}
                            <motion.div
                                className="relative"
                                ref={roleDropdownRef}
                                variants={formFieldVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.1 }}
                            >
                                <div
                                    className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200 cursor-pointer"
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                >
                                    <FaUserTag className="text-blue-500 ml-4 mr-2" />
                                    <div className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-700 font-medium">
                                        {getDisplayLabel(userDetails.role, roleOptions, "Select Your Role")}
                                    </div>
                                    <FaChevronDown className={`absolute right-4 text-blue-500 transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                </div>
                                <AnimatePresence>
                                    {showRoleDropdown && (
                                        <motion.ul
                                            className="absolute bg-white border border-blue-200 w-full z-20 max-h-48 overflow-y-auto shadow-lg rounded-b-xl mt-1 custom-scrollbar"
                                            variants={{
                                                hidden: { opacity: 0, y: -10, scaleY: 0.95, originY: 0 },
                                                visible: { opacity: 1, y: 0, scaleY: 1, originY: 0, transition: { duration: 0.2, ease: "easeOut" } },
                                                exit: { opacity: 0, y: -10, scaleY: 0.95, originY: 0, transition: { duration: 0.15, ease: "easeIn" } }
                                            }}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            {roleOptions.map((option, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    onClick={() => handleSelectRole(option.value)}
                                                    className={`px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors duration-200 text-gray-700 ${
                                                        userDetails.role === option.value ? "font-bold text-blue-600 bg-blue-50" : ""
                                                    }`}
                                                    whileHover={{ scale: 1.01, backgroundColor: "#E0F2FE" }}
                                                    transition={{ duration: 0.1 }}
                                                >
                                                    {option.label}
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-2xl text-lg shadow-lg focus:outline-none focus:ring-4 transform transition-all duration-300 w-full
                                    ${loading
                                        ? "bg-green-400 cursor-not-allowed text-gray-200"
                                        : "bg-green-600 hover:bg-green-700 text-white hover:shadow-xl focus:ring-green-300"
                                    }`}
                                variants={buttonVariants}
                                whileHover={!loading ? "hover" : ""}
                                whileTap={!loading ? "tap" : ""}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-2xl" /> Saving details...
                                    </>
                                ) : (
                                    <>
                                        <FaUserTag className="text-2xl" /> Complete Setup
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Register;
