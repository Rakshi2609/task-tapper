import React, { useState } from "react";
import { createCommunity } from "../../services/community";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import { motion } from "framer-motion";
import { FaArrowLeft, FaUsers, FaFileAlt, FaCheckCircle } from "react-icons/fa";

const CreateCommunity = () => {
  const { user } = useAuthStore();     // 👈 Logged-in user from auth store
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      setError("All fields are required");
      return;
    }

    if (!user?._id) {
      setError("You must be logged in to create a community.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const newCommunity = await createCommunity({
        name,
        description,
        CreatedBy: user._id,      // 👈 EXACTLY what backend expects
      });

      setSuccess("Community created successfully!");

      setTimeout(() => {
        navigate("/communities");
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Failed to create community");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-cyan-200"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-cyan-100 hover:bg-cyan-200 rounded-lg transition-colors duration-200 flex items-center gap-2 text-cyan-600"
            title="Go Back"
          >
            <FaArrowLeft /> <span className="text-sm">Back</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center gap-2">
            <FaUsers className="text-cyan-600" /> Create Community
          </h2>
          <div className="w-20"></div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border-2 border-red-200 text-red-700 p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-50 border-2 border-green-200 text-green-700 p-3 rounded-lg"
            >
              {success}
            </motion.div>
          )}

          {/* Community Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaUsers className="text-cyan-500" /> Community Name
            </label>
            <input
              type="text"
              className="w-full p-3 border-2 border-cyan-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter community name..."
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaFileAlt className="text-blue-500" /> Description
            </label>
            <textarea
              className="w-full p-3 border-2 border-cyan-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 outline-none resize-none"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your community..."
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            }`}
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <FaCheckCircle /> Create Community
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCommunity;
