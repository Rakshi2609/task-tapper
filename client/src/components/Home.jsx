import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  FaPlusCircle,
  FaClipboardList,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaComments,
  FaUserCircle,
  FaTasks,
  FaCalendarCheck,
  FaSyncAlt,
  FaRegCalendarPlus,
  FaRecycle,
} from "react-icons/fa";
import { useAuthStore } from "../assests/store";
import { getAllRecurringTasks } from "../services/rexurring";

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { tasks, getUserTasks, getUserProfile } = useAuthStore();
  const [oneTimeTasksCount, setOneTimeTasksCount] = useState(0);
  const [recurringTasksCount, setRecurringTasksCount] = useState(0);
  const [assignedByMeCount, setAssignedByMeCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        getUserTasks(currentUser.email);
        getUserProfile(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, [getUserTasks, getUserProfile]);

  useEffect(() => {
    if (tasks && user) {
      const pendingTasks = tasks.filter((task) => !task.completedDate);

      const oneTime = pendingTasks.filter(
        (task) => !task.taskFrequency || task.taskFrequency === "OneTime"
      ).length;
      setOneTimeTasksCount(oneTime);

      const assignedByMe = tasks.filter(
        (task) => task.createdBy === user.email
      ).length;
      setAssignedByMeCount(assignedByMe);
    }
  }, [tasks, user]);

  // Fetch and compute Recurring Tasks count from backend recurring API
  useEffect(() => {
    const loadRecurringCount = async () => {
      if (!user) return;
      try {
        const res = await getAllRecurringTasks();
        const allTasks = Array.isArray(res?.data) ? res.data : [];
        const pending = allTasks.filter(
          (t) => !t.completedDate && (t?.taskAssignedTo?.email === user.email)
        ).length;
        setRecurringTasksCount(pending);
      } catch (e) {
        // Fallback: show 0 if fetch fails
        setRecurringTasksCount(0);
      }
    };
    loadRecurringCount();
  }, [user]);

  // The handleLogout function is no longer needed in this component
  // as the logout button is removed.

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 4px 15px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const navLinkClasses =
    "flex items-center gap-3 bg-white text-gray-800 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">

        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Manage your one-time and recurring tasks with ease.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {user ? (
            <>
              <Link to="/tasks">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaCalendarCheck className="text-blue-500 text-2xl" />
                  <span className="font-semibold">
                    One-Time Tasks ({oneTimeTasksCount})
                  </span>
                </motion.div>
              </Link>
              <Link to="/recurring/list">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaSyncAlt className="text-green-500 text-2xl" />
                  <span className="font-semibold">
                    Recurring Tasks ({recurringTasksCount})
                  </span>
                </motion.div>
              </Link>
              <Link to="/mywork">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaClipboardList className="text-purple-500 text-2xl" />
                  <span className="font-semibold">
                    Tasks Assigned by Me ({assignedByMeCount})
                  </span>
                </motion.div>
              </Link>
              <Link to="/create">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaRegCalendarPlus className="text-yellow-500 text-2xl" />
                  <span className="font-semibold">Create One-Time Task</span>
                </motion.div>
              </Link>
              <Link to="/recurring/create">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaRecycle className="text-purple-500 text-2xl" />
                  <span className="font-semibold">Create Recurring Task</span>
                </motion.div>
              </Link>
              <Link to="/chat">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaComments className="text-indigo-500 text-2xl" />
                  <span className="font-semibold">Chat</span>
                </motion.div>
              </Link>
              <Link to="/profile">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaUserCircle className="text-gray-500 text-2xl" />
                  <span className="font-semibold">Profile</span>
                </motion.div>
              </Link>
              {/* Removed Logout button from Home page */}
            </>
          ) : (
            <>
              <Link to="/login">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaSignInAlt className="text-blue-500 text-2xl" />
                  <span className="font-semibold">Login</span>
                </motion.div>
              </Link>
              <Link to="/signup">
                <motion.div
                  className={navLinkClasses}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaUserPlus className="text-green-500 text-2xl" />
                  <span className="font-semibold">Sign Up</span>
                </motion.div>
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;