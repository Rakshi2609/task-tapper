import React, { useState, useEffect } from "react";
import { getAllCommunities } from "../../services/community";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import { motion } from "framer-motion";
import { FaUsers, FaTasks, FaCrown, FaClock, FaUserPlus, FaClipboardList, FaGlobe, FaStar } from "react-icons/fa";

const AllCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [otherCommunities, setOtherCommunities] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadCommunities = async () => {
      const data = await getAllCommunities();
      setCommunities(data);

      // Separate communities into "My Communities" and "Other Communities"
      const my = data.filter(c => {
        const isOwner = c.CreatedBy?.toString() === user?._id;
        const isMember = c.members?.some((m) => m.toString() === user?._id);
        return isOwner || isMember;
      });

      const others = data.filter(c => {
        const isOwner = c.CreatedBy?.toString() === user?._id;
        const isMember = c.members?.some((m) => m.toString() === user?._id);
        return !isOwner && !isMember;
      });

      setMyCommunities(my);
      setOtherCommunities(others);
    };

    loadCommunities();
  }, [user]);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
          <FaUsers className="text-indigo-600" />
          Communities
        </h2>
        
        <Link
          to="/communities/create"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-center flex items-center gap-2 justify-center"
        >
          <FaUserPlus />
          Create Community
        </Link>
      </motion.div>

      {/* My Communities Section - Pinned */}
      {myCommunities.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
            <FaStar className="text-yellow-500" />
            My Communities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCommunities.map((c, index) => {
              const isOwner = c.CreatedBy?.toString() === user?._id;
              const isMember = c.members?.some((m) => m.toString() === user?._id);

              return (
                <motion.div 
                  key={c._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 30px rgba(0,0,0,0.15)" }}
                  className="bg-white/80 backdrop-blur-sm p-6 shadow-xl rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaUsers className="text-indigo-500 text-lg" />
                      {c.name}
                    </h3>
                    {isOwner && (
                      <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-bold flex items-center gap-1 shadow-md">
                        <FaCrown />
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaUsers className="text-blue-500" />
                      <span className="font-medium">{c.totalMembers} Members</span>
                    </div>
                    {isOwner && c.waitingApproval?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <FaClock className="text-orange-500" />
                        <span className="font-medium">{c.waitingApproval.length} Waiting Approval</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaTasks className="text-purple-500" />
                      <span className="font-medium">{c.totalTasks} Tasks</span>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <Link
                        to={`/communities/${c._id}/add-people`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg text-center text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <FaUserPlus />
                        Add People
                      </Link>
                      
                      {c.waitingApproval?.length > 0 && (
                        <Link
                          to={`/communities/${c._id}/pending`}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg text-center text-sm font-semibold flex items-center justify-center gap-2 relative"
                        >
                          <FaClipboardList />
                          Applications
                          <span className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold shadow-md">
                            {c.waitingApproval.length}
                          </span>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <Link
                      to={`/communities/${c._id}/members`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline flex items-center gap-1"
                    >
                      <FaUsers />
                      Members
                    </Link>
                    <Link
                      to={`/communities/${c._id}/departments`}
                      className="text-purple-600 hover:text-purple-800 font-semibold text-sm hover:underline flex items-center gap-1"
                    >
                      <FaTasks />
                      Departments
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Other Communities Section */}
      {otherCommunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6 flex items-center gap-3">
            <FaGlobe className="text-blue-500" />
            Discover Communities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCommunities.map((c, index) => {
              const alreadyApplied = c.waitingApproval?.some((id) => id.toString() === user?._id);

              return (
                <motion.div 
                  key={c._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 30px rgba(0,0,0,0.1)" }}
                  className="bg-white/70 backdrop-blur-sm p-6 shadow-lg rounded-2xl border border-gray-200 hover:border-blue-300 transition-all"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaUsers className="text-blue-500" />
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaUsers className="text-blue-500" />
                      <span className="font-medium">{c.totalMembers} Members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaTasks className="text-purple-500" />
                      <span className="font-medium">{c.totalTasks} Tasks</span>
                    </div>
                  </div>

                  {!alreadyApplied ? (
                    <Link
                      to={`/communities/${c._id}/apply`}
                      className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-center font-semibold mb-3"
                    >
                      Apply to Join
                    </Link>
                  ) : (
                    <div className="px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-lg text-center font-semibold mb-3 flex items-center justify-center gap-2">
                      <FaClock />
                      Waiting Approval
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
                    <Link
                      to={`/communities/${c._id}/members`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline flex items-center gap-1"
                    >
                      <FaUsers />
                      Members
                    </Link>
                    <Link
                      to={`/communities/${c._id}/departments`}
                      className="text-purple-600 hover:text-purple-800 font-semibold text-sm hover:underline flex items-center gap-1"
                    >
                      <FaTasks />
                      Departments
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {myCommunities.length === 0 && otherCommunities.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 mb-6">No communities found</p>
          <Link
            to="/communities/create"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            Create Your First Community
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default AllCommunity;
