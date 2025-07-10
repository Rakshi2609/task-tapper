import React, { useEffect, useState } from "react";
import { useAuthStore } from "../assests/store";
import { FaSort, FaSearch, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AssignedTasks = () => {
  const { user, tasks, getAssignedByMe } = useAuthStore();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [sortBy, setSortBy] = useState("none");
  const [searchTask, setSearchTask] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch tasks assigned by the current user
  useEffect(() => {
    if (user?.email) {
      getAssignedByMe(user.email);
    }
  }, [user]);

  // Filtering and sorting
  useEffect(() => {
    if (!Array.isArray(tasks)) return;

    let filtered = tasks;

    if (searchTask.trim()) {
      const words = searchTask.toLowerCase().split(" ");
      filtered = filtered.filter(task =>
        words.every(word => task?.task?.toLowerCase().includes(word))
      );
    }

    if (searchEmail.trim()) {
      const words = searchEmail.toLowerCase().split(" ");
      filtered = filtered.filter(task =>
        words.every(word => (task?.assignedTo || "").toLowerCase().includes(word))
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(task =>
        new Date(task?.dueDate).toDateString() === selectedDate.toDateString()
      );
    }

    if (sortBy === "name") {
      filtered.sort((a, b) => a?.task?.localeCompare(b?.task));
    } else if (sortBy === "email") {
      filtered.sort((a, b) => (a?.assignedTo || "").localeCompare(b?.assignedTo || ""));
    } else if (sortBy === "frequency") {
      filtered.sort((a, b) => (a?.taskFrequency || "").localeCompare(b?.taskFrequency || ""));
    } else if (sortBy === "dueDate") {
      filtered.sort((a, b) => new Date(a?.dueDate) - new Date(b?.dueDate));
    }

    setAssignedTasks(filtered);
  }, [tasks, sortBy, searchTask, searchEmail, selectedDate]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        📤 Tasks You've Assigned
      </h2>

      {/* Filter Controls */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FaSort className="text-xl text-gray-600" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-1 shadow focus:outline-none"
          >
            <option value="none">Sort: None</option>
            <option value="name">Task Name</option>
            <option value="email">Assigned Email</option>
            <option value="frequency">Frequency</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <FaSearch className="text-xl text-gray-600" />
          <input
            type="text"
            placeholder="Search Task"
            value={searchTask}
            onChange={(e) => setSearchTask(e.target.value)}
            className="border px-3 py-1 rounded shadow"
          />
        </div>

        <div className="flex items-center gap-2">
          <FaSearch className="text-xl text-gray-600" />
          <input
            type="text"
            placeholder="Search Assigned Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="border px-3 py-1 rounded shadow"
          />
        </div>

        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-xl text-gray-600" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Filter by Due Date"
            className="border px-3 py-1 rounded shadow"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-red-500 underline text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Display Tasks */}
      {assignedTasks.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t assigned any tasks yet.</p>
      ) : (
        <ul className="space-y-4">
          {assignedTasks.map((task, index) => (
            <li key={index} className="border p-4 rounded shadow bg-gray-50">
              <p className="text-md font-semibold text-gray-800">{task.task}</p>
              <p className="text-sm text-gray-600">Assigned To: {task.assignedName || task.assignedTo}</p>
              <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Priority: {task.priority}</p>
              <p className="text-sm text-gray-600">Frequency: {task.taskFrequency}</p>
              <p className="text-sm text-gray-600">
                Status: {task.completedDate ? (
                  <span className="text-green-600 font-medium">✅ Completed</span>
                ) : (
                  <span className="text-yellow-600 font-medium">🕒 Pending</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignedTasks;
