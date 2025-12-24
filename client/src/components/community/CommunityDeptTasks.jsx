import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommunityDepartments, getCommunityById } from "../../services/community";
import { useAuthStore } from "../../assests/store";
import axios from "axios";

const CommunityDeptTasks = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [dept, setDept] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(false); // 👈 ADDED

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        // Check membership first
        const communityData = await getCommunityById(communityId);
        const isOwner = communityData.CreatedBy?.toString() === user?._id;
        const isMember = communityData.members?.some((m) => m.toString() === user?._id);
        
        if (!isOwner && !isMember) {
          alert("You must be a member of this community to view departments");
          navigate("/communities");
          return;
        }

        const allDepts = await getCommunityDepartments(communityId, user?._id);
        const selected = allDepts.find((d) => d._id === communityDeptId);
        setDept(selected);

        const t = await axios.get(
          `${API_URL}/team/community/${communityId}/${communityDeptId}`
        );
        setTasks(t.data || []);

        const rt = await axios.get(
          `${API_URL}/recurring/community/${communityId}/${communityDeptId}`
        );
        setRecurringTasks(rt.data?.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error loading tasks:", error);
        if (error.response?.status === 403) {
          alert("You must be a member of this community to view departments");
          navigate("/communities");
        }
        setLoading(false);
      }
    };

    if (user?._id) {
      load();
    }
  }, [communityId, communityDeptId, user, navigate]);

  const handleOpenTask = (task) => {
    if (task.taskAssignedBy) {
      navigate(`/recurring/tasks/${task._id}`);
    } else {
      navigate(`/tasks/${task._id}`);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{dept?.name}</h1>
          <p className="text-gray-600">{dept?.description}</p>
        </div>

        <div className="space-x-2">
          <Link
            to={`/communities/${communityId}/${communityDeptId}/create-task`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Add Task
          </Link>

          <Link
            to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            🔄 Add Recurring
          </Link>
        </div>
      </div>

      {/* ⭐⭐ VIEW TASKS BUTTON ⭐⭐ */}
      <button
        onClick={() => setShowTasks(!showTasks)}
        className="bg-black text-white px-5 py-3 rounded-lg mt-4 hover:bg-gray-800"
      >
        {showTasks ? "Hide Tasks" : "View Tasks"}
      </button>

      {/* ONLY SHOW TASKS WHEN BUTTON IS CLICKED */}
      {showTasks && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">Tasks</h2>

          {tasks.length === 0 && recurringTasks.length === 0 && (
            <p>No tasks found for this department.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* NORMAL TASKS */}
            {tasks.map((t) => (
              <div
                key={t._id}
                className="bg-white p-4 rounded shadow cursor-pointer hover:bg-blue-50"
                onClick={() => handleOpenTask(t)}
              >
                <h3 className="font-semibold">{t.taskName}</h3>
                <p className="text-sm text-gray-600">{t.taskDescription}</p>
                <p className="text-sm">
                  <strong>Assigned:</strong> {t.assignedName}
                </p>
                <p className="text-sm">
                  <strong>Due:</strong>{" "}
                  {new Date(t.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}

            {/* RECURRING TASKS */}
            {recurringTasks.map((t) => (
              <div
                key={t._id}
                className="bg-purple-50 border border-purple-300 p-4 rounded shadow cursor-pointer hover:bg-purple-100"
                onClick={() => handleOpenTask(t)}
              >
                <h3 className="font-semibold">
                  {t.taskName}{" "}
                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                    Recurring
                  </span>
                </h3>
                <p className="text-sm text-gray-600">{t.taskDescription}</p>
                <p className="text-sm">
                  <strong>Assigned:</strong> {t.taskAssignedTo?.email}
                </p>
                <p className="text-sm">
                  <strong>Start:</strong>{" "}
                  {new Date(t.taskStartDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <Link
        to={`/communities/${communityId}/departments`}
        className="text-blue-600 underline inline-block mt-6"
      >
        ← Back to Departments
      </Link>
    </div>
  );
};

export default CommunityDeptTasks;
