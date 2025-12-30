import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommunityDepartments, getCommunityById } from "../../services/community";
import { useAuthStore } from "../../assests/store";
import axios from "axios";
import {
  Plus,
  RotateCw,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Calendar,
  Clock,
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 mb-3 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {dept?.name || "Department"}
              </h1>
              {dept?.description && (
                <p className="text-xs text-gray-500 truncate">
                  {dept.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <Link
              to={`/communities/${communityId}/${communityDeptId}/create-task`}
              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Task</span>
            </Link>
            <Link
              to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
              className="flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Recurring</span>
              <span className="sm:hidden">Recurring</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
              <div className="text-lg font-bold text-blue-600">{tasks.length}</div>
              <div className="text-[9px] text-gray-600">One-Time</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
              <div className="text-lg font-bold text-purple-600">{recurringTasks.length}</div>
              <div className="text-[9px] text-gray-600">Recurring</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 border border-green-100">
              <div className="text-lg font-bold text-green-600">{tasks.length + recurringTasks.length}</div>
              <div className="text-[9px] text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">All Tasks</h2>
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              {showTasks ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="text-xs font-medium">{showTasks ? "Hide" : "Show"}</span>
            </button>
          </div>

          {showTasks && (
            <>
              {tasks.length === 0 && recurringTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No tasks found</p>
                  <p className="text-xs text-gray-400 mt-0.5">Create your first task</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                  {/* One-Time Tasks */}
                  {tasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleOpenTask(t)}
                      className="group bg-gradient-to-br from-white to-blue-50/30 border border-gray-200 hover:border-blue-400 rounded-lg p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md min-w-0"
                    >
                      <div className="flex items-start justify-between mb-1.5 gap-2 min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2 break-words min-w-0 flex-1">
                          {t.taskName}
                        </h3>
                        <span className="shrink-0 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-semibold rounded whitespace-nowrap">
                          Task
                        </span>
                      </div>
                      
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-1 break-words">
                        {t.taskDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1 min-w-0 max-w-full">
                          <User className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{t.assignedName || "Unassigned"}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          <span className="whitespace-nowrap">{new Date(t.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Recurring Tasks */}
                  {recurringTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleOpenTask(t)}
                      className="group bg-gradient-to-br from-white to-purple-50/30 border border-purple-200 hover:border-purple-400 rounded-lg p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md min-w-0"
                    >
                      <div className="flex items-start justify-between mb-1.5 gap-2 min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-purple-600 transition line-clamp-2 break-words min-w-0 flex-1">
                          {t.taskName}
                        </h3>
                        <span className="shrink-0 px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-semibold rounded flex items-center gap-0.5 whitespace-nowrap">
                          <RotateCw className="w-2 h-2" />
                          Recur
                        </span>
                      </div>
                      
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-2 line-clamp-1 italic break-words">
                        {t.taskDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1 min-w-0 max-w-full">
                          <User className="w-3 h-3 text-purple-500 shrink-0" />
                          <span className="truncate">{t.taskAssignedTo?.email}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-purple-500" />
                          <span className="whitespace-nowrap">{new Date(t.taskStartDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-3">
          <Link
            to={`/communities/${communityId}/departments`}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium transition text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityDeptTasks;
