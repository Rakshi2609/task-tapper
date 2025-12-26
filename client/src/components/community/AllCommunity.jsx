import React, { useState, useEffect } from "react";
import { getAllCommunities } from "../../services/community";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../assests/store";

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
    <div className="min-h-screen p-4 sm:p-6 bg-gray-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Communities</h2>
        
        <Link
          to="/communities/create"
          className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center text-sm sm:text-base"
        >
          ➕ Create Community
        </Link>
      </div>

      {/* My Communities Section - Pinned */}
      {myCommunities.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            📌 My Communities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {myCommunities.map((c) => {
              const isOwner = c.CreatedBy?.toString() === user?._id;
              const isMember = c.members?.some((m) => m.toString() === user?._id);

              return (
                <div key={c._id} className="bg-white p-4 sm:p-5 shadow-lg rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold">{c.name}</h3>
                    {isOwner && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">{c.description}</p>

                  <div className="mt-3 text-sm space-y-1">
                    <p>Members: {c.totalMembers}</p>
                    {isOwner && <p>Waiting Approval: {c.waitingApproval.length}</p>}
                    <p>Tasks: {c.totalTasks}</p>
                  </div>

                  {isOwner && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Link
                        to={`/communities/${c._id}/add-people`}
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center text-sm sm:text-base"
                      >
                        ➕ Add People
                      </Link>
                      
                      {c.waitingApproval?.length > 0 && (
                        <Link
                          to={`/communities/${c._id}/pending`}
                          className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition relative text-center text-sm sm:text-base"
                        >
                          📋 Applications
                          <span className="ml-1 bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold">
                            {c.waitingApproval.length}
                          </span>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
                    <Link
                      to={`/communities/${c._id}/members`}
                      className="text-blue-600 hover:underline font-medium text-sm sm:text-base"
                    >
                      View Members
                    </Link>
                    <Link
                      to={`/communities/${c._id}/departments`}
                      className="text-purple-600 hover:underline font-medium text-sm sm:text-base"
                    >
                      View Departments
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Communities Section */}
      {otherCommunities.length > 0 && (
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">
            🌐 Discover Communities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {otherCommunities.map((c) => {
              const alreadyApplied = c.waitingApproval?.some((id) => id.toString() === user?._id);

              return (
                <div key={c._id} className="bg-white p-4 sm:p-5 shadow rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold">{c.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{c.description}</p>

                  <div className="mt-3 text-sm space-y-1">
                    <p>Members: {c.totalMembers}</p>
                    <p>Tasks: {c.totalTasks}</p>
                  </div>

                  {!alreadyApplied ? (
                    <Link
                      to={`/communities/${c._id}/apply`}
                      className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm sm:text-base w-full sm:w-auto"
                    >
                      ✅ Apply to Join
                    </Link>
                  ) : (
                    <p className="mt-3 inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm sm:text-base text-center w-full sm:w-auto">
                      ⏳ Waiting Approval
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
                    <Link
                      to={`/communities/${c._id}/members`}
                      className="text-blue-600 hover:underline text-sm sm:text-base"
                    >
                      View Members
                    </Link>
                    <Link
                      to={`/communities/${c._id}/departments`}
                      className="text-purple-600 hover:underline text-sm sm:text-base"
                    >
                      View Departments
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCommunity;
