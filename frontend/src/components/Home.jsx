import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import {
  FaPlusCircle,
  FaClipboardList,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 6px 18px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-100 text-gray-800 px-4 py-8 relative overflow-hidden">

      {/* Optional floating blobs */}
      <div className="absolute w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 -top-28 -left-28 animate-pulse"></div>
      <div className="absolute w-80 h-80 bg-indigo-300 rounded-full blur-3xl opacity-30 -bottom-24 right-0 animate-pulse"></div>

      <motion.div
        className="max-w-3xl w-full mx-auto p-10 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-blue-200 text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {user ? (
          <>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
              variants={itemVariants}
            >
              Welcome, <span className="text-blue-600">{user.displayName || user.email?.split("@")[0]}</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-8 text-gray-700 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Your personal task board is ready. Manage, track, and collaborate efficiently with ease.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center gap-6"
              variants={itemVariants}
            >
              <Link to="/create">
                <motion.button
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-md focus:ring-4 focus:ring-blue-300 transition-all duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaPlusCircle /> Create Task
                </motion.button>
              </Link>
              <Link to="/tasks">
                <motion.button
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-md focus:ring-4 focus:ring-indigo-300 transition-all duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaClipboardList /> My Tasks
                </motion.button>
              </Link>
              <Link to="/profile">
                <motion.button
                  className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-md focus:ring-4 focus:ring-gray-300 transition-all duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaUserCircle /> Profile
                </motion.button>
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
              variants={itemVariants}
            >
              Welcome to <span className="text-blue-600">TaskEase</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg mb-8 text-gray-700 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Streamline your workflow. Assign tasks, track deadlines, and stay in sync with your team—beautifully and effortlessly.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center gap-6"
              variants={itemVariants}
            >
              <Link to="/login">
                <motion.button
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-md focus:ring-4 focus:ring-blue-300 transition-all duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaSignInAlt /> Login
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl text-base font-semibold shadow-md hover:bg-blue-50 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaUserPlus /> Register
                </motion.button>
              </Link>
            </motion.div>
          </>
        )}

        <motion.div
          className="mt-10 text-sm text-gray-500 font-medium"
          variants={itemVariants}
        >
          🚀 Built with love to supercharge your productivity
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
