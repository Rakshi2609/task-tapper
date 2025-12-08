import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCommunityDepartments } from "../../services/community";

const CommunityDepartments = () => {
  const { communityId, communityDeptId } = useParams();
  const [depts, setDepts] = useState([]);
  const [dept, setDept] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityDepartments(communityId);
      setDepts(data);

      if (communityDeptId) {
        const selected = data.find((d) => d._id === communityDeptId);
        setDept(selected);
      }
    };
    load();
  }, [communityId, communityDeptId]);

  // ✅ ✅ SINGLE DEPARTMENT VIEW WITH ADD TASK BUTTON
  if (communityDeptId && dept) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Department: {dept.name}</h1>

          {/* ✅ ADD TASK BUTTON */}
          <Link
            to={`/communities/${communityId}/${communityDeptId}/create-task`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Add Task
          </Link>
        </div>

        {dept.description && (
          <p className="text-gray-600 mb-4">{dept.description}</p>
        )}

        <Link
          to={`/communities/${communityId}/departments`}
          className="text-blue-600 underline mt-4 inline-block"
        >
          ← Back to all departments
        </Link>
      </div>
    );
  }

  // ✅ ✅ ALL DEPARTMENTS LIST VIEW
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Departments</h1>

      <ul className="mt-4 space-y-2">
        {depts.length === 0 && <p>No departments found.</p>}

        {depts.map((d) => (
          <li key={d._id} className="p-4 bg-white rounded shadow">
            <p className="font-semibold">{d.name}</p>
            <p className="text-gray-600">{d.description}</p>

            <Link
              to={`/communities/${communityId}/departments/${d._id}`}
              className="text-blue-600 hover:underline"
            >
              View Department →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityDepartments;
