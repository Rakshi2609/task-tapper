import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../assests/store';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCommentAlt, 
  FaPaperPlane, 
  FaSpinner, 
  FaTimesCircle, 
  FaCalendarAlt, 
  FaStar, 
  FaClock, 
  FaUserCircle, 
  FaCheck, // Added check icon for completed status
  FaUser, // Used for Assigned To/By
} from 'react-icons/fa';

// Import recurring task-specific services
import { 
  getRecurringTaskById, 
  getRecurringTaskUpdates, 
  createRecurringTaskUpdate,
  deleteRecurringTaskUpdate, // Added for deleting a comment/update
} from '../services/rexurring'; // Using your specified file path

const RecurringTaskDetail = () => {
  const { taskId } = useParams();
  const { user } = useAuthStore();
  const [task, setTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUpdateText, setNewUpdateText] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchTaskAndUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use recurring task services
      const taskRes = await getRecurringTaskById(taskId);
      setTask(taskRes.data);

      const updatesRes = await getRecurringTaskUpdates(taskId);
      setUpdates(updatesRes.updates);
    } catch (err) {
      console.error("Failed to fetch recurring task details or updates:", err);
      setError(err.response?.data?.message || "Failed to load task details.");
      toast.error("Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskAndUpdates();
    }
  }, [taskId]);

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateText.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!user?.email) {
      toast.error("You must be logged in to post comments.");
      return;
    }

    setSubmittingUpdate(true);
    try {
      const updateData = {
        taskId: taskId,
        updateText: newUpdateText,
        updatedBy: user.email,
        updateType: 'comment',
      };
      const response = await createRecurringTaskUpdate(updateData);
      setUpdates((prev) => [...prev, response.update]);
      setNewUpdateText('');
      toast.success("Comment posted successfully!");
    } catch (err) {
      console.error("Failed to post update:", err);
      toast.error("Failed to post comment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingUpdate(false);
    }
  };
  
  const handleDeleteUpdate = async (updateId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteRecurringTaskUpdate(updateId);
      setUpdates(prev => prev.filter(update => update._id !== updateId));
      toast.success("Comment deleted successfully!");
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment: " + (err.response?.data?.message || err.message));
    }
  };


  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case "High": return "border-red-500";
      case "Medium": return "border-orange-500";
      case "Low": return "border-cyan-500";
      default: return "border-gray-300";
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const updateItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <FaSpinner className="animate-spin text-5xl text-blue-600" />
        <p className="ml-4 text-xl text-blue-700">Loading task details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-red-600 text-xl font-medium">Error: {error}</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-600 text-xl font-medium">Task not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-3xl mx-auto mt-8 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-4">
          <FaCommentAlt className="text-blue-600 text-4xl sm:text-5xl" /> Recurring Task Details
        </motion.h2>

        {/* Task Details Card */}
        <motion.div
          className={`bg-white border-l-4 ${getPriorityBorderColor(task.taskPriority)} p-6 rounded-lg shadow-lg mb-8 transition-all duration-300`}
          variants={cardVariants}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{task.taskName}</h3>
          <p className="text-md text-gray-700 mb-4">{task.taskDescription}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <p className="flex items-center gap-2"><FaUser className="text-indigo-400" /> Assigned To: <span className="font-medium text-blue-700">{task.taskAssignedTo?.email || 'N/A'}</span></p>
            <p className="flex items-center gap-2"><FaUser className="text-indigo-400" /> Assigned By: <span className="font-medium text-blue-700">{task.taskAssignedBy?.email || 'N/A'}</span></p>
            <p className="flex items-center gap-2"><FaCalendarAlt className="text-blue-400" /> Start Date: {new Date(task.taskStartDate).toLocaleDateString()}</p>
            {task.taskEndDate && (
              <p className="flex items-center gap-2"><FaCalendarAlt className="text-red-400" /> End Date: {new Date(task.taskEndDate).toLocaleDateString()}</p>
            )}
            <p className="flex items-center gap-2"><FaStar className="text-yellow-500" /> Priority: <span className={`font-semibold ${task.taskPriority === 'High' ? 'text-red-500' : task.taskPriority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{task.taskPriority}</span></p>
            <p className="flex items-center gap-2"><FaClock className="text-purple-500" /> Frequency: {task.taskFrequency}</p>
            {task.completedDate && (
              <p className="flex items-center gap-2"><FaCheck className="text-green-500" /> Completed On: {new Date(task.completedDate).toLocaleDateString()}</p>
            )}
          </div>
        </motion.div>

        {/* Updates/Comments Section */}
        <motion.div variants={cardVariants}>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCommentAlt className="text-green-600" /> Task Updates
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner max-h-80 overflow-y-auto custom-scrollbar mb-6">
            <AnimatePresence>
              {updates.length === 0 ? (
                <motion.p
                  key="no-updates"
                  className="text-gray-600 italic text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No updates or comments yet. Be the first to add one!
                </motion.p>
              ) : (
                updates.map((update) => (
                  <motion.div
                    key={update._id}
                    className="mb-4 p-3 border-b border-gray-200 last:border-b-0"
                    variants={updateItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                      <span className="font-medium text-blue-700">{update.updatedBy}</span>
                      <div className='flex items-center gap-2'>
                        <span className="text-xs">{new Date(update.createdAt).toLocaleString()}</span>
                        {user?.email === update.updatedBy && (
                            <FaTimesCircle 
                                className="text-red-400 hover:text-red-600 cursor-pointer transition-colors" 
                                onClick={() => handleDeleteUpdate(update._id)}
                            />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800">{update.updateText}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Add New Update Form */}
        <motion.form onSubmit={handlePostUpdate} className="space-y-4" variants={cardVariants}>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaPaperPlane className="text-purple-600" /> Add New Comment
          </h3>
          <textarea
            className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
            rows="4"
            placeholder="Type your comment or update here..."
            value={newUpdateText}
            onChange={(e) => setNewUpdateText(e.target.value)}
            required
            disabled={submittingUpdate}
          ></textarea>
          <motion.button
            type="submit"
            disabled={submittingUpdate}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-lg shadow-md transition-all duration-300
                            ${submittingUpdate
                                ? 'bg-blue-400 text-gray-200 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                            }`}
            whileHover={submittingUpdate ? {} : { scale: 1.02 }}
            whileTap={submittingUpdate ? {} : { scale: 0.98 }}
          >
            {submittingUpdate ? (
              <>
                <FaSpinner className="animate-spin" /> Posting...
              </>
            ) : (
              <>
                <FaPaperPlane /> Post Comment
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default RecurringTaskDetail;