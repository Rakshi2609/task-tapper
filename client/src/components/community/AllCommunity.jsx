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
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Communities</h2>
        
        <Link
          to="/communities/create"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          ➕ Create Community
        </Link>
      </div>

      {/* My Communities Section - Pinned */}
      {myCommunities.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            📌 My Communities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCommunities.map((c) => {
              const isOwner = c.CreatedBy?.toString() === user?._id;
              const isMember = c.members?.some((m) => m.toString() === user?._id);

              return (
                <div key={c._id} className="bg-white p-5 shadow-lg rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{c.name}</h3>
                    {isOwner && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{c.description}</p>

                  <div className="mt-3 text-sm space-y-1">
                    <p>Members: {c.totalMembers}</p>
                    {isOwner && <p>Waiting Approval: {c.waitingApproval.length}</p>}
                    <p>Tasks: {c.totalTasks}</p>
                  </div>

                  {isOwner && (
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/communities/${c._id}/add-people`}
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        ➕ Add People
                      </Link>
                      
                      {c.waitingApproval?.length > 0 && (
                        <Link
                          to={`/communities/${c._id}/pending`}
                          className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition relative"
                        >
                          📋 Applications
                          <span className="ml-1 bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold">
                            {c.waitingApproval.length}
                          </span>
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-3">
                    <Link
                      to={`/communities/${c._id}/members`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Members
                    </Link>
                    <Link
                      to={`/communities/${c._id}/departments`}
                      className="text-purple-600 hover:underline font-medium"
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
          <h3 className="text-2xl font-bold text-gray-700 mb-4">
            🌐 Discover Communities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherCommunities.map((c) => {
              const alreadyApplied = c.waitingApproval?.some((id) => id.toString() === user?._id);

              return (
                <div key={c._id} className="bg-white p-5 shadow rounded-lg">
                  <h3 className="text-xl font-semibold">{c.name}</h3>
                  <p className="text-gray-600">{c.description}</p>

                  <div className="mt-3 text-sm space-y-1">
                    <p>Members: {c.totalMembers}</p>
                    <p>Tasks: {c.totalTasks}</p>
                  </div>

                  {!alreadyApplied ? (
                    <Link
                      to={`/communities/${c._id}/apply`}
                      className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      ✅ Apply to Join
                    </Link>
                  ) : (
                    <p className="mt-3 inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                      ⏳ Waiting Approval
                    </p>
                  )}

                  <div className="flex gap-3 mt-3">
                    <Link
                      to={`/communities/${c._id}/members`}
                      className="text-blue-600 hover:underline"
                    >
                      View Members
                    </Link>
                    <Link
                      to={`/communities/${c._id}/departments`}
                      className="text-purple-600 hover:underline"
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
