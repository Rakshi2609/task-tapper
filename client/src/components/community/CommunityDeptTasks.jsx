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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 overflow-hidden">
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 w-full">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                  {dept?.name || "Department"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words line-clamp-2">
                  {dept?.description || "Manage department tasks"}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              <Link
                to={`/communities/${communityId}/${communityDeptId}/create-task`}
                className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-medium transition shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </Link>
              <Link
                to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
                className="flex items-center gap-1.5 sm:gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-medium transition shadow-md hover:shadow-lg"
              >
                <RotateCw className="w-4 h-4" />
                <span>Add Recurring</span>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{tasks.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">One-Time Tasks</div>
            </div>
            <div className="bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{recurringTasks.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Recurring Tasks</div>
            </div>
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100 col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{tasks.length + recurringTasks.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Total Tasks</div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">All Tasks</h2>
            <button
              onClick={() => setShowTasks(!showTasks)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition shrink-0"
            >
              {showTasks ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs sm:text-sm font-medium">{showTasks ? "Hide" : "Show"}</span>
            </button>
          </div>

          {showTasks && (
            <>
              {tasks.length === 0 && recurringTasks.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm sm:text-base">No tasks found</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Create your first task to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {/* One-Time Tasks */}
                  {tasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleOpenTask(t)}
                      className="group bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-200 hover:border-blue-400 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 cursor-pointer transition-all hover:shadow-lg min-w-0 overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition line-clamp-2 break-words min-w-0 flex-1">
                          {t.taskName}
                        </h3>
                        <span className="shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[9px] sm:text-xs font-semibold rounded whitespace-nowrap">
                          Task
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 break-words">
                        {t.taskDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 max-w-full">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-500 shrink-0" />
                          <span className="truncate">{t.assignedName || "Unassigned"}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-500" />
                          <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm">{new Date(t.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Recurring Tasks */}
                  {recurringTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleOpenTask(t)}
                      className="group bg-gradient-to-br from-white to-purple-50/30 border-2 border-purple-200 hover:border-purple-400 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 cursor-pointer transition-all hover:shadow-lg min-w-0 overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 group-hover:text-purple-600 transition line-clamp-2 break-words min-w-0 flex-1">
                          {t.taskName}
                        </h3>
                        <span className="shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-600 text-white text-[9px] sm:text-xs font-semibold rounded flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                          <RotateCw className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                          Recur
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 italic break-words">
                        {t.taskDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 max-w-full">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-500 shrink-0" />
                          <span className="truncate">{t.taskAssignedTo?.email}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-500" />
                          <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm">{new Date(t.taskStartDate).toLocaleDateString()}</span>
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
        <div className="mt-4 sm:mt-6">
          <Link
            to={`/communities/${communityId}/departments`}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-blue-600 font-medium transition text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Back to Departments</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityDeptTasks;
