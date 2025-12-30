import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCommunityDepartments, getCommunityById } from "../../services/community";
import { useAuthStore } from "../../assests/store";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaSitemap, FaPlus, FaBell, FaChevronRight, FaFilter, FaSearch, FaChevronLeft } from "react-icons/fa";

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
  const [taskTypeFilter, setTaskTypeFilter] = useState('all'); // all, one-time, recurring
  const [dateFilter, setDateFilter] = useState('all'); // all, today, this-week, this-month
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6;

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

    // Status filter
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
    
    // Date range filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = new Date(t.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return taskDate.getTime() === today.getTime();
          case 'this-week': {
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            return taskDate >= today && taskDate <= weekEnd;
          }
          case 'this-month': {
            return taskDate.getMonth() === today.getMonth() && 
                   taskDate.getFullYear() === today.getFullYear();
          }
          default:
            return true;
        }
      });
    }
    
    // Apply search filter
    if (taskSearchTerm) {
      filtered = filtered.filter(t =>
        t.taskName?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        t.taskDescription?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        t.assignedName?.toLowerCase().includes(taskSearchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  
  // Filter recurring tasks with search and date
  const filteredRecurringTasks = recurringTasks.filter(t => {
    // Search filter
    if (taskSearchTerm) {
      const matchesSearch = t.taskName?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                           t.taskDescription?.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                           t.taskAssignedTo?.email?.toLowerCase().includes(taskSearchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    // Date filter for recurring tasks (check start date)
    if (dateFilter !== 'all' && t.taskStartDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(t.taskStartDate);
      taskDate.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case 'today':
          if (taskDate.getTime() !== today.getTime()) return false;
          break;
        case 'this-week': {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          if (taskDate < today || taskDate > weekEnd) return false;
          break;
        }
        case 'this-month':
          if (taskDate.getMonth() !== today.getMonth() || 
              taskDate.getFullYear() !== today.getFullYear()) return false;
          break;
      }
    }
    
    return true;
  });
  
  // Apply task type filter
  let allFilteredTasks = [];
  switch (taskTypeFilter) {
    case 'one-time':
      allFilteredTasks = [...filteredTasks];
      break;
    case 'recurring':
      allFilteredTasks = [...filteredRecurringTasks];
      break;
    default:
      allFilteredTasks = [...filteredTasks, ...filteredRecurringTasks];
  }
  
  // Pagination for tasks
  const totalTaskPages = Math.ceil(allFilteredTasks.length / itemsPerPage);
  const paginatedTasks = allFilteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Search & filter for departments
  const filteredDepts = depts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalDeptPages = Math.ceil(filteredDepts.length / itemsPerPage);
  const paginatedDepts = filteredDepts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -----------------------------------------
  //         SINGLE DEPARTMENT VIEW
  // -----------------------------------------
  if (communityDeptId && dept) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate flex-1">
                {dept.name}
              </h1>
              <button
                onClick={() => navigate(`/communities/${communityId}/departments`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
            </div>

            {dept.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{dept.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Link
                to={`/communities/${communityId}/${communityDeptId}/create-task`}
                className="bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition text-center text-xs font-medium"
              >
                + Task
              </Link>
              <Link
                to={`/communities/${communityId}/${communityDeptId}/recurring/create`}
                className="bg-purple-600 text-white px-2 py-1.5 rounded-lg hover:bg-purple-700 transition text-center text-xs font-medium"
              >
                + Recurring
              </Link>
              <button
                onClick={() => setShowTasks(!showTasks)}
                className="bg-gray-800 text-white px-2 py-1.5 rounded-lg hover:bg-gray-900 transition text-xs font-medium col-span-2 sm:col-span-1"
              >
                {showTasks ? "Hide" : "View"} Tasks
              </button>
            </div>
          </div>

          {/* TASKS LIST */}
          {showTasks && (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
              {/* Search Bar */}
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={taskSearchTerm}
                  onChange={(e) => { setTaskSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>

              {/* Filter Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-bold text-gray-800">
                  Tasks ({allFilteredTasks.length})
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-xs"
                >
                  <FaFilter className="text-xs" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Filter Buttons */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3 space-y-3"
                  >
                    {/* Status Filter */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-600 mb-1.5">Status</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => { setTaskFilter('all'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => { setTaskFilter('upcoming'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskFilter === 'upcoming'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Upcoming
                        </button>
                        <button
                          onClick={() => { setTaskFilter('overdue'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskFilter === 'overdue'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Overdue
                        </button>
                        <button
                          onClick={() => { setTaskFilter('completed'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskFilter === 'completed'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>
                    
                    {/* Task Type Filter */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-600 mb-1.5">Task Type</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => { setTaskTypeFilter('all'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskTypeFilter === 'all'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => { setTaskTypeFilter('one-time'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskTypeFilter === 'one-time'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          One-Time
                        </button>
                        <button
                          onClick={() => { setTaskTypeFilter('recurring'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            taskTypeFilter === 'recurring'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Recurring
                        </button>
                      </div>
                    </div>
                    
                    {/* Date Filter */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-600 mb-1.5">Date Range</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => { setDateFilter('all'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            dateFilter === 'all'
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All Dates
                        </button>
                        <button
                          onClick={() => { setDateFilter('today'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            dateFilter === 'today'
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => { setDateFilter('this-week'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            dateFilter === 'this-week'
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          This Week
                        </button>
                        <button
                          onClick={() => { setDateFilter('this-month'); setCurrentPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            dateFilter === 'this-month'
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          This Month
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tasks Grid */}
              {paginatedTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">No tasks found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
                  {paginatedTasks.map((t) => {
                    const isRecurring = !!t.taskFrequency;
                    const isCompleted = !!t.completedDate;
                    const isOverdue = !isCompleted && !isRecurring && t.dueDate && new Date(t.dueDate) < new Date();
                    
                    return (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => navigate(isRecurring ? `/recurring/tasks/${t._id}` : `/tasks/${t._id}`)}
                        className={`p-2.5 sm:p-3 rounded-lg shadow hover:shadow-md cursor-pointer transition ${
                          isRecurring
                            ? 'bg-purple-50 border border-purple-300'
                            : isCompleted
                            ? 'bg-green-50 border border-green-300'
                            : isOverdue
                            ? 'bg-red-50 border border-red-300'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <h3 className="font-bold text-xs sm:text-sm mb-1 line-clamp-2">
                          {t.taskName} {isRecurring && '🔁'} {isCompleted && '✓'} {isOverdue && '⚠️'}
                        </h3>
                        <p className="text-[10px] text-gray-600 mb-2 line-clamp-1">{t.taskDescription}</p>
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-gray-600 truncate">
                            {isRecurring
                              ? `${t.taskAssignedTo?.email || 'N/A'}`
                              : `${t.assignedTo?.username || t.assignedName || 'N/A'}`
                            }
                          </p>
                          <p className="text-[9px] text-gray-500">
                            {isRecurring
                              ? `${t.taskFrequency}`
                              : t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'
                            }
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalTaskPages > 1 && (
                <div className="flex items-center justify-between border-t pt-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                  >
                    <FaChevronLeft className="text-xs" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <span className="text-xs text-gray-600">
                    Page {currentPage} of {totalTaskPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalTaskPages, p + 1))}
                    disabled={currentPage === totalTaskPages}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------
  //            ALL DEPARTMENTS VIEW
  // -----------------------------------------
  const isOwner = community?.CreatedBy?.toString() === user?._id;
  const pendingCount = community?.waitingApproval?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3"
        >
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition flex items-center gap-1 text-blue-600 text-xs"
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <div className="flex gap-2">
              {isOwner && pendingCount > 0 && (
                <Link
                  to={`/communities/${communityId}/pending`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1.5 rounded-lg transition flex items-center gap-1 text-xs"
                >
                  <FaBell className="text-xs" />
                  <span className="hidden sm:inline">Applications</span>
                  <span className="bg-white text-orange-600 rounded-full px-1.5 text-[10px] font-bold">
                    {pendingCount}
                  </span>
                </Link>
              )}
              
              <Link
                to={`/communities/${communityId}/departments/create`}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-2 py-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium"
              >
                <FaPlus className="text-xs" />
                <span className="hidden sm:inline">Create</span>
              </Link>
            </div>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2 mb-3">
            <FaSitemap className="text-blue-600" /> 
            <span className="truncate">{community?.name}</span>
          </h1>
          
          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            />
          </div>
        </motion.div>

        {/* Results Info */}
        {searchTerm && (
          <div className="mb-3 text-xs text-gray-600 px-1">
            Found {filteredDepts.length} department{filteredDepts.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Departments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
          {paginatedDepts.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <FaSitemap className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No departments match your search' : 'No departments found'}
              </p>
              {!searchTerm && (
                <p className="text-gray-400 text-xs mt-1">Create your first department!</p>
              )}
            </div>
          ) : (
            paginatedDepts.map((d, index) => (
              <motion.div
                key={d._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/communities/${communityId}/departments/${d._id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-3 sm:p-4 border border-transparent hover:border-blue-300 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                      <FaSitemap className="text-lg text-blue-600" />
                    </div>
                    <FaChevronRight className="text-gray-400 group-hover:text-blue-600 transition text-xs" />
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition line-clamp-1">
                    {d.name}
                  </h3>
                  
                  <p className="text-gray-600 text-xs line-clamp-2">{d.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-blue-600 text-xs font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalDeptPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-3 flex items-center justify-between"
          >
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1 font-medium"
            >
              <FaChevronLeft className="text-xs" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalDeptPages, 5) }, (_, i) => {
                let pageNum;
                if (totalDeptPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalDeptPages - 2) {
                  pageNum = totalDeptPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalDeptPages, p + 1))}
              disabled={currentPage === totalDeptPages}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1 font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <FaChevronRight className="text-xs" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommunityDepartments;
