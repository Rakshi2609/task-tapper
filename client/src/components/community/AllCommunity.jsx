import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCommunities } from "../../services/community";

const AllCommunity = () => {
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const handleLoad = async () => {
    const data = await getAllCommunities();
    setCommunities(data);
    setVisible(true);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">All Communities</h2>

      <button
        onClick={handleLoad}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        Load Communities
      </button>

      {visible && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {communities.map((community) => (
            <div
              key={community._id}
              className="bg-white p-5 rounded-xl shadow"
            >
              <h3 className="text-xl font-semibold">{community.name}</h3>
              <p className="text-gray-600">{community.description}</p>

              <p className="mt-2 text-sm">
                Members: {community.totalMembers}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    navigate(`/communities/${community._id}/members`)
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Members
                </button>

                <button
                  onClick={() =>
                    navigate(`/communities/${community._id}/teams`)
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Teams
                </button>

                <button
                  onClick={() =>
                    navigate(`/communities/${community._id}/departments`)
                  }
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
                >
                  Departments
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllCommunity;
