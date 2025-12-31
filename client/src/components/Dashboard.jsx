import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../assests/store";
import { Link, useNavigate } from "react-router-dom";
import { getAllCommunities } from "../services/community";
import { motion } from "framer-motion";
import {
  FaTasks,
  FaCalendarDay,
  FaInfoCircle,
  FaExclamationTriangle,
  FaUsers,
  FaRedo,
  FaClipboardList,
  FaUserCheck,
} from "react-icons/fa";

const Dashboard = () => {
  const { user, isAuthenticated, tasks, getUserTasks } = useAuthStore();
  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [myTasksTab, setMyTasksTab] = useState("onetime"); // onetime or recurring
  const [assignedByMeTasks, setAssignedByMeTasks] = useState([]);
  const [showAllToday, setShowAllToday] = useState(false);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [showAllFollowups, setShowAllFollowups] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks when user is available
  useEffect(() => {
    if (user?.email) {
      getUserTasks(user.email);
    }
  }, [user, getUserTasks]);

  // Fetch user's communities and calculate tasks assigned to user
  useEffect(() => {
    const loadUserCommunities = async () => {
      if (!user?._id || !user?.email) return;
      try {
        const allCommunities = await getAllCommunities();
        const myCommunities = allCommunities.filter(c => {
          const isOwner = c.CreatedBy?.toString() === user._id;
          const isMember = c.members?.some((m) => m.toString() === user._id);
          return isOwner || isMember;
        });

        // Calculate tasks assigned to this user in each community
        const communitiesWithUserTasks = myCommunities.map(community => {
          const userTasksInCommunity = tasks?.filter(
            task => task.community?.toString() === community._id && 
                    task.assignedTo === user.email
          ) || [];
          return {
            ...community,
            userTaskCount: userTasksInCommunity.length
          };
        });
        
        setUserCommunities(communitiesWithUserTasks);
      } catch (error) {
        console.error("Failed to load communities:", error);
      }
    };
    loadUserCommunities();
  }, [user, tasks]);

  // Filter tasks due today and overdue tasks - only tasks assigned TO me
  useEffect(() => {
    if (!tasks || !user?.email) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only show tasks assigned TO me (not tasks I assigned to others)
    const myTasks = tasks.filter(
      (task) => task.assignedTo === user.email
    );

    const filteredToday = myTasks.filter(
      (task) =>
        new Date(task.dueDate).toDateString() === today.toDateString() &&
        !task.completedDate
    );
    setTodayTasks(filteredToday);

    const filteredOverdue = myTasks.filter(
      (task) => new Date(task.dueDate) < today && !task.completedDate
    );
    setOverdueTasks(filteredOverdue);
  }, [tasks, user]);

  // Get tasks assigned BY me (where I'm the creator)
  useEffect(() => {
    if (!tasks || !user?.email) return;
    
    const tasksIAssigned = tasks.filter(
      (task) => task.createdBy === user.email
    );
    setAssignedByMeTasks(tasksIAssigned);
  }, [tasks, user]);

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const linkButtonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 15px rgba(59, 130, 246, 0.3)" },
    tap: { scale: 0.95 },
  };

  // Conditional rendering for unauthenticated user
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
        <motion.div
          className="bg-white p-8 rounded-2xl shadow-xl border border-blue-200"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <FaInfoCircle className="text-red-500 text-5xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view this page.
          </p>
          <Link to="/login">
            <motion.button
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:bg-blue-700 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Calendar state and helpers
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  });

  const fmtKey = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startOfMonth = new Date(monthCursor);
  const endOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth()+1, 0);
  const startDay = new Date(startOfMonth);
  startDay.setDate(startOfMonth.getDate() - startOfMonth.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    d.setHours(0,0,0,0);
    return d;
  });

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t;
  }, []);

  const tasksByDate = useMemo(() => {
    const map = {};
    // Only include tasks assigned TO me
    (tasks || []).filter(t => t.assignedTo === user?.email).forEach(t => {
      if (!t?.dueDate) return;
      const d = new Date(t.dueDate);
      d.setHours(0,0,0,0);
      const key = fmtKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks, user]);

  // Derived totals for progress ring
  const { totalTasks, completedPct } = useMemo(() => {
    const assigned = user?.TasksAssigned || 0;
    const inProgress = user?.TasksInProgress || 0;
    const completed = user?.TasksCompleted || 0;
    const notStarted = user?.TasksNotStarted || 0;
    const total = assigned + inProgress + completed + notStarted;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalTasks: total, completedPct: pct };
  }, [user]);

  // Separate my tasks into one-time and recurring
  const myOneTimeTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(
      (task) => task.assignedTo === user?.email && (task.taskFrequency === "One-time" || task.taskFrequency === "OneTime")
    );
  }, [tasks, user]);

  const myRecurringTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(
      (task) => task.assignedTo === user?.email && task.taskFrequency !== "One-time" && task.taskFrequency !== "OneTime"
    );
  }, [tasks, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-1 sm:p-2 lg:p-3">
      <motion.div
        className="max-w-7xl mx-auto mt-2 sm:mt-3 p-3 sm:p-4 lg:p-5 bg-white rounded-2xl shadow-2xl border border-blue-200 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-2"
          variants={itemVariants}
        >
          <FaTasks className="text-blue-600 text-xl sm:text-2xl lg:text-3xl" /> Your Dashboard
        </motion.h2>

        {/* TODAY'S TASKS & OVERDUE TASKS AT TOP - Side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {/* Today's Due Tasks Section */}
          <motion.div
            className="p-2 sm:p-3 bg-blue-50 rounded-lg shadow-md border border-blue-100"
            variants={itemVariants}
          >
            <h3 className="text-sm sm:text-base font-bold mb-2 text-blue-800 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <FaCalendarDay className="text-xs" /> Today's Due Tasks
              </span>
              <Link to="/tasks?date=today" className="text-[10px] sm:text-xs font-semibold text-blue-700 hover:underline">View all</Link>
            </h3>
            {todayTasks.length === 0 ? (
              <p className="text-gray-500 italic text-center py-2 text-xs sm:text-sm">
                No tasks are due today. Enjoy your day!
              </p>
            ) : (
              <>
                <ul className="space-y-1.5 sm:space-y-2">
                  {(showAllToday ? todayTasks : todayTasks.slice(0, 3)).map((task, index) => (
                  <motion.li
                    key={task._id || index}
                    className="border border-blue-200 p-1.5 sm:p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                  >
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">
                      {task.taskName || task.task}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-gray-600">
                      <p>
                        <strong>Due:</strong>{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Priority:</strong>{" "}
                        <span
                          className={`font-medium ${
                            task.priority === "High"
                              ? "text-red-500"
                              : task.priority === "Medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </p>
                      <p>
                        <strong>Frequency:</strong> {task.taskFrequency}
                      </p>
                      {task.createdBy && (
                        <p className="col-span-1">
                          <strong>Assigned By:</strong>{" "}
                          <span className="font-medium text-blue-700">
                            {task.createdBy}
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.li>
                ))}
                </ul>
                {todayTasks.length > 3 && (
                  <button
                    onClick={() => setShowAllToday(!showAllToday)}
                    className="w-full mt-2 py-1 text-[10px] sm:text-xs text-blue-700 font-semibold hover:text-blue-900 transition-colors"
                  >
                    {showAllToday ? "Show Less" : `Load More (${todayTasks.length - 3} more)`}
                  </button>
                )}
              </>
            )}
          </motion.div>

          {/* Overdue Tasks Section */}
          <motion.div
            className="p-2 sm:p-3 bg-red-50 rounded-lg shadow-md border border-red-100"
            variants={itemVariants}
          >
            <h3 className="text-sm sm:text-base font-bold mb-2 text-red-700 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" /> Overdue Tasks
              </span>
              <Link to="/tasks?overdue=true" className="text-[10px] sm:text-xs font-semibold text-red-700 hover:underline">View all</Link>
            </h3>
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500 italic text-center py-2 text-xs sm:text-sm">
                No overdue tasks. Great job!
              </p>
            ) : (
              <>
                <ul className="space-y-1.5 sm:space-y-2">
                  {(showAllOverdue ? overdueTasks : overdueTasks.slice(0, 3)).map((task, index) => (
                  <motion.li
                    key={task._id || index}
                    className="border border-red-200 p-1.5 sm:p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                  >
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">
                      {task.taskName || task.task}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-gray-600">
                      <p>
                        <strong>Due:</strong>{" "}
                        <span className="text-red-500">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </p>
                      <p>
                        <strong>Priority:</strong>{" "}
                        <span
                          className={`font-medium ${
                            task.priority === "High"
                              ? "text-red-500"
                              : task.priority === "Medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </p>
                      <p>
                        <strong>Frequency:</strong> {task.taskFrequency}
                      </p>
                      {task.createdBy && (
                        <p className="col-span-1">
                          <strong>Assigned By:</strong>{" "}
                          <span className="font-medium text-blue-700">
                            {task.createdBy}
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.li>
                ))}
                </ul>
                {overdueTasks.length > 3 && (
                  <button
                    onClick={() => setShowAllOverdue(!showAllOverdue)}
                    className="w-full mt-2 py-1 text-[10px] sm:text-xs text-red-700 font-semibold hover:text-red-900 transition-colors"
                  >
                    {showAllOverdue ? "Show Less" : `Load More (${overdueTasks.length - 3} more)`}
                  </button>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* CALENDAR SECTION */}
        <motion.div
          className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg shadow-md border border-blue-100"
          variants={itemVariants}
        >
          <h3 className="text-sm sm:text-base font-bold mb-2 text-blue-800 flex items-center gap-1">
            <FaCalendarDay className="text-xs" /> Calendar
          </h3>
          
          {/* Completion Progress Ring */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${((100 - completedPct) / 100) * (2 * Math.PI * 42)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-blue-700">{completedPct}%</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] sm:text-xs text-gray-600">Overall completion</p>
              <p className="text-sm sm:text-base font-extrabold text-gray-900">{user?.TasksCompleted || 0} / {totalTasks}</p>
            </div>
          </div>

          {/* Month selector */}
          <div className="flex items-center justify-between mb-3">
            <button
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            >
              Prev
            </button>
            <div className="font-semibold text-sm sm:text-base text-blue-900">
              {monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <button
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            >
              Next
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs text-gray-600 mb-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const key = fmtKey(d);
              const dayTasks = tasksByDate[key] || [];
              const pending = dayTasks.filter(t => !t.completedDate);
              const completed = dayTasks.filter(t => !!t.completedDate);
              const isCurrentMonth = d.getMonth() === monthCursor.getMonth();
              const isToday = d.getTime() === today.getTime();
              const isOverdueDay = d < today && pending.length > 0;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(`/tasks?date=${key}`)}
                  className={`relative h-10 sm:h-12 rounded-md border text-left p-0.5 sm:p-1 flex flex-col justify-between transition-colors
                    ${isCurrentMonth ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-200 text-gray-400'}
                    ${isToday ? 'ring-2 ring-blue-400' : ''}
                    hover:bg-blue-50`}
                  title={`${pending.length} pending, ${completed.length} completed`}
                >
                  <div className="text-[10px] sm:text-xs font-semibold">{d.getDate()}</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {pending.length > 0 && (
                      <span className={`inline-flex items-center justify-center text-[8px] sm:text-[10px] min-w-[14px] sm:min-w-[16px] h-3 sm:h-4 px-0.5 sm:px-1 rounded-full ${isOverdueDay ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>{pending.length}</span>
                    )}
                    {completed.length > 0 && (
                      <span className="inline-flex items-center justify-center text-[8px] sm:text-[10px] min-w-[14px] sm:min-w-[16px] h-3 sm:h-4 px-0.5 sm:px-1 rounded-full bg-green-500 text-white">{completed.length}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend and quick filters */}
          <div className="flex flex-wrap justify-center text-[10px] sm:text-xs mt-3 sm:mt-4 text-gray-700 gap-2 sm:gap-3">
            <div className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 inline-block"></span> Pending</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 inline-block"></span> Completed</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 inline-block"></span> Overdue pending</div>
          </div>

          {/* Quick Filters */}
          <div className="mt-2 sm:mt-3 grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            <Link to="/tasks?view=pending">
              <motion.button
                className="w-full bg-white border border-blue-200 text-blue-700 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold hover:bg-blue-50"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                View Pending
              </motion.button>
            </Link>
            <Link to="/tasks?view=completed">
              <motion.button
                className="w-full bg-white border border-green-200 text-green-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-50"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                View Completed
              </motion.button>
            </Link>
            <Link to="/tasks?date=today">
              <motion.button
                className="w-full bg-white border border-indigo-200 text-indigo-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-50"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Due Today
              </motion.button>
            </Link>
            <Link to="/tasks?overdue=true">
              <motion.button
                className="w-full bg-white border border-red-200 text-red-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-50"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Overdue
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* MY TASKS SECTION WITH TABS */}
        <motion.div
          className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 rounded-lg shadow-md border border-green-100"
          variants={itemVariants}
        >
          <h3 className="text-sm sm:text-base font-bold mb-2 text-green-800 flex items-center gap-1">
            <FaClipboardList className="text-xs" /> My Tasks
          </h3>

          {/* Tabs */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setMyTasksTab("onetime")}
              className={`flex-1 py-1 px-2 rounded-md text-[10px] sm:text-xs font-semibold transition-colors ${
                myTasksTab === "onetime"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
              }`}
            >
              <FaTasks className="inline mr-1 text-[10px]" /> One Time ({myOneTimeTasks.length})
            </button>
            <button
              onClick={() => setMyTasksTab("recurring")}
              className={`flex-1 py-1 px-2 rounded-md text-[10px] sm:text-xs font-semibold transition-colors ${
                myTasksTab === "recurring"
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
              }`}
            >
              <FaRedo className="inline mr-1 text-[10px]" /> Recurring ({myRecurringTasks.length})
            </button>
          </div>

          {/* Task List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {myTasksTab === "onetime" ? (
              myOneTimeTasks.length === 0 ? (
                <p className="text-gray-500 italic text-center py-2 text-xs sm:text-sm">
                  No one-time tasks assigned to you.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {myOneTimeTasks.map((task, index) => (
                    <motion.li
                      key={task._id || index}
                      className="border border-green-200 p-1.5 sm:p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                    >
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">
                        {task.task}
                      </p>
                      <div className="grid grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-gray-600">
                        <p>
                          <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Priority:</strong>{" "}
                          <span
                            className={`font-medium ${
                              task.priority === "High"
                                ? "text-red-500"
                                : task.priority === "Medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )
            ) : (
              myRecurringTasks.length === 0 ? (
                <p className="text-gray-500 italic text-center py-2 text-xs sm:text-sm">
                  No recurring tasks assigned to you.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {myRecurringTasks.map((task, index) => (
                    <motion.li
                      key={task._id || index}
                      className="border border-green-200 p-1.5 sm:p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                    >
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">
                        {task.task}
                      </p>
                      <div className="grid grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-gray-600">
                        <p>
                          <strong>Frequency:</strong> {task.taskFrequency}
                        </p>
                        <p>
                          <strong>Priority:</strong>{" "}
                          <span
                            className={`font-medium ${
                              task.priority === "High"
                                ? "text-red-500"
                                : task.priority === "Medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )
            )}
          </div>
        </motion.div>

        {/* FOLLOWUPS - TASKS ASSIGNED BY ME */}
        <motion.div
          className="mb-3 sm:mb-4 p-2 sm:p-3 bg-orange-50 rounded-lg shadow-md border border-orange-100"
          variants={itemVariants}
        >
          <h3 className="text-sm sm:text-base font-bold mb-2 text-orange-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1">
              <FaUserCheck className="text-xs" /> Follow Ups
            </span>
            <Link to="/mywork" className="text-[10px] sm:text-xs font-semibold text-orange-700 hover:underline">View all</Link>
          </h3>
          {assignedByMeTasks.length === 0 ? (
            <p className="text-gray-500 italic text-center py-2 text-xs sm:text-sm">
              You haven't assigned any tasks yet.
            </p>
          ) : (
            <>
              <ul className="space-y-1.5 sm:space-y-2">
                {(showAllFollowups ? assignedByMeTasks : assignedByMeTasks.slice(0, 3)).map((task, index) => (
                <motion.li
                  key={task._id || index}
                  className="border border-orange-200 p-1.5 sm:p-2 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                >
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">
                    {task.taskName || task.task}
                  </p>
                  <div className="grid grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-gray-600">
                    <p>
                      <strong>Assigned To:</strong> {task.assignedTo}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`font-medium ${
                          task.completedDate
                            ? "text-green-600"
                            : task.status === "In Progress"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {task.completedDate ? "Completed" : task.status || "Not Started"}
                      </span>
                    </p>
                    <p>
                      <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Priority:</strong>{" "}
                      <span
                        className={`font-medium ${
                          task.priority === "High"
                            ? "text-red-500"
                            : task.priority === "Medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
            {assignedByMeTasks.length > 3 && (
              <button
                onClick={() => setShowAllFollowups(!showAllFollowups)}
                className="w-full mt-2 py-1 text-[10px] sm:text-xs text-orange-700 font-semibold hover:text-orange-900 transition-colors"
              >
                {showAllFollowups ? "Show Less" : `Load More (${assignedByMeTasks.length - 3} more)`}
              </button>
            )}
          </>
        )}
        </motion.div>

        {/* MY COMMUNITIES SECTION */}
        <motion.div
          className="p-2 sm:p-3 bg-purple-50 rounded-lg shadow-md border border-purple-100"
          variants={itemVariants}
        >
          <h3 className="text-sm sm:text-base font-bold mb-2 text-purple-800 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <FaUsers /> My Communities
            </span>
            <Link to="/communities" className="text-xs sm:text-sm font-semibold text-purple-700 hover:underline">View all</Link>
          </h3>
          {userCommunities.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 italic mb-2 text-xs sm:text-sm">
                You haven't joined any communities yet.
              </p>
              <Link to="/communities">
                <motion.button
                  className="bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold hover:bg-purple-700 transition"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Explore Communities
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-2.5">
              {userCommunities.map((community, index) => {
                const isOwner = community.CreatedBy?.toString() === user?._id;
                return (
                  <motion.div
                    key={community._id}
                    className="border border-purple-200 p-2 sm:p-2.5 rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/communities/${community._id}/departments`)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-800">{community.name}</h4>
                      {isOwner && (
                        <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[8px] sm:text-[10px] rounded-full font-bold">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-1.5 line-clamp-2">{community.description}</p>
                    <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500">
                      <span>👥 {community.totalMembers} members</span>
                      <span>✅ {community.userTaskCount || 0} tasks</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
