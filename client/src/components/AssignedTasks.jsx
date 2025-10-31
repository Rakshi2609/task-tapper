import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../assests/store";
import { Link } from "react-router-dom";
import { FaSearch, FaCalendarAlt, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";
import { getAllRecurringTasks } from "../services/rexurring";
import Pagination from "./Pagination";

const AssignedTasks = () => {
  const { user, tasks, getAssignedByMe } = useAuthStore();
  const [allAssignedTasks, setAllAssignedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [sortBy, setSortBy] = useState("none");
  const [searchTask, setSearchTask] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12; // grid of 3x4

  // 1. Fetch one-time tasks you assigned (store) when user changes
  useEffect(() => {
    if (!user?.email) return;
    getAssignedByMe(user.email); // store handles its own loading state
  }, [user?.email, getAssignedByMe]);

  // 2. Fetch recurring tasks you assigned when user changes (only once per user)
  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    const fetchRecurring = async () => {
      setLoading(true);
      try {
        const res = await getAllRecurringTasks();
        const raw = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        const mine = raw.filter(t => t?.taskAssignedBy?.email === user.email).map(rt => ({
          ...rt,
          taskName: rt.taskName,
          taskDescription: rt.taskDescription,
          taskFrequency: rt.taskFrequency,
          assignedTo: rt.taskAssignedTo?.email || rt.taskAssignedTo,
          assignedName: rt.taskAssignedTo?.username || rt.taskAssignedTo?.email?.split('@')[0] || '',
          dueDate: rt.taskStartDate,
        }));
        if (!cancelled) setRecurringTasks(mine);
      } catch (e) {
        if (!cancelled) console.error('Failed to fetch recurring tasks:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRecurring();
    return () => { cancelled = true; };
  }, [user?.email]);

  // 3. Merge tasks (store) + recurring into a unified list whenever either changes
  useEffect(() => {
    const merged = [...(tasks || []), ...recurringTasks];
    setAllAssignedTasks(merged);
  }, [tasks, recurringTasks]);
  // }, [user, getAssignedByMe, tasks]);

  useEffect(() => {
    if (!Array.isArray(allAssignedTasks)) return;

    let tempFiltered = [...allAssignedTasks];

    if (filterStatus === "Pending") {
      tempFiltered = tempFiltered.filter((task) => !task.completedDate);
    } else if (filterStatus === "Completed") {
      tempFiltered = tempFiltered.filter((task) => task.completedDate);
    }

    if (searchTask.trim()) {
      const words = searchTask.toLowerCase().split(" ");
      tempFiltered = tempFiltered.filter((task) =>
        words.every(
          (word) =>
            (task?.taskName || "").toLowerCase().includes(word) ||
            (task?.taskDescription || "").toLowerCase().includes(word)
        )
      );
    }

    if (searchEmail.trim()) {
      const words = searchEmail.toLowerCase().split(" ");
      tempFiltered = tempFiltered.filter((task) =>
        words.every((word) =>
          (task?.taskAssignedTo?.email || task?.assignedTo || "").toLowerCase().includes(word)
        )
      );
    }

    if (selectedDate) {
      tempFiltered = tempFiltered.filter(
        (task) =>
          new Date(task?.dueDate || task?.taskStartDate).toDateString() ===
          selectedDate.toDateString()
      );
    }

    if (sortBy === "name") {
      tempFiltered.sort((a, b) => (a?.taskName || "").localeCompare(b?.taskName || ""));
    } else if (sortBy === "email") {
      tempFiltered.sort((a, b) =>
        (a?.assignedTo?.email || a?.assignedTo || "").localeCompare(
          b?.assignedTo?.email || b?.assignedTo || ""
        )
      );
    } else if (sortBy === "frequency") {
      tempFiltered.sort((a, b) =>
        (a?.taskFrequency || "").localeCompare(b?.taskFrequency || "")
      );
    } else {
      // Default: latest created first, then earliest due date
      tempFiltered.sort((a, b) => {
        const createdA = new Date(a.createdAt || a.taskStartDate || a.dueDate);
        const createdB = new Date(b.createdAt || b.taskStartDate || b.dueDate);
        const dueA = new Date(a.dueDate || a.taskStartDate || a.createdAt);
        const dueB = new Date(b.dueDate || b.taskStartDate || b.createdAt);

        if (createdB - createdA !== 0) {
          return createdB - createdA; // latest created first
        }
        return dueA - dueB; // earliest due date next
      });
    }

    setFilteredTasks(tempFiltered);
    setPage(1); // reset to first page when filters change
  }, [allAssignedTasks, sortBy, searchTask, searchEmail, selectedDate, filterStatus, tasks]);

  const getTaskDetailLink = (task) => {
    if (task.taskAssignedBy) {
      return `/recurring/tasks/${task._id}`;
    }
    return `/tasks/${task._id}`;
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case "High":
        return "border-red-500";
      case "Medium":
        return "border-orange-500";
      case "Low":
        return "border-cyan-500";
      default:
        return "border-gray-300";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200"
    >
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-md">
        Tasks You've Assigned
      </h2>

      <div className="flex flex-wrap justify-center md:justify-between gap-4 mb-8">
        {/* Filters */}
        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200"
        >
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer appearance-none pr-6"
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </motion.div>

        {/* Task Name Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200"
        >
          <FaSearch className="text-xl text-blue-500" />
          <input
            type="text"
            placeholder="Search Task Name/Description"
            value={searchTask}
            onChange={(e) => setSearchTask(e.target.value)}
            className="bg-transparent outline-none placeholder-gray-400 text-gray-700"
          />
        </motion.div>

        {/* Assigned Email Filter */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200"
        >
          <FaSearch className="text-xl text-blue-500" />
          <input
            type="text"
            placeholder="Search Assigned Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="bg-transparent outline-none placeholder-gray-400 text-gray-700"
          />
        </motion.div>

        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200"
        >
          <FaCalendarAlt className="text-xl text-blue-500" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Filter by Due Date"
            className="bg-transparent outline-none placeholder-gray-400 text-gray-700 w-36"
            dateFormat="PPP"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
            >
              Clear
            </button>
          )}
        </motion.div>
      </div>

      {loading && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-600 text-lg font-medium py-6">
          Loading your assigned tasks...
        </motion.p>
      )}
      {!loading && filteredTasks.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-gray-600 text-lg font-medium py-10"
        >
          You haven’t assigned any tasks yet or no tasks match your filters.
        </motion.p>
      ) : (
        <>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks
            .slice((page - 1) * pageSize, page * pageSize)
            .map((task, idx) => (
            <motion.li
              key={task._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)",
                transition: { duration: 0.2 },
              }}
              className="relative p-6 rounded-2xl bg-white shadow-lg border border-blue-100 overflow-hidden cursor-pointer group"
            >
              <Link to={getTaskDetailLink(task)} className="block h-full w-full absolute inset-0 z-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <p className="text-xl font-bold mb-1 text-gray-800">{task.taskName || task.task}</p>
                <p className="text-sm text-gray-600 mb-0.5">
                  <span className="font-semibold">Assigned To:</span>{" "}
                  {task.assignedName || task.assignedTo || task.taskAssignedTo?.email || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-0.5">
                  <span className="font-semibold">Due:</span>{" "}
                  {new Date(task.dueDate || task.taskStartDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600 mb-0.5">
                  <span className="font-semibold">Priority:</span>{" "}
                  <span
                    className={`${
                      (task.priority || task.taskPriority) === "High"
                        ? "text-red-500"
                        : (task.priority || task.taskPriority) === "Medium"
                        ? "text-orange-500"
                        : "text-green-500"
                    } font-medium`}
                  >
                    {task.priority || task.taskPriority}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Frequency:</span> {task.taskFrequency}
                </p>
                <p className="text-sm text-gray-700 font-semibold flex items-center">
                  Status:{" "}
                  {task.completedDate ? (
                    <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center">
                      <FaCheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  ) : (
                    <span className="ml-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center">
                      <FaHourglassHalf className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredTasks.length}
          onPageChange={setPage}
        />
        </>
      )}
    </motion.div>
  );
};

export default AssignedTasks;
