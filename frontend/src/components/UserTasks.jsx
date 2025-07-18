import React, { useEffect, useState } from "react";
import { useAuthStore } from "../assests/store";
import {
  completeTask as completeTaskAPI,
  deleteTask as deleteTaskAPI,
} from "../services/taskService";
import {
  FaSort,
  FaCalendarAlt,
  FaCheck,
  FaTasks,
  FaRegSadTear,
  FaSpinner,
  FaUserCircle,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const UserTasks = () => {
  const {
    user,
    tasks,
    isLoading,
    error,
    getUserTasks,
    getUserProfile,
  } = useAuthStore();

  const [sortBy, setSortBy] = useState("none");
  const [selectedDate, setSelectedDate] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  const handleComplete = async (taskId) => {
    if (!user?.email) return;
    try {
      await completeTaskAPI(taskId, user.email);
      toast.success("✅ Task marked as completed!");
      getUserTasks(user.email);
      getUserProfile(user.email);
    } catch (e) {
      toast.error("❌ Could not complete task: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTaskAPI(taskId);
      toast.success("🗑️ Task deleted successfully!");
      getUserTasks(user.email);
      getUserProfile(user.email);
    } catch (e) {
      toast.error("❌ Failed to delete task: " + (e.response?.data?.message || e.message));
    }
  };

  useEffect(() => {
    if (user?.email) {
      getUserTasks(user.email);
    }
  }, [user, getUserTasks]);

  useEffect(() => {
    if (!tasks) return;
    let filteredAndSortedTasks = [...tasks];

    if (selectedDate) {
      filteredAndSortedTasks = filteredAndSortedTasks.filter(
        (task) => new Date(task.dueDate).toDateString() === selectedDate.toDateString()
      );
    }

    if (sortBy === "dueDate") {
      filteredAndSortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      filteredAndSortedTasks.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
    } else if (sortBy === "daily") {
      filteredAndSortedTasks = filteredAndSortedTasks.filter(task => task.taskFrequency === "Daily");
    } else if (sortBy === "weekly") {
      filteredAndSortedTasks = filteredAndSortedTasks.filter(task => task.taskFrequency === "Weekly");
    } else if (sortBy === "monthly") {
      filteredAndSortedTasks = filteredAndSortedTasks.filter(task => task.taskFrequency === "Monthly");
    } else if (sortBy === "all") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      filteredAndSortedTasks.sort((a, b) => {
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      });
    }

    setPendingTasks(filteredAndSortedTasks.filter(task => !task.completedDate));
    setCompletedTasks(filteredAndSortedTasks.filter(task => task.completedDate));
  }, [tasks, sortBy, selectedDate]);

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const taskCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hover: { scale: 1.02, boxShadow: "0px 6px 20px rgba(59, 130, 246, 0.15)" },
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case "High": return "border-red-500";
      case "Medium": return "border-orange-500";
      case "Low": return "border-cyan-500";
      default: return "border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-4xl mx-auto mt-8 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-4"
          variants={itemVariants}
        >
          <FaTasks className="text-blue-600 text-4xl sm:text-5xl" /> Your Tasks
        </motion.h2>

        <motion.div
          className="bg-blue-50 p-5 rounded-xl shadow-md border border-blue-100 mb-8 flex flex-wrap justify-between items-center gap-4"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <FaSort className="text-2xl text-blue-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-blue-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 bg-white hover:border-blue-400 transition-all duration-200"
            >
              <option value="none">Sort: Default</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="daily">Frequency: Daily</option>
              <option value="weekly">Frequency: Weekly</option>
              <option value="monthly">Frequency: Monthly</option>
              <option value="all">Due Date & Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-2xl text-blue-600" />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              placeholderText="Filter by Due Date"
              className="border border-blue-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 bg-white hover:border-blue-400 transition-all duration-200 w-44"
              wrapperClassName="w-full"
            />
            {selectedDate && (
              <motion.button
                onClick={() => setSelectedDate(null)}
                className="ml-2 text-red-500 hover:text-red-700 font-medium text-sm transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Clear
              </motion.button>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <motion.p className="text-center text-blue-600 text-lg font-medium py-10 flex items-center justify-center gap-3">
            <FaSpinner className="animate-spin text-2xl" /> Loading tasks...
          </motion.p>
        ) : error ? (
          <motion.p className="text-red-600 text-center text-lg font-medium py-10">
            <FaRegSadTear className="inline-block mr-2 text-2xl" /> {error}
          </motion.p>
        ) : (
          <>
            <motion.h3 className="text-2xl font-bold mt-8 mb-4 text-blue-800 flex items-center gap-2">
              <span className="text-yellow-600">🕒</span> Pending Tasks
            </motion.h3>

            {pendingTasks.length === 0 ? (
              <motion.p className="text-gray-600 italic text-center py-4">
                No pending tasks found. Time to relax!
              </motion.p>
            ) : (
              <ul className="space-y-4">
                {pendingTasks.map((task, index) => (
                  <motion.li
                    key={task._id || index}
                    className={`bg-white border-l-4 ${getPriorityBorderColor(task.priority)} p-5 rounded-lg shadow-md transition-all duration-300`}
                    variants={taskCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{task.task}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FaCalendarAlt className="text-blue-400" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className={`font-bold ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                          🔥 Priority: {task.priority}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="text-purple-500">🔁</span> Frequency: {task.taskFrequency}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FaUserCircle className="text-indigo-400" /> Assigned By: <span className="font-medium text-blue-700">{task.createdBy}</span>
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                        <motion.button
                          onClick={() => handleComplete(task._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow text-sm font-medium transition-all duration-300 w-full sm:w-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaCheck className="inline mr-1" /> Complete
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(task._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow text-sm font-medium transition-all duration-300 w-full sm:w-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🗑 Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

            <motion.h3 className="text-2xl font-bold mt-10 mb-4 text-blue-800 flex items-center gap-2">
              <span className="text-green-600">✅</span> Completed Tasks
            </motion.h3>

            {completedTasks.length === 0 ? (
              <motion.p className="text-gray-500 italic text-center py-4">
                No completed tasks yet. Keep up the good work!
              </motion.p>
            ) : (
              <ul className="space-y-4">
                {completedTasks.map((task, index) => (
                  <motion.li
                    key={task._id || index}
                    className="bg-gray-100 border-l-4 border-green-500 p-5 rounded-lg shadow-sm"
                    variants={taskCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-lg line-through font-medium text-gray-700">{task.task}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaCheck className="text-green-500" /> Completed on: {new Date(task.completedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt className="text-blue-400" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaUserCircle className="text-indigo-300" /> Assigned By: <span className="font-light">{task.createdBy}</span>
                    </p>
                  </motion.li>
                ))}
              </ul>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UserTasks;
