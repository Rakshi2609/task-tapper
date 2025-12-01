import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCommunityMembers } from "../../services/community";

const CommunityMembers = () => {
  const { communityId } = useParams();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityMembers(communityId);
      setMembers(data);
    };
    load();
  }, [communityId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Members</h1>

      <ul className="mt-4 space-y-2">
        {members.length === 0 && <p>No members found.</p>}
        {members.map((m) => (
          <li
            key={m._id}
            className="p-3 bg-white rounded shadow"
          >
            {m.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityMembers;
