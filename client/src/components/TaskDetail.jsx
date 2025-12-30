import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../assests/store'; // Assuming useAuthStore gives current user's email/details
import { getTaskById, getTaskUpdates, createTaskUpdate, completeTask } from '../services/taskService';
import { getCommunityById, getCommunityDepartments } from '../services/community';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCommentAlt, FaPaperPlane, FaSpinner, FaTimesCircle, FaCalendarAlt, FaStar, FaClock, FaUserCircle, FaCheck, FaArrowLeft } from 'react-icons/fa';

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore(); // Get current logged-in user for 'updatedBy'
    const [task, setTask] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [communityInfo, setCommunityInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUpdateText, setNewUpdateText] = useState('');
    const [submittingUpdate, setSubmittingUpdate] = useState(false);
    const [completingTask, setCompletingTask] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [timeData, setTimeData] = useState({ startTime: '', endTime: '' });

    const fetchTaskAndUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
            const taskRes = await getTaskById(taskId);
            console.log('Task data:', taskRes.task); // Debug log
            setTask(taskRes.task);

            // Fetch community and department info if task is part of a community
            if (taskRes.task.community) {
                try {
                    const communityData = await getCommunityById(taskRes.task.community);
                    const departments = await getCommunityDepartments(taskRes.task.community, user?._id);
                    const department = departments.find(d => d._id === taskRes.task.communityDept);
                    setCommunityInfo({
                        communityName: communityData.name,
                        departmentName: department?.name || 'Unknown Department'
                    });
                } catch (err) {
                    console.error('Failed to fetch community info:', err);
                }
            }

            const updatesRes = await getTaskUpdates(taskId);
            setUpdates(updatesRes.updates);
        } catch (err) {
            console.error("Failed to fetch task details or updates:", err);
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
    }, [taskId]); // Re-fetch if taskId changes

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
                updatedBy: user.email, // Use current user's email as identifier
                updateType: 'comment', // Default type
            };
            const response = await createTaskUpdate(updateData);
            setUpdates((prev) => [...prev, response.update]); // Add new update to list
            setNewUpdateText('');
            toast.success("Comment posted successfully!");
        } catch (err) {
            console.error("Failed to post update:", err);
            toast.error("Failed to post comment: " + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingUpdate(false);
        }
    };

    const handleCompleteTask = async () => {
        if (!user?.email) {
            toast.error("You must be logged in to complete tasks.");
            return;
        }

        // Check if current user is the one assigned to the task
        if (user.email !== task.assignedTo) {
            toast.error("Only the person assigned to this task can mark it as complete.");
            return;
        }

        if (task.completedDate) {
            toast.info("This task is already completed.");
            return;
        }

        // Show time tracking modal
        setShowTimeModal(true);
    };

    const handleTimeModalSubmit = async () => {
        setCompletingTask(true);
        try {
            const today = new Date();
            const todayDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            
            let startTimeISO = null;
            let endTimeISO = null;
            
            // Combine today's date with the time inputs
            if (timeData.startTime) {
                startTimeISO = new Date(`${todayDateStr}T${timeData.startTime}`).toISOString();
            }
            if (timeData.endTime) {
                endTimeISO = new Date(`${todayDateStr}T${timeData.endTime}`).toISOString();
            }
            
            const payload = { 
                taskId: taskId, 
                email: user.email,
                startTime: startTimeISO,
                endTime: endTimeISO
            };
            
            await completeTask(payload);
            toast.success("Task marked as completed!");
            // Refresh task data
            await fetchTaskAndUpdates();
            
            // Reset modal state
            setShowTimeModal(false);
            setTimeData({ startTime: '', endTime: '' });
        } catch (err) {
            console.error("Failed to complete task:", err);
            toast.error("Failed to complete task: " + (err.response?.data?.message || err.message));
        } finally {
            setCompletingTask(false);
        }
    };

    const handleTimeModalCancel = () => {
        setShowTimeModal(false);
        setTimeData({ startTime: '', endTime: '' });
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-3 lg:p-4">
            <motion.div
                className="max-w-2xl mx-auto mt-2 p-4 sm:p-6 bg-white rounded-3xl shadow-2xl border border-blue-200 relative overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-blue-600"
                        title="Go Back"
                    >
                        <FaArrowLeft /> <span className="text-sm">Back</span>
                    </button>
                    <motion.h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 drop-shadow-md">
                        Task Details
                    </motion.h2>
                    <div className="w-20"></div>
                </div>

                {/* Task Details Card */}
                <motion.div
                    className={`bg-white border-l-4 ${getPriorityBorderColor(task.priority)} p-4 rounded-lg shadow-lg mb-6 transition-all duration-300`}
                    variants={cardVariants}
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{task.taskName}</h3>
                    <p className="text-sm text-gray-700 mb-3">{task.taskDescription}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                        {communityInfo && (
                            <>
                                <p className="flex items-center gap-2">Community: <span className="font-medium text-blue-700">{communityInfo.communityName}</span></p>
                                <p className="flex items-center gap-2">Department: <span className="font-medium text-purple-700">{communityInfo.departmentName}</span></p>
                            </>
                        )}
                        <p className="flex items-center gap-2">from: <span className="font-medium text-blue-700">{task.assignedName}</span></p>
                        {/* <p className="flex items-center gap-2">Created By: <span className="font-medium text-blue-700">{task.createdByName || task.createdBy}</span></p> */}
                        <p className="flex items-center gap-2">Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
                        <p className="flex items-center gap-2">Priority: <span className={`font-semibold ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{task.priority}</span></p>
                        <p className="flex items-center gap-2">Frequency: {task.taskFrequency}</p>
                        {task.completedDate && (
                            <p className="flex items-center gap-2">Completed On: {new Date(task.completedDate).toLocaleDateString()}</p>
                        )}
                        {task.startTime && (
                            <div className="col-span-2 mt-1">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-200 shadow-sm">
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Started</span>
                                        <p className="text-xs font-bold text-blue-900">{new Date(task.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {task.endTime && (
                            <div className="col-span-2 mt-1">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg border border-purple-200 shadow-sm">
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold text-purple-800 uppercase tracking-wide">Completed</span>
                                        <p className="text-xs font-bold text-purple-900">{new Date(task.endTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Mark as Complete Button */}
                {!task.completedDate && (
                    <motion.div variants={cardVariants} className="mb-6">
                        {user?.email === task.assignedTo ? (
                            <button
                                onClick={handleCompleteTask}
                                disabled={completingTask}
                                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                                    completingTask
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                                }`}
                            >
                                {completingTask ? 'Completing...' : 'Mark as Complete'}
                            </button>
                        ) : (
                            <div className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-gray-600 bg-gray-200 border-2 border-gray-300 flex items-center justify-center gap-2">
                                Only {task.assignedName} can complete this task
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Updates/Comments Section */}
                <motion.div variants={cardVariants}>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        Task Updates
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg shadow-inner max-h-60 overflow-y-auto custom-scrollbar mb-4">
                        <AnimatePresence>
                            {updates.length === 0 ? (
                                <motion.p
                                    key="no-updates"
                                    className="text-gray-600 text-xs italic text-center py-3"
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
                                        className="mb-3 p-2 border-b border-gray-200 last:border-b-0"
                                        variants={updateItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden" // Ensure exit animation
                                    >
                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                            <span className="font-medium text-blue-700">{update.updatedByName || update.updatedBy}</span>
                                            <span className="text-xs">{new Date(update.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-800">{update.updateText}</p>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Add New Update Form */}
                <motion.form onSubmit={handlePostUpdate} className="space-y-3" variants={cardVariants}>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        Add New Comment
                    </h3>
                    <textarea
                        className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                        rows="3"
                        placeholder="Type your comment or update here..."
                        value={newUpdateText}
                        onChange={(e) => setNewUpdateText(e.target.value)}
                        required
                        disabled={submittingUpdate}
                    ></textarea>
                    <motion.button
                        type="submit"
                        disabled={submittingUpdate}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-bold text-sm shadow-md transition-all duration-300
                            ${submittingUpdate
                                ? 'bg-blue-400 text-gray-200 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                            }`}
                        whileHover={submittingUpdate ? {} : { scale: 1.02 }}
                        whileTap={submittingUpdate ? {} : { scale: 0.98 }}
                    >
                        {submittingUpdate ? 'Posting...' : 'Post Comment'}
                    </motion.button>
                </motion.form>
            </motion.div>

            {/* Time Tracking Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4"
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Track Your Time</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Record what time you started and finished this task today.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                            <p className="text-xs text-blue-800 flex items-center gap-2">
                                <span className="font-semibold">Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Start Time (Optional)
                                </label>
                                <input
                                    type="time"
                                    value={timeData.startTime}
                                    onChange={(e) => setTimeData({ ...timeData, startTime: e.target.value })}
                                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    End Time (Optional)
                                </label>
                                <input
                                    type="time"
                                    value={timeData.endTime}
                                    onChange={(e) => setTimeData({ ...timeData, endTime: e.target.value })}
                                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If you don't provide an end time, it will be set to now.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleTimeModalCancel}
                                disabled={completingTask}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTimeModalSubmit}
                                disabled={completingTask}
                                className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {completingTask ? 'Completing...' : 'Complete Task'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};


export default TaskDetail;
