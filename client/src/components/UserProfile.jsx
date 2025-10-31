import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../assests/store";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
// Removed Recharts bar chart in favor of a calendar view
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaTasks,
  FaCalendarDay,
  FaInfoCircle,
  FaCheckCircle,
  FaPlayCircle,
  FaTimesCircle,
  FaPlusSquare,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";

const UserProfile = () => {
  const { user, isAuthenticated, tasks, getUserTasks, userDetail, fetchUserDetail } = useAuthStore();
  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const navigate = useNavigate();

  // Fetch tasks when user is available
  useEffect(() => {
    if (user?.email) {
      getUserTasks(user.email);
      // Fetch extended user details (phone, role) if not present
      if (!userDetail) {
        fetchUserDetail(user.email);
      }
    }
  }, [user, getUserTasks, fetchUserDetail, userDetail]);

  // Filter tasks due today and overdue tasks
  useEffect(() => {
    if (!tasks) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of the day

    const filteredToday = tasks.filter(
      (task) =>
        new Date(task.dueDate).toDateString() === today.toDateString() &&
        !task.completedDate
    );
    setTodayTasks(filteredToday);

    const filteredOverdue = tasks.filter(
      (task) => new Date(task.dueDate) < today && !task.completedDate
    );
    setOverdueTasks(filteredOverdue);
  }, [tasks]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear local auth store to ensure UI hides authed-only elements like sidebar
      useAuthStore.setState({ user: null, isAuthenticated: false, userDetail: null, tasks: [] });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
  startDay.setDate(startOfMonth.getDate() - startOfMonth.getDay()); // Sunday start
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
    (tasks || []).forEach(t => {
      if (!t?.dueDate) return;
      const d = new Date(t.dueDate);
      d.setHours(0,0,0,0);
      const key = fmtKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-4xl mx-auto mt-8 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-4"
          variants={itemVariants}
        >
          <FaUserCircle className="text-blue-600 text-4xl sm:text-5xl" /> Your Dashboard
        </motion.h2>

        {/* User Details & Task Stats Section */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* User Details Card */}
          <motion.div
            className="p-5 bg-blue-50 rounded-xl shadow-md border border-blue-100 flex flex-col gap-4"
            variants={itemVariants}
          >
            <div>
              <h3 className="text-xl font-bold mb-3 text-blue-800 flex items-center gap-2">
                <FaInfoCircle /> User Details
              </h3>
              {/* Header with avatar and greeting */}
              <div className="flex items-center gap-4 mb-4">
                <FaUserCircle className="text-blue-600 text-5xl" />
                <div>
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {user.username || user.displayName || user.email?.split("@")[0]}
                  </p>
                </div>
              </div>

              {/* Contact & Account Info */}
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 mb-4">
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Email</span>
                  <span className="font-semibold text-blue-800 truncate max-w-[60%] text-right">{user.email}</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Phone</span>
                  <span className="font-semibold text-blue-800">{userDetail?.phoneNumber || "—"}</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Role</span>
                  <span className="font-semibold text-blue-800 capitalize">{userDetail?.role || "user"}</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Member since</span>
                  <span className="font-semibold text-blue-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Last login</span>
                  <span className="font-semibold text-blue-800">
                    {auth.currentUser?.metadata?.lastSignInTime
                      ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="font-medium">Email verified</span>
                  <span className="font-semibold text-blue-800">{auth.currentUser?.emailVerified ? "Yes" : "No"}</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link to="/create">
                  <motion.button
                    className="w-full bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50"
                    variants={linkButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Create Task
                  </motion.button>
                </Link>
                <Link to="/chat">
                  <motion.button
                    className="w-full bg-white border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50"
                    variants={linkButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    World Chat
                  </motion.button>
                </Link>
              </div>

              {/* Compact Task Summary to balance height */}
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">My Task Summary</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-white/70 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-700 text-sm"><FaTasks className="text-blue-500"/> Assigned</span>
                    <span className="text-blue-900 font-bold">{user?.TasksAssigned || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 border border-yellow-100 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-700 text-sm"><FaPlayCircle className="text-yellow-500"/> In Progress</span>
                    <span className="text-yellow-700 font-bold">{user?.TasksInProgress || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 border border-green-100 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-700 text-sm"><FaCheckCircle className="text-green-500"/> Completed</span>
                    <span className="text-green-700 font-bold">{user?.TasksCompleted || 0}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/70 border border-red-100 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-gray-700 text-sm"><FaTimesCircle className="text-red-500"/> Not Started</span>
                    <span className="text-red-700 font-bold">{user?.TasksNotStarted || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-2">
              <Link to="/tasks">
                <motion.button
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-blue-700 transition-all duration-200"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaTasks /> View All Tasks
                </motion.button>
              </Link>
              <Link to="/mywork">
                <motion.button
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-indigo-700 transition-all duration-200"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaPlusSquare /> Tasks Assigned By Me
                </motion.button>
              </Link>
            </div>
            {/* Logout Button inside the user details card */}
            <div className="mt-4 flex justify-center">
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-md hover:bg-red-700 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt /> Logout
              </motion.button>
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div
            className="p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100 flex flex-col"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
              <FaCalendarDay /> Calendar
            </h3>
            {/* Completion Progress Ring (kept) */}
            <div className="flex items-center gap-6 mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
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
                  <span className="text-lg font-bold text-blue-700">{completedPct}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall completion</p>
                <p className="text-2xl font-extrabold text-gray-900">{user?.TasksCompleted || 0} / {totalTasks}</p>
              </div>
            </div>
            {/* Month selector */}
            <div className="flex items-center justify-between mb-3">
              <button
                className="px-3 py-1 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
                onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
              >
                Prev
              </button>
              <div className="font-semibold text-blue-900">
                {monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </div>
              <button
                className="px-3 py-1 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
                onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
              >
                Next
              </button>
            </div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs text-gray-600 mb-1">
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
                    className={`relative h-16 rounded-lg border text-left p-2 flex flex-col justify-between transition-colors
                      ${isCurrentMonth ? 'bg-white border-blue-100' : 'bg-gray-50 border-gray-200 text-gray-400'}
                      ${isToday ? 'ring-2 ring-blue-400' : ''}
                      hover:bg-blue-50`}
                    title={`${pending.length} pending, ${completed.length} completed`}
                  >
                    <div className="text-xs font-semibold">{d.getDate()}</div>
                    <div className="flex items-center gap-1">
                      {pending.length > 0 && (
                        <span className={`inline-flex items-center justify-center text-[10px] min-w-[16px] h-4 px-1 rounded-full ${isOverdueDay ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>{pending.length}</span>
                      )}
                      {completed.length > 0 && (
                        <span className="inline-flex items-center justify-center text-[10px] min-w-[16px] h-4 px-1 rounded-full bg-green-500 text-white">{completed.length}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend and quick filters */}
            <div className="flex flex-wrap justify-center text-xs mt-4 text-gray-700 gap-3">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Pending</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Completed</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Overdue pending</div>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link to="/tasks?view=pending">
                <motion.button
                  className="w-full bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  View Pending
                </motion.button>
              </Link>
              <Link to="/tasks?view=completed">
                <motion.button
                  className="w-full bg-white border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  View Completed
                </motion.button>
              </Link>
              <Link to="/tasks?date=today">
                <motion.button
                  className="w-full bg-white border border-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Due Today
                </motion.button>
              </Link>
              <Link to="/tasks?overdue=true">
                <motion.button
                  className="w-full bg-white border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-50"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Overdue
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Today's Due Tasks Section */}
        <motion.div
          className="mt-6 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center justify-between gap-2">
            <FaCalendarDay /> Today's Due Tasks
            <Link to="/tasks?date=today" className="text-sm font-semibold text-blue-700 hover:underline">View all</Link>
          </h3>
          {todayTasks.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">
              No tasks are due today. Enjoy your day!
            </p>
          ) : (
            <ul className="space-y-4">
              {todayTasks.map((task, index) => (
                <motion.li
                  key={task._id || index}
                  className="border border-blue-200 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                >
                  <p className="text-md font-semibold text-gray-800 mb-1">
                    {task.task}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 text-sm text-gray-600">
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
                    {/* Changed to createdBy */}
                    {task.createdBy && (
                      <p className="col-span-2 sm:col-span-1">
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
          )}
        </motion.div>

        {/* Overdue Tasks Section */}
        <motion.div
          className="mt-6 p-6 bg-blue-50 rounded-xl shadow-md border border-blue-100"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold mb-4 text-red-700 flex items-center justify-between gap-2">
            <FaExclamationTriangle /> Overdue Tasks
            <Link to="/tasks?overdue=true" className="text-sm font-semibold text-red-700 hover:underline">View all</Link>
          </h3>
          {overdueTasks.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">
              No overdue tasks. Great job!
            </p>
          ) : (
            <ul className="space-y-4">
              {overdueTasks.map((task, index) => (
                <motion.li
                  key={task._id || index}
                  className="border border-red-200 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                >
                  <p className="text-md font-semibold text-gray-800 mb-1">
                    {task.task}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 text-sm text-gray-600">
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
                    {/* Changed to createdBy */}
                    {task.createdBy && (
                      <p className="col-span-2 sm:col-span-1">
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
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;