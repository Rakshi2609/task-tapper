import React, { useEffect, useState } from "react";
import { createCommunityTask, getCommunityMembers } from "../../services/community";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaArrowLeft, FaTasks, FaUser, FaCalendarAlt, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

const CreateCommunityTask = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    taskName: "",
    taskDescription: "",
    assignedTo: "",
    assignedName: "",
    dueDate: "",
    priority: "Medium"
  });

  // ✅ LOAD COMMUNITY MEMBERS FOR DROPDOWN
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

  // ✅ HANDLE NORMAL INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ HANDLE MEMBER SELECT DROPDOWN
  const handleMemberSelect = (e) => {
    const selectedUser = members.find(
      (m) => m._id === e.target.value
    );

    if (!selectedUser) return;

    setForm({
      ...form,
      assignedTo: selectedUser.email,
      assignedName: selectedUser.username,
    });
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.taskName ||
      !form.taskDescription ||
      !form.assignedTo ||
      !form.assignedName ||
      !form.dueDate
    ) {
      return toast.error("All fields required");
    }

    try {
      await createCommunityTask(communityId, communityDeptId, {
        ...form,
        createdBy: user?.email,
      });

      toast.success("✅ Community task created!");
      navigate(`/communities/${communityId}`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create task");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-200"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-blue-600"
            title="Go Back"
          >
            <FaArrowLeft /> <span className="text-sm">Back</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
            <FaTasks className="text-blue-600" /> Create Task
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
              <FaTasks className="text-blue-500" /> Task Name
            </label>
            <input
              name="taskName"
              placeholder="Enter task name..."
              onChange={handleChange}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
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
              placeholder="Describe the task..."
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
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
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-white"
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username} ({m.email})
                </option>
              ))}
            </select>
          </motion.div>

          {/* Auto-filled fields */}
          {form.assignedTo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg border-2 border-green-200"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Email</label>
                <input
                  name="assignedTo"
                  value={form.assignedTo}
                  readOnly
                  className="w-full p-2 border border-green-300 rounded bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Name</label>
                <input
                  name="assignedName"
                  value={form.assignedName}
                  readOnly
                  className="w-full p-2 border border-green-300 rounded bg-white text-sm"
                />
              </div>
            </motion.div>
          )}

          {/* Due Date and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-green-500" /> Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                onChange={handleChange}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaExclamationCircle className="text-orange-500" /> Priority
              </label>
              <select
                name="priority"
                onChange={handleChange}
                value={form.priority}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-white"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaCheckCircle /> Create One-Time Task
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCommunityTask;
