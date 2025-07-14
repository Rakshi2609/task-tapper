import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify"; // ONLY import toast, not ToastContainer
// Ensure 'react-toastify/dist/ReactToastify.css' is imported somewhere in your project (e.g., App.js or main.jsx)

import { useAuthStore } from "../assests/store";
import { motion } from "framer-motion"; // Import motion
import { FaGoogle, FaSpinner } from "react-icons/fa"; // Import Google and Spinner icons

const Register = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const { signup } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      console.log("🔐 Starting Google Sign-Up...");
      await signInWithPopup(auth, googleProvider);

      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        toast.error("❌ Google email not found. Please try again.");
        return;
      }

      const email = currentUser.email;
      const displayName = currentUser.displayName;

      console.log("📤 Sending signup to backend for:", email, displayName);

      const signupSuccess = await signup(email, displayName); // Zustand call

      if (!signupSuccess) {
        console.warn("🚫 Zustand signup failed. Deleting Firebase user.");
        useAuthStore.setState({ user: null });

        try {
          await currentUser.delete(); // Delete Firebase Auth user
          console.log("🗑️ Firebase user deleted due to signup failure.");
        } catch (err) {
          console.error("❌ Failed to delete Firebase user:", err);
        }

        toast.error("Signup failed. Please try again.");
        return;
      }

      toast.success("🎉 Google Sign-Up successful!");
      navigate("/profile"); // Navigate to profile or home after successful signup
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
        errorMessage = `Sign-Up failed: ${error.message}`;
      }

      toast.error(`❌ ${errorMessage}`);

      useAuthStore.setState({ user: null });

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
      scale: 1.07, // Slightly larger scale on hover
      boxShadow: "0px 10px 20px rgba(59, 130, 246, 0.4)", // More pronounced blue glow shadow
      y: -5, // Lift button slightly
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.93, // Deeper press on tap
    },
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* ToastContainer is rendered globally in main.jsx, so no need to render it here */}

      <motion.div
        className="max-w-md w-full mx-auto p-10 bg-white rounded-3xl shadow-2xl border border-blue-200 text-center relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background element for subtle visual interest */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-4xl font-extrabold mb-8 text-gray-900 drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="text-blue-600">Join</span> TaskEase!
        </motion.h2>

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
          onClick={handleGoogleSignUp}
          className={`flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-2xl text-lg shadow-lg focus:outline-none focus:ring-4 transform transition-all duration-300 w-full
            ${loading
              ? "bg-blue-400 cursor-not-allowed text-gray-200" // Lighter blue, gray text when loading
              : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl focus:ring-blue-300"
            }`}
          variants={buttonVariants}
          whileHover={!loading ? "hover" : ""} // Disable hover animation when loading
          whileTap={!loading ? "tap" : ""}     // Disable tap animation when loading
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
    </div>
  );
};

export default Register;