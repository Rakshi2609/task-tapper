import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCommunityDepartments } from "../../services/community";

const CommunityDepartments = () => {
  const { communityId } = useParams();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityDepartments(communityId);
      setDepartments(data);
    };
    load();
  }, [communityId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Departments</h1>

      <ul className="mt-4 space-y-2">
        {departments.length === 0 && <p>No departments found.</p>}
        {departments.map((d) => (
          <li key={d._id} className="p-4 bg-white rounded shadow">
            <p className="font-semibold">{d.name}</p>
            <p className="text-gray-600">{d.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityDepartments;
