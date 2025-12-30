import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommunityMembers } from "../../services/community";
import { motion } from "framer-motion";
import { FaUsers, FaArrowLeft, FaEnvelope, FaUserCircle } from "react-icons/fa";

const CommunityMembers = () => {
  const { communityId } = useParams();
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityMembers(communityId);
      setMembers(data);
    };
    load();
  }, [communityId]);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4 transition-colors"
        >
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          <FaUsers className="text-indigo-600" />
          Community Members
        </h1>
        
        <p className="text-gray-600 mt-2">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
      </motion.div>

      {members.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No members found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((m, index) => (
            <motion.div
              key={m._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-indigo-100 hover:border-indigo-300 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
                  <FaUserCircle className="text-white text-3xl" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {m.username}
                </h3>
                
                {m.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="text-indigo-500" />
                    <span className="truncate max-w-full">{m.email}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityMembers;
