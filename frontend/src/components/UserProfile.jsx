import React, { useEffect, useState } from "react";
import { useAuthStore } from "../assests/store";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { motion } from "framer-motion";
import {
  FaUserCircle, FaTasks, FaChartBar, FaCalendarDay, FaInfoCircle, FaCheckCircle, FaPlayCircle, FaTimesCircle, FaPlusSquare, FaExclamationTriangle
} from "react-icons/fa";

const UserProfile = () => {
  const { user, isAuthenticated, tasks, getUserTasks } = useAuthStore();
  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  // Fetch tasks when user is available
  useEffect(() => {
    if (user?.email) {
      getUserTasks(user.email);
    }
  }, [user, getUserTasks]);

  // Filter tasks due today and overdue tasks
  useEffect(() => {
    if (!tasks) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of the day

    const filteredToday = tasks.filter(
      (task) =>
        new Date(task.dueDate).toDateString() === today.toDateString() &&
        !task.completedDate
    );
    setTodayTasks(filteredToday);

    const filteredOverdue = tasks.filter(
      (task) =>
        new Date(task.dueDate) < today &&
        !task.completedDate
    );
    setOverdueTasks(filteredOverdue);
  }, [tasks]);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view this page.</p>
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

  // Map task stats with icons and specific colors for better visual representation
  const taskStats = [
    { name: "Assigned", value: user.TasksAssigned || 0, icon: <FaTasks />, color: "#4299E1" }, // Blue
    { name: "In Progress", value: user.TasksInProgress || 0, icon: <FaPlayCircle />, color: "#ECC94B" }, // Yellow
    { name: "Completed", value: user.TasksCompleted || 0, icon: <FaCheckCircle />, color: "#48BB78" }, // Green
    { name: "Not Started", value: user.TasksNotStarted || 0, icon: <FaTimesCircle />, color: "#F56565" }, // Red
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-4xl mx-auto mt-8 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-4"
          variants={itemVariants}
        >
          <FaUserCircle className="text-blue-600 text-4xl sm:text-5xl" /> Your Dashboard
        </motion.h2>

        {/* User Details & Task Stats Section */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* User Details Card */}
          <motion.div
            className="p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100 flex flex-col justify-between"
            variants={itemVariants}
          >
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
                <FaInfoCircle /> User Details
              </h3>
              <div className="space-y-3 text-md text-gray-700 mb-6">
                <p>
                  <strong>Name:</strong> <span className="font-semibold">{user.username || user.displayName || user.email?.split('@')[0]}</span>
                </p>
                <p>
                  <strong>Email:</strong> <span className="font-semibold">{user.email}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-3">
              <Link to="/tasks">
                <motion.button
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-blue-700 transition-all duration-200"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaTasks /> View All Tasks
                </motion.button>
              </Link>
              <Link to="/mywork">
                <motion.button
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-indigo-700 transition-all duration-200"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaPlusSquare /> Tasks Assigned By Me
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Task Stats Chart Card */}
          <motion.div
            className="p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100 flex flex-col"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
              <FaChartBar /> Task Statistics
            </h3>
            <div className="flex-grow h-48 mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="#6b7280" />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.15)' }}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #bfdbfe', boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#333', padding: '4px 0' }}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {taskStats.map((entry, index) => (
                      <Bar key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center text-xs mt-4 text-gray-700 gap-x-4 gap-y-2">
              {taskStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span style={{ color: stat.color }} className="text-lg">{stat.icon}</span>
                  {stat.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Today's Due Tasks Section */}
        <motion.div className="mt-6 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100" variants={itemVariants}>
          <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
            <FaCalendarDay /> Today's Due Tasks
          </h3>
          {todayTasks.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No tasks are due today. Enjoy your day!</p>
          ) : (
            <ul className="space-y-4">
              {todayTasks.map((task, index) => (
                <motion.li
                  key={index}
                  className="border border-blue-200 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-md font-semibold text-gray-800 mb-1">{task.task}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 text-sm text-gray-600">
                    <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                    <p><strong>Priority:</strong> <span className={`font-medium ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{task.priority}</span></p>
                    <p><strong>Frequency:</strong> {task.taskFrequency}</p>
                    {/* Changed to createdBy */}
                    {task.createdBy && <p className="col-span-2 sm:col-span-1"><strong>Assigned By:</strong> <span className="font-medium text-blue-700">{task.createdBy}</span></p>}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Overdue Tasks Section */}
        <motion.div className="mt-6 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100" variants={itemVariants}>
          <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center gap-2">
            <FaExclamationTriangle /> Overdue Tasks
          </h3>
          {overdueTasks.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No overdue tasks. Great job!</p>
          ) : (
            <ul className="space-y-4">
              {overdueTasks.map((task, index) => (
                <motion.li
                  key={index}
                  className="border border-red-200 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-md font-semibold text-gray-800 mb-1">{task.task}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 text-sm text-gray-600">
                    <p><strong>Due:</strong> <span className="text-red-500">{new Date(task.dueDate).toLocaleDateString()}</span></p>
                    <p><strong>Priority:</strong> <span className={`font-medium ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{task.priority}</span></p>
                    <p><strong>Frequency:</strong> {task.taskFrequency}</p>
                    {/* Changed to createdBy */}
                    {task.createdBy && <p className="col-span-2 sm:col-span-1"><strong>Assigned By:</strong> <span className="font-medium text-blue-700">{task.createdBy}</span></p>}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;