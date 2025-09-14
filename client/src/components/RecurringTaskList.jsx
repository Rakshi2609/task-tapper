import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../assests/store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import {
  FaSearch,
  FaRedo,
  FaListUl,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaTimesCircle,
  FaBolt,
  FaCommentAlt,
  FaCheck,
  FaTrashAlt,
} from 'react-icons/fa';
import {
  getAllRecurringTasks,
  completeRecurringTask, // <-- Use the correct function
  deleteRecurringTask,
} from '../services/rexurring';

const RecurringTaskList = () => {
  const { user, getUserTasks, getUserProfile } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecurringTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllRecurringTasks();
      // Service already returns the response body: { success: true, data: [...] }
      const allTasks = Array.isArray(res?.data) ? res.data : [];
      const pendingTasks = allTasks.filter(task => !task.completedDate);
      setTasks(pendingTasks);
      setFilteredTasks(pendingTasks);
    } catch (err) {
      console.error("Error fetching recurring tasks:", err);
      setError("Failed to load recurring tasks. Please try again.");
      toast.error("Failed to load recurring tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringTasks();
  }, []);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = tasks.filter(task =>
      task.taskName?.toLowerCase().includes(lowercasedSearchTerm) ||
      task.taskFrequency?.toLowerCase().includes(lowercasedSearchTerm) ||
      task.taskAssignedTo?.email?.toLowerCase().includes(lowercasedSearchTerm) ||
      task.taskDescription?.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredTasks(filtered);
  }, [searchTerm, tasks]);

  const handleComplete = async (taskId) => {
    if (!user?.email) {
      toast.error("You must be logged in to complete a task.");
      return;
    }
    try {
      // Use the correct service function for completing a recurring task
      await completeRecurringTask({ taskId, email: user.email });
      toast.success("✅ Recurring task marked as completed!");
      fetchRecurringTasks();
      getUserTasks(user.email);
      getUserProfile(user.email);
    } catch (e) {
      toast.error("❌ Could not complete task: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this recurring task?")) return;
    try {
      await deleteRecurringTask(taskId);
      toast.success("🗑️ Recurring task deleted successfully!");
      fetchRecurringTasks();
      getUserTasks(user.email);
      getUserProfile(user.email);
    } catch (e) {
      toast.error("❌ Failed to delete task: " + (e.response?.data?.message || e.message));
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const actionButtonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 15px rgba(0,0,0,0.1)" },
    tap: { scale: 0.95 }
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
    <motion.div
      className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl shadow-2xl border border-purple-200 space-y-6 mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1, when: "beforeChildren", ease: "easeOut", duration: 0.5 }}
    >
      <Toaster />

      <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-900 drop-shadow-md">
        <span className="text-purple-600">📋</span> Recurring Task List
      </h2>

      {/* Search Bar and Refresh Button */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="relative flex-grow flex items-center bg-white rounded-xl shadow-sm border border-purple-100 focus-within:border-purple-400 transition-all duration-200"
          whileHover={{ boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.3)" }}
          whileFocus={{ boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.5)", borderColor: "#3B82F6" }}
        >
          <FaSearch className="text-purple-500 ml-4 mr-2" />
          <input
            type="text"
            placeholder="Search tasks by name, frequency, description, or assignee email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mr-3 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear search"
            >
              <FaTimesCircle />
            </button>
          )}
        </motion.div>
        <motion.button
          onClick={fetchRecurringTasks}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
          whileTap={{ scale: 0.95 }}
          title="Refresh Task List"
        >
          <FaRedo />
        </motion.button>
      </div>

      {loading && (
        <p className="text-center text-purple-600 text-lg font-medium">Loading recurring tasks...</p>
      )}

      {error && (
        <p className="text-center text-red-500 text-lg font-medium">{error}</p>
      )}

      {!loading && !error && filteredTasks.length === 0 && (
        <p className="text-center text-gray-600 text-lg">
          {searchTerm ? "No tasks match your search." : "No recurring tasks found."}
        </p>
      )}

      <AnimatePresence>
        <ul className="space-y-4">
          {filteredTasks.map(task => (
            <motion.li
              key={task._id}
              className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${getPriorityBorderColor(task.taskPriority)} flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-200 hover:shadow-lg hover:border-purple-300`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex-grow">
                <p className="text-lg font-bold text-gray-900 flex items-center">
                  <FaListUl className="mr-2 text-purple-500" />
                  {task.taskName}
                </p>
                {task.taskDescription && (
                  <p className="text-sm text-gray-600 mt-1 pl-6">
                    {task.taskDescription}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <p className="flex items-center">
                    <FaClock className="mr-2 text-blue-400" />
                    <strong>Frequency:</strong> {task.taskFrequency}
                  </p>
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-green-400" />
                    <strong>Starts:</strong> {new Date(task.taskStartDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                  {task.taskEndDate && (
                    <p className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-red-400" />
                      <strong>Ends:</strong> {new Date(task.taskEndDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                  )}
                  <p className="flex items-center">
                    <FaUser className="mr-2 text-yellow-500" />
                    <strong>Assigned By:</strong> {task.taskAssignedBy?.email || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <FaUser className="mr-2 text-indigo-500" />
                    <strong>Assigned To:</strong> {task.taskAssignedTo?.email || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <FaUser className="mr-2 text-gray-500" />
                    <strong>Created By:</strong> {task.createdBy || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <FaBolt className="mr-2 text-orange-500" />
                    <strong>Create Days Ahead:</strong> {task.taskCreateDaysAhead}
                  </p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                <Link to={`/recurring/tasks/${task._id}`}>
                  <motion.button
                    className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full shadow text-sm font-medium transition-all duration-300"
                    variants={actionButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FaCommentAlt className="inline mr-1" /> Details
                  </motion.button>
                </Link>
                <motion.button
                  onClick={() => handleComplete(task._id)}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full shadow text-sm font-medium transition-all duration-300"
                  variants={actionButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaCheck className="inline mr-1" /> Complete
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(task._id)}
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow text-sm font-medium transition-all duration-300"
                  variants={actionButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaTrashAlt className="inline mr-1" /> Delete
                </motion.button>
              </div>
            </motion.li>
          ))}
        </ul>
      </AnimatePresence>
    </motion.div>
  );
};

export default RecurringTaskList;