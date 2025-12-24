import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCommunityDepartments, getCommunityById } from "../../services/community";
import { useAuthStore } from "../../assests/store";

const CommunityDepartments = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();

  const [depts, setDepts] = useState([]);
  const [dept, setDept] = useState(null);
  const [community, setCommunity] = useState(null);

  // For view tasks
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [recurringTasks, setRecurringTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getCommunityDepartments(communityId);
      setDepts(data);

      // Get community info
      const communityData = await getCommunityById(communityId);
      setCommunity(communityData);

      if (communityDeptId) {
        const selected = data.find((d) => d._id === communityDeptId);
        setDept(selected);
      }
    };
    load();
  }, [communityId, communityDeptId]);

  // Load tasks only when "View Tasks" is clicked
  useEffect(() => {
    if (!showTasks || !communityDeptId) return;

    const loadTasks = async () => {
      const API = import.meta.env.VITE_API_URL;
      const url = `${API}/community/${communityId}/${communityDeptId}/tasks`;
      
      console.log("🔍 Fetching tasks from:", url);

      try {
        const response = await fetch(url);
        console.log("📡 Response status:", response.status);
        
        const data = await response.json();
        console.log("📦 Response data:", data);

        setTasks(data.tasks || []);
        setRecurringTasks(data.recurringTasks || []);
        
        console.log("✅ Tasks set:", data.tasks?.length || 0);
        console.log("✅ Recurring tasks set:", data.recurringTasks?.length || 0);
      } catch (err) {
        console.error("❌ Task load error:", err);
      }
    };

    loadTasks();
  }, [showTasks, communityId, communityDeptId]);

  // -----------------------------------------
  //         SINGLE DEPARTMENT VIEW
  // -----------------------------------------
  if (communityDeptId && dept) {
    return (
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Department: {dept.name}</h1>

          <div className="flex space-x-2">
            {/* ADD TASK */}
            <Link
              to={`/communities/${communityId}/${communityDeptId}/create-task`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              ➕ Add Task
            </Link>

            {/* ADD RECURRING */}
            <Link
              to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              🔄 Add Recurring
            </Link>

            {/* VIEW TASKS */}
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
            >
              {showTasks ? "Hide Tasks" : "View Tasks"}
            </button>
          </div>
        </div>

        {/* DESCRIPTION */}
        {dept.description && (
          <p className="text-gray-600 mb-4">{dept.description}</p>
        )}

        {/* -----------------------------------------
                TASKS LIST (ONLY WHEN CLICKED)
        ------------------------------------------ */}
        {showTasks && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Tasks</h2>

            {tasks.length === 0 && recurringTasks.length === 0 && (
              <p className="text-gray-600">No tasks yet.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* NORMAL TASKS */}
              {tasks.map((t) => (
                <div
                  key={t._id}
                  className="p-4 bg-white rounded shadow hover:bg-blue-50 cursor-pointer transition"
                >
                  <h3 className="font-semibold">{t.taskName}</h3>
                  <p className="text-sm">{t.taskDescription}</p>
                  <p className="text-sm text-gray-600">
                    Assigned: {t.assignedTo?.username || t.assignedTo?.email || t.assignedName || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
              ))}

              {/* RECURRING TASKS */}
              {recurringTasks.map((t) => (
                <div
                  key={t._id}
                  className="p-4 bg-purple-50 border border-purple-300 rounded shadow cursor-pointer hover:bg-purple-100 transition"
                >
                  <h3 className="font-semibold">{t.taskName} 🔁</h3>
                  <p className="text-sm">{t.taskDescription}</p>
                  <p className="text-sm text-gray-600">
                    Assigned: {t.taskAssignedTo?.username || t.taskAssignedTo?.email || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Frequency: {t.taskFrequency}
                  </p>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* BACK */}
        <Link
          to={`/communities/${communityId}/departments`}
          className="text-blue-600 underline mt-4 inline-block"
        >
          ← Back to all departments
        </Link>
      </div>
    );
  }

  // -----------------------------------------
  //            ALL DEPARTMENTS VIEW
  // -----------------------------------------
  const isOwner = community?.CreatedBy?.toString() === user?._id;
  const pendingCount = community?.waitingApproval?.length || 0;

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{community?.name} - Departments</h1>
        
        <div className="flex gap-2">
          {isOwner && pendingCount > 0 && (
            <Link
              to={`/communities/${communityId}/pending`}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
            >
              📋 Applications ({pendingCount})
            </Link>
          )}
          
          <Link
            to={`/communities/${communityId}/departments/create`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            ➕ Create Department
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">All Departments</h2>

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
