import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../../assests/store";
import axios from "axios";
import { motion } from "framer-motion";
import { FaArrowLeft, FaSitemap, FaFileAlt, FaCheckCircle } from "react-icons/fa";

const API_URL = `${import.meta.env.VITE_APP_API_URL}/api/community`;

const CreateCommunityDept = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !description) {
      return toast.error("Please fill all fields");
    }

    if (!user?._id) {
      return toast.error("User not authenticated");
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/${communityId}/dept/create`,
        {
          name,
          description,
          requesterId: user._id, // ✅ REQUIRED FOR MEMBER CHECK
        },
        { withCredentials: true }
      );

      toast.success("✅ Department created successfully!");
      navigate(`/communities/${communityId}/departments`);
    } catch (err) {
      console.error("Create Dept Error:", err);
      toast.error("❌ Failed to create department");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-4 sm:p-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-green-200"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-green-600"
            title="Go Back"
          >
            <FaArrowLeft /> <span className="text-sm">Back</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-2">
            <FaSitemap className="text-green-600" /> Create Department
          </h2>
          <div className="w-20"></div>
        </div>

        <div className="space-y-4">
          {/* Department Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaSitemap className="text-green-500" /> Department Name
            </label>
            <input
              type="text"
              placeholder="e.g., HR, Tech, Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
            />
          </motion.div>

          {/* Department Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaFileAlt className="text-emerald-500" /> Description
            </label>
            <textarea
              placeholder="Describe the department's purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none resize-none"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            }`}
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <FaCheckCircle /> Create Department
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCommunityDept;
