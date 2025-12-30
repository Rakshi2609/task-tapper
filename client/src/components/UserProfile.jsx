import React, { useEffect } from "react";
import { useAuthStore } from "../assests/store";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaTasks,
  FaInfoCircle,
  FaCheckCircle,
  FaPlayCircle,
  FaTimesCircle,
  FaPlusSquare,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";

const UserProfile = () => {
  const { user, isAuthenticated, userDetail, fetchUserDetail } = useAuthStore();
  const navigate = useNavigate();

  // Fetch extended user details (phone, role) if not present
  useEffect(() => {
    if (user?.email && !userDetail) {
      fetchUserDetail(user.email);
    }
  }, [user, fetchUserDetail, userDetail]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useAuthStore.setState({ user: null, isAuthenticated: false, userDetail: null, tasks: [] });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Framer Motion variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const linkButtonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 15px rgba(59, 130, 246, 0.3)" },
    tap: { scale: 0.95 },
  };

  // Conditional rendering for unauthenticated user
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-xl border border-blue-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <FaInfoCircle className="text-red-500 text-5xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view this page.
          </p>
          <Link to="/login">
            <motion.button
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:bg-blue-700 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-1 sm:p-2 lg:p-3">
      <motion.div
        className="max-w-3xl mx-auto mt-2 sm:mt-3 p-3 sm:p-4 lg:p-5 bg-white rounded-2xl shadow-2xl border border-blue-200 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-2"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <FaUserCircle className="text-blue-600 text-xl sm:text-2xl lg:text-3xl" /> User Profile
        </motion.h2>

        {/* User Details Card */}
        <motion.div
          className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-md border border-blue-100 flex flex-col gap-2"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <h3 className="text-sm sm:text-base font-bold mb-2 text-blue-800 flex items-center gap-1">
              <FaInfoCircle className="text-xs" /> User Details
            </h3>
            {/* Header with avatar and greeting */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <FaUserCircle className="text-blue-600 text-3xl sm:text-4xl" />
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Welcome back,</p>
                <p className="text-base sm:text-lg font-extrabold text-gray-900">
                  {user.username || user.displayName || user.email?.split("@")[0]}
                </p>
              </div>
            </div>

            {/* Contact & Account Info */}
            <div className="grid grid-cols-1 gap-1.5 text-[10px] sm:text-xs text-gray-700 mb-2">
              <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-2 py-1">
                <span className="font-medium">Email</span>
                <span className="font-semibold text-blue-800 truncate max-w-[60%] text-right">{user.email}</span>
              </div>
              <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-2 py-1">
                <span className="font-medium">Phone</span>
                <span className="font-semibold text-blue-800">{userDetail?.phoneNumber || "—"}</span>
              </div>
              <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-2 py-1">
                <span className="font-medium">Role</span>
                <span className="font-semibold text-blue-800 capitalize">{userDetail?.role || "user"}</span>
              </div>
              <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-2 py-1">
                <span className="font-medium">Member since</span>
                <span className="font-semibold text-blue-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-2 py-1">
                <span className="font-medium">Last login</span>
                <span className="font-semibold text-blue-800">
                  {auth.currentUser?.metadata?.lastSignInTime
                    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-2 py-1">
                <span className="font-medium">Email verified</span>
                <span className="font-semibold text-blue-800">{auth.currentUser?.emailVerified ? "Yes" : "No"}</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-1.5">
              <Link to="/communities">
                <motion.button
                  className="w-full bg-white border border-blue-200 text-blue-700 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold hover:bg-blue-50"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaUsers className="inline mr-1" />
                  Communities
                </motion.button>
              </Link>
              <Link to="/chat">
                <motion.button
                  className="w-full bg-white border border-indigo-200 text-indigo-700 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold hover:bg-indigo-50"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  World Chat
                </motion.button>
              </Link>
            </div>

            {/* Compact Task Summary */}
            <div className="mt-2">
              <h4 className="text-xs font-semibold text-blue-800 mb-1">My Task Summary</h4>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-md px-1.5 sm:px-2 py-1">
                  <span className="flex items-center gap-0.5 sm:gap-1 text-gray-700 text-[10px] sm:text-xs"><FaTasks className="text-blue-500 text-[10px]"/> Assigned</span>
                  <span className="text-blue-900 font-bold text-xs sm:text-sm">{user?.TasksAssigned || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-yellow-100 rounded-md px-1.5 sm:px-2 py-1">
                  <span className="flex items-center gap-0.5 sm:gap-1 text-gray-700 text-[10px] sm:text-xs"><FaPlayCircle className="text-yellow-500 text-[10px]"/> In Progress</span>
                  <span className="text-yellow-700 font-bold text-xs sm:text-sm">{user?.TasksInProgress || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-green-100 rounded-md px-1.5 sm:px-2 py-1">
                  <span className="flex items-center gap-0.5 sm:gap-1 text-gray-700 text-[10px] sm:text-xs"><FaCheckCircle className="text-green-500 text-[10px]"/> Completed</span>
                  <span className="text-green-700 font-bold text-xs sm:text-sm">{user?.TasksCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-red-100 rounded-md px-1.5 sm:px-2 py-1">
                  <span className="flex items-center gap-0.5 sm:gap-1 text-gray-700 text-[10px] sm:text-xs"><FaTimesCircle className="text-red-500 text-[10px]"/> Not Started</span>
                  <span className="text-red-700 font-bold text-xs sm:text-sm">{user?.TasksNotStarted || 0}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-start items-start sm:items-center gap-1.5">
            <Link to="/dashboard">
              <motion.button
                className="flex items-center gap-1 bg-indigo-600 text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium shadow-md hover:bg-indigo-700 transition-all duration-200"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaTasks /> View Dashboard
              </motion.button>
            </Link>
            <Link to="/tasks">
              <motion.button
                className="flex items-center gap-1 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium shadow-md hover:bg-blue-700 transition-all duration-200"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaTasks /> View All Tasks
              </motion.button>
            </Link>
            <Link to="/mywork">
              <motion.button
                className="flex items-center gap-1 bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium shadow-md hover:bg-purple-700 transition-all duration-200"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaPlusSquare /> Tasks Assigned By Me
              </motion.button>
            </Link>
          </div>

          {/* Logout Button */}
          <div className="mt-2 flex justify-center">
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold shadow-md hover:bg-red-700 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignOutAlt /> Logout
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;