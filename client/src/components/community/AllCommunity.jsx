import React, { useState } from "react";
import { getAllCommunities } from "../../services/community";
import { Link } from "react-router-dom";

const AllCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const [visible, setVisible] = useState(false);

  const handleLoadCommunities = async () => {
    const data = await getAllCommunities();
    setCommunities(data);
    setVisible(true);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">All Communities</h2>

      <button
        onClick={handleLoadCommunities}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-6"
      >
        Load Communities
      </button>

      {visible && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((c) => (
            <div key={c._id} className="bg-white p-5 shadow rounded-lg">
              <h3 className="text-xl font-semibold">{c.name}</h3>
              <p className="text-gray-600">{c.description}</p>

              <div className="mt-3 text-sm space-y-1">
                <p>Members: {c.totalMembers}</p>
                <p>Waiting Approval: {c.waitingApproval.length}</p>
                <p>Tasks: {c.totalTasks}</p>
              </div>

              {/* 👇 ADD PEOPLE BUTTON */}
              <Link
                to={`/communities/${c._id}/add-people`}
                className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                ➕ Add People
              </Link>

              {/* 👇 ALSO VIEW MEMBERS & TEAMS */}
              <div className="flex gap-3 mt-3">
                <Link
                  to={`/communities/${c._id}/members`}
                  className="text-blue-600 hover:underline"
                >
                  View Members
                </Link>
                <Link
                  to={`/communities/${c._id}/teams`}
                  className="text-purple-600 hover:underline"
                >
                  View Teams
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllCommunity;
