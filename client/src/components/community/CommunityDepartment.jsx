import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommunityDepartments, getCommunityById } from "../../services/community";
import { useAuthStore } from "../../assests/store";

const CommunityDepartments = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [depts, setDepts] = useState([]);
  const [dept, setDept] = useState(null);
  const [community, setCommunity] = useState(null);

  // For view tasks
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all'); // all, completed, overdue, upcoming

  useEffect(() => {
    const load = async () => {
      try {
        // Get community info first to check membership
        const communityData = await getCommunityById(communityId);
        setCommunity(communityData);

        // Check if user is member or owner
        const isOwner = communityData.CreatedBy?.toString() === user?._id;
        const isMember = communityData.members?.some((m) => m.toString() === user?._id);
        
        if (!isOwner && !isMember) {
          alert("You must be a member of this community to view departments");
          navigate("/communities");
          return;
        }

        // Load departments with userId for backend verification
        const data = await getCommunityDepartments(communityId, user?._id);
        setDepts(data);

        if (communityDeptId) {
          const selected = data.find((d) => d._id === communityDeptId);
          setDept(selected);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
        if (error.response?.status === 403) {
          alert("You must be a member of this community to view departments");
          navigate("/communities");
        }
      }
    };
    if (user?._id) {
      load();
    }
  }, [communityId, communityDeptId, user, navigate]);

  // Load tasks only when "View Tasks" is clicked
  useEffect(() => {
    if (!showTasks || !communityDeptId) return;

    const loadTasks = async () => {
      const API = import.meta.env.VITE_APP_API_URL;
      const url = `${API}/api/community/${communityId}/${communityDeptId}/tasks`;
      
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

  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filtered = [...tasks];

    switch (taskFilter) {
      case 'completed':
        filtered = filtered.filter(t => t.completedDate);
        break;
      case 'overdue':
        filtered = filtered.filter(t => !t.completedDate && t.dueDate && new Date(t.dueDate) < now);
        break;
      case 'upcoming':
        filtered = filtered.filter(t => !t.completedDate && t.dueDate && new Date(t.dueDate) >= now);
        break;
      default:
        // 'all' - no filter
        break;
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // -----------------------------------------
  //         SINGLE DEPARTMENT VIEW
  // -----------------------------------------
  if (communityDeptId && dept) {
    return (
      <div className="p-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-2xl font-bold">Department: {dept.name}</h1>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {/* ADD TASK */}
            <Link
              to={`/communities/${communityId}/${communityDeptId}/create-task`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center w-full md:w-auto"
            >
              ➕ Add Task
            </Link>

            {/* ADD RECURRING */}
            <Link
              to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center w-full md:w-auto"
            >
              🔄 Add Recurring
            </Link>

            {/* VIEW TASKS */}
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition w-full md:w-auto"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h2 className="text-xl font-bold">Tasks</h2>
              
              {/* Filter Buttons */}
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition w-full md:w-auto ${
                    taskFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTaskFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg font-medium transition w-full md:w-auto ${
                    taskFilter === 'upcoming'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setTaskFilter('overdue')}
                  className={`px-4 py-2 rounded-lg font-medium transition w-full md:w-auto ${
                    taskFilter === 'overdue'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-4 py-2 rounded-lg font-medium transition w-full md:w-auto ${
                    taskFilter === 'completed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {filteredTasks.length === 0 && recurringTasks.length === 0 && (
              <p className="text-gray-600">No tasks found for the selected filter.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* NORMAL TASKS */}
              {filteredTasks.map((t) => {
                const isCompleted = !!t.completedDate;
                const isOverdue = !isCompleted && t.dueDate && new Date(t.dueDate) < new Date();
                
                return (
                  <div
                    key={t._id}
                    onClick={() => navigate(`/tasks/${t._id}`)}
                    className={`p-4 rounded shadow hover:shadow-lg cursor-pointer transition ${
                      isCompleted
                        ? 'bg-green-50 border border-green-300'
                        : isOverdue
                        ? 'bg-red-50 border border-red-300'
                        : 'bg-white'
                    }`}
                  >
                    <h3 className="font-semibold">
                      {t.taskName}
                      {isCompleted && ' ✓'}
                      {isOverdue && ' ⚠️'}
                    </h3>
                    <p className="text-sm">{t.taskDescription}</p>
                    <p className="text-sm text-gray-600">
                      Assigned: {t.assignedTo?.username || t.assignedTo?.email || t.assignedName || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                    {isCompleted && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        Completed: {new Date(t.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* RECURRING TASKS */}
              {recurringTasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigate(`/recurring/tasks/${t._id}`)}
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
