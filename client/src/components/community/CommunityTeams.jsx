import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommunityTeams } from "../../services/community";

const CommunityTeams = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityTeams(communityId);
      setTeams(data);
    };
    load();
  }, [communityId]);

  const handleTeamClick = (team) => {
    // ✅ Navigate to that department
    navigate(`/communities/${communityId}/departments/${team.communityDept}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Teams</h1>

      <ul className="mt-4 space-y-2">
        {teams.length === 0 && <p>No teams found.</p>}

        {teams.map((t) => (
          <li
            key={t._id}
            onClick={() => handleTeamClick(t)}
            className="p-4 bg-white rounded shadow cursor-pointer hover:bg-blue-50 transition"
          >
            <p className="font-semibold">{t.taskName}</p>
            <p className="text-gray-600">
              Assigned to: {t.assignedName}
            </p>

            {/* ✅ Optional badge */}
            {t.communityDept && (
              <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                View Department →
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityTeams;
