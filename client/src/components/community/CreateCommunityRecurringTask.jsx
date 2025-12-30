import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import { createCommunityRecurringTask, getCommunityMembers } from "../../services/community";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaArrowLeft, FaRedo, FaUser, FaCalendarAlt, FaClock, FaCheckCircle } from "react-icons/fa";

const CreateCommunityRecurringTask = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    taskName: "",
    taskDescription: "",
    taskFrequency: "",
    taskCreateDaysAhead: 1,
    taskStartDate: "",
    taskEndDate: "",
    taskPriority: "Medium",
    taskAssignedBy: user?.email || "",
    taskAssignedTo: "",
    taskAssignedToName: "",
    createdBy: user?.email || "",
  });

  // Load community members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getCommunityMembers(communityId);
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members:", err);
        toast.error("Failed to load members");
      }
    };
    loadMembers();
  }, [communityId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberSelect = (e) => {
    const selectedUser = members.find((m) => m._id === e.target.value);
    if (!selectedUser) return;

    setFormData({
      ...formData,
      taskAssignedTo: selectedUser.email,
      taskAssignedToName: selectedUser.username,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.taskName ||
      !formData.taskFrequency ||
      !formData.taskStartDate ||
      !formData.taskAssignedTo
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        taskAssignedBy: user?.email || "",
        createdBy: user?.email || "",
      };

      await createCommunityRecurringTask(
        communityId,
        communityDeptId || null,
        payload
      );

      toast.success("✅ Community recurring task created!");
      navigate(`/communities/${communityId}`);

    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create community recurring task");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 p-4 sm:p-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-purple-200"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-purple-600"
            title="Go Back"
          >
            <FaArrowLeft /> <span className="text-sm">Back</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2">
            <FaRedo className="text-purple-600" /> Create Recurring Task
          </h2>
          <div className="w-20"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaRedo className="text-purple-500" /> Task Name
            </label>
            <input
              name="taskName"
              placeholder="Enter recurring task name..."
              value={formData.taskName}
              onChange={handleChange}
              className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
              required
            />
          </motion.div>

          {/* Task Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              name="taskDescription"
              placeholder="Describe the recurring task..."
              value={formData.taskDescription}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none resize-none"
            />
          </motion.div>

          {/* Member Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaUser className="text-purple-500" /> Assign To Member
            </label>
            <select
              onChange={handleMemberSelect}
              className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none bg-white"
              required
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username} ({m.email})
                </option>
              ))}
            </select>
          </motion.div>

          {/* Auto-filled field */}
          {formData.taskAssignedTo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200"
            >
              <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned To</label>
              <p className="text-sm font-medium text-purple-700">{formData.taskAssignedToName} ({formData.taskAssignedTo})</p>
            </motion.div>
          )}

          {/* Frequency and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaClock className="text-indigo-500" /> Frequency
              </label>
              <select
                name="taskFrequency"
                value={formData.taskFrequency}
                onChange={handleChange}
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none bg-white"
                required
              >
                <option value="">Select Frequency</option>
                <option value="Daily">📅 Daily</option>
                <option value="Weekly">📆 Weekly</option>
                <option value="Monthly">🗓️ Monthly</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="taskPriority"
                value={formData.taskPriority}
                onChange={handleChange}
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none bg-white"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </motion.div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-green-500" /> Start Date
              </label>
              <input
                type="date"
                name="taskStartDate"
                value={formData.taskStartDate}
                onChange={handleChange}
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-red-500" /> End Date (Optional)
              </label>
              <input
                type="date"
                name="taskEndDate"
                value={formData.taskEndDate}
                onChange={handleChange}
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
              />
            </motion.div>
          </div>

          {/* Create Days Ahead */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Create Tasks (Days Ahead)
            </label>
            <input
              type="number"
              name="taskCreateDaysAhead"
              value={formData.taskCreateDaysAhead}
              onChange={handleChange}
              min="1"
              className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Tasks will be created this many days in advance</p>
          </motion.div>

          {/* Assigned By (read-only) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Assigned By (You)
            </label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Create Recurring Task
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCommunityRecurringTask;
