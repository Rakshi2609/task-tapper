import React, { useEffect, useState } from "react";
import { useAuthStore } from "../assests/store";
import { FaSearch, FaCalendarAlt, FaCheckCircle, FaHourglassHalf } from "react-icons/fa"; // Added FaCheckCircle, FaHourglassHalf
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from "framer-motion";

const AssignedTasks = () => {
  const { user, tasks, getAssignedByMe } = useAuthStore();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [sortBy, setSortBy] = useState("none"); // Keeping sortBy for now, but not directly exposed via a dropdown. Can be removed if not needed for internal sorting.
  const [searchTask, setSearchTask] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All"); // New state for status filter

  // Fetch tasks assigned by the current user
  useEffect(() => {
    if (user?.email) {
      getAssignedByMe(user.email);
    }
  }, [user, getAssignedByMe]); // Added getAssignedByMe to dependency array

  // Filtering and sorting
  useEffect(() => {
    if (!Array.isArray(tasks)) return;

    let filtered = [...tasks]; // Create a mutable copy

    // Status Filter
    if (filterStatus === "Pending") {
      filtered = filtered.filter((task) => !task.completedDate);
    } else if (filterStatus === "Completed") {
      filtered = filtered.filter((task) => task.completedDate);
    }

    // Search Filters
    if (searchTask.trim()) {
      const words = searchTask.toLowerCase().split(" ");
      filtered = filtered.filter((task) =>
        words.every((word) => task?.task?.toLowerCase().includes(word))
      );
    }

    if (searchEmail.trim()) {
      const words = searchEmail.toLowerCase().split(" ");
      filtered = filtered.filter((task) =>
        words.every((word) =>
          (task?.assignedTo || "").toLowerCase().includes(word)
        )
      );
    }

    // Date Filter
    if (selectedDate) {
      filtered = filtered.filter(
        (task) =>
          new Date(task?.dueDate).toDateString() === selectedDate.toDateString()
      );
    }

    // Sorting (still applied internally, but dropdown is removed)
    if (sortBy === "name") {
      filtered.sort((a, b) => a?.task?.localeCompare(b?.task));
    } else if (sortBy === "email") {
      filtered.sort((a, b) =>
        (a?.assignedTo || "").localeCompare(b?.assignedTo || "")
      );
    } else if (sortBy === "frequency") {
      filtered.sort((a, b) =>
        (a?.taskFrequency || "").localeCompare(b?.taskFrequency || "")
      );
    } else if (sortBy === "dueDate") {
      filtered.sort((a, b) => new Date(a?.dueDate) - new Date(b?.dueDate));
    }

    setAssignedTasks(filtered);
  }, [tasks, sortBy, searchTask, searchEmail, selectedDate, filterStatus]); // Added filterStatus to dependencies

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200"
    >
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-md">
        <span className="text-blue-600">📤</span> Tasks You've Assigned
      </h2>

      {/* Filter Controls */}
      <div className="flex flex-wrap justify-center md:justify-between gap-4 mb-8">
        {/* New Status Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200"
        >
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer appearance-none pr-6" // pr-6 for space for potential custom arrow
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          {/* You can add a custom dropdown icon here if desired, like FaChevronDown */}
        </motion.div>

        {/* Search Task */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200"
        >
          <FaSearch className="text-xl text-blue-500" />
          <input
            type="text"
            placeholder="Search Task"
            value={searchTask}
            onChange={(e) => setSearchTask(e.target.value)}
            className="bg-transparent outline-none placeholder-gray-400 text-gray-700"
          />
        </motion.div>

        {/* Search Assigned Email */}
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

        {/* Filter by Due Date */}
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
            dateFormat="PPP" // Nicer date format
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

      {/* Display Tasks */}
      {assignedTasks.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-gray-600 text-lg font-medium py-10"
        >
          You haven’t assigned any tasks yet or no tasks match your filters.
        </motion.p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedTasks.map((task, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)", // Blue glow
                transition: { duration: 0.2 },
              }}
              className="relative p-6 rounded-2xl bg-white shadow-lg border border-blue-100 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <p className="text-xl font-bold mb-1 text-gray-800">
                  {task.task}
                </p>
                <p className="text-sm text-gray-600 mb-0.5">
                  <span className="font-semibold">Assigned To:</span>{" "}
                  {task.assignedName || task.assignedTo}
                </p>
                <p className="text-sm text-gray-600 mb-0.5">
                  <span className="font-semibold">Due:</span>{" "}
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-600 mb-0.5">
                  <span className="font-semibold">Priority:</span>{" "}
                  <span
                    className={`${
                      task.priority === "High"
                        ? "text-red-500"
                        : task.priority === "Medium"
                        ? "text-orange-500"
                        : "text-green-500"
                    } font-medium`}
                  >
                    {task.priority}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Frequency:</span>{" "}
                  {task.taskFrequency}
                </p>
                <p className="text-sm text-gray-700 font-semibold flex items-center">
                  Status:{" "}
                  {task.completedDate ? (
                    <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center">
                      <FaCheckCircle className="w-3 h-3 mr-1" /> {/* Icon added */}
                      Completed
                    </span>
                  ) : (
                    <span className="ml-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center">
                      <FaHourglassHalf className="w-3 h-3 mr-1" /> {/* Icon added */}
                      Pending
                    </span>
                  )}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default AssignedTasks;