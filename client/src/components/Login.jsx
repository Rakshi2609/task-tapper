import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from 'react-toastify'; // ONLY import toast, not ToastContainer
// Ensure 'react-toastify/dist/ReactToastify.css' is imported somewhere in your project (e.g., App.js or main.jsx)

import { useAuthStore } from "../assests/store";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // Destructure login function from useAuthStore
  const { login } = useAuthStore();

  const handleGoogleSignUp = async () => {
    try {
      console.log("🔐 Initiating Google sign-in...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Firebase sign-in successful");

      const currentUser = auth.currentUser;
      console.log("👤 Firebase user:", currentUser);

      const email = currentUser?.email;
      const displayName = currentUser?.displayName;

      if (!email) {
        console.error("❌ No email found from Firebase user.");
        toast.error("Google email not found. Please try again.");
        return;
      }

      console.log("📤 Sending email to backend login API:", email);
      const loginSuccess = await login(email); // Call the login action from the store
      if (!loginSuccess) {
        // If backend login fails, clear user state and sign out from Firebase
        useAuthStore.setState({ user: null });
        await signOut(auth);
        toast.error("Login failed. Your account might not be registered.");
        return;
      }

      console.log("✅ Zustand login success, user stored.");
      toast.success(`Welcome back, ${displayName || email.split("@")[0]}!`);
      navigate("/");
    } catch (error) {
      console.error("❌ Google Sign-In failed:", error);
      let errorMessage = "Google Sign-In failed. Please try again.";

      // More specific error messages for common Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. You closed the pop-up.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Sign-in request cancelled. Please try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account with this email already exists. Try logging in with a different method.';
      } else {
        errorMessage = `Sign-In failed: ${error.message}`;
      }

      toast.error(`❌ ${errorMessage}`);

      // Fail-safe logout from Firebase if sign-in failed
      try {
        await signOut(auth);
        console.log("🧹 Firebase logout after failure.");
      } catch (logoutErr) {
        console.error("❌ Error logging out from Firebase:", logoutErr);
      }

      // Ensure Zustand user state is null on failure
      useAuthStore.setState({ user: null });
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
      {/* <ToastContainer /> is REMOVED from this component */}

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
          <span className="text-blue-600">Welcome</span> Back!
        </motion.h2>

        <motion.p
          className="text-lg text-gray-700 mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Sign in to manage your tasks and boost your productivity.
        </motion.p>

        <motion.button
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transform transition-all duration-300 w-full"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FaGoogle className="text-2xl" /> Sign In with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;