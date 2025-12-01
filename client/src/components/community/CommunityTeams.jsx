import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCommunityTeams } from "../../services/community";

const CommunityTeams = () => {
  const { communityId } = useParams();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityTeams(communityId);
      setTeams(data);
    };
    load();
  }, [communityId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Teams</h1>

      <ul className="mt-4 space-y-2">
        {teams.length === 0 && <p>No teams found.</p>}
        {teams.map((t) => (
          <li key={t._id} className="p-4 bg-white rounded shadow">
            <p className="font-semibold">{t.taskName}</p>
            <p className="text-gray-600">
              Assigned to: {t.assignedName}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityTeams;
