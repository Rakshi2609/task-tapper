import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommunityDepartments, getCommunityById } from "../../services/community";
import { useAuthStore } from "../../assests/store";
import axios from "axios";
import {
  FaPlus,
  FaRedo,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const CommunityDeptTasks = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [dept, setDept] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(false);

  const API_URL = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const communityData = await getCommunityById(communityId);

        const isOwner = communityData.CreatedBy?.toString() === user?._id;
        const isMember = communityData.members?.some(
          (m) => m.toString() === user?._id
        );

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
        setLoading(false);
      }
    };

    if (user?._id) load();
  }, [communityId, communityDeptId, user, navigate]);

  const handleOpenTask = (task) => {
    task.taskAssignedBy
      ? navigate(`/recurring/tasks/${task._id}`)
      : navigate(`/tasks/${task._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 w-full max-w-7xl mx-auto min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 w-full overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 w-full">

          {/* Department Info */}
          <div className="flex flex-col gap-3 w-full min-w-0">
            <div className="flex items-start gap-2 sm:gap-3 w-full">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <FaUser className="text-base sm:text-lg" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 break-words leading-tight">
                  {dept?.name || "Department"}
                </h1>

                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed break-words">
                  {dept?.description ||
                    "Manage your department tasks, assignments, and recurring schedules from here."}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 w-full" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3 w-full">
            <Link
              to={`/communities/${communityId}/${communityDeptId}/create-task`}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition active:scale-95 shadow-sm w-full text-sm sm:text-base"
            >
              <FaPlus className="text-sm" />
              <span>Add Task</span>
            </Link>

            <Link
              to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition active:scale-95 shadow-sm w-full text-sm sm:text-base"
            >
              <FaRedo className="text-sm" />
              <span>Add Recurring</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TOGGLE */}
      <div className="mb-6 w-full px-2 sm:px-0">
        <button
          onClick={() => setShowTasks(!showTasks)}
          className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition active:scale-95 text-sm sm:text-base
            ${
              showTasks
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-900 border-2 border-gray-900"
            }`}
        >
          {showTasks ? (
            <>
              <FaEyeSlash /> Hide Tasks
            </>
          ) : (
            <>
              <FaEye /> View All Tasks
            </>
          )}
        </button>
      </div>

      {/* TASK LIST */}
      {showTasks && (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 px-2 sm:px-0 w-full">

          <div className="flex items-center gap-2 border-b pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Department Dashboard
            </h2>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-sm">
              {tasks.length + recurringTasks.length}
            </span>
          </div>

          {tasks.length === 0 && recurringTasks.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium text-sm sm:text-base px-4">
                No tasks found for this department yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 w-full">
              {/* NORMAL TASKS */}
              {tasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleOpenTask(t)}
                  className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition cursor-pointer w-full"
                >
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 break-words hover:text-blue-600">
                    {t.taskName}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 line-clamp-2 break-words">
                    {t.taskDescription}
                  </p>

                  <div className="space-y-2 pt-3 sm:pt-4 border-t border-gray-100 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                      <FaUser className="text-blue-500 shrink-0 text-xs sm:text-sm" />
                      <span className="truncate min-w-0">
                        {t.assignedName || "Unassigned"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                      <FaCalendarAlt className="text-blue-500 shrink-0 text-xs sm:text-sm" />
                      <span className="whitespace-nowrap">
                        {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* RECURRING TASKS */}
              {recurringTasks.map((t) => (
                <div
                  key={t._id}
                  onClick={() => handleOpenTask(t)}
                  className="bg-purple-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-purple-100 shadow-sm hover:shadow-xl hover:border-purple-400 transition cursor-pointer w-full"
                >
                  <div className="flex justify-between items-start mb-3 gap-2 w-full">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 break-words flex-1 min-w-0">
                      {t.taskName}
                    </h3>

                    <span className="flex items-center gap-1 bg-purple-600 text-[9px] sm:text-[10px] text-white px-1.5 sm:px-2 py-1 rounded-full font-black uppercase shrink-0">
                      <FaRedo size={7} /> Recurring
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 line-clamp-2 break-words italic">
                    {t.taskDescription}
                  </p>

                  <div className="space-y-2 pt-3 sm:pt-4 border-t border-purple-200/50 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                      <FaUser className="text-purple-600 shrink-0 text-xs sm:text-sm" />
                      <span className="truncate min-w-0">
                        {t.taskAssignedTo?.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                      <FaClock className="text-purple-600 shrink-0 text-xs sm:text-sm" />
                      <span className="whitespace-nowrap">
                        Starts:{" "}
                        {new Date(t.taskStartDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BACK LINK */}
      <div className="mt-8 sm:mt-10 px-2 sm:px-0 w-full">
        <Link
          to={`/communities/${communityId}/departments`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold transition text-sm sm:text-base"
        >
          <FaArrowLeft className="text-xs sm:text-sm" />
          <span>Back to all departments</span>
        </Link>
      </div>
    </div>
  );
};

export default CommunityDeptTasks;
