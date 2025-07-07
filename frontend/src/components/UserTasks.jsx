import React, { useEffect, useState } from "react";
import { useAuthStore } from "../assests/store";
import {
  completeTask as completeTaskAPI,
} from "../services/taskService";
import { FaSort, FaCalendarAlt, FaCheck } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

const UserTasks = () => {
  const {
    user,
    tasks,
    isLoading,
    error,
    getUserTasks,
  } = useAuthStore();
  const { getUserProfile } = useAuthStore();

  const [sortBy, setSortBy] = useState("none");
  const [selectedDate, setSelectedDate] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  const handleComplete = async (taskId) => {
    if (!user?.email) return;
    try {
      await completeTaskAPI(taskId, user.email);
      toast.success("✅ Task marked as completed!");
      getUserTasks(user.email);
      getUserProfile(user.email);
    } catch (e) {
      toast.error("❌ Could not complete task: " + (e.response?.data?.message || e.message));
    }
  };

  useEffect(() => {
    if (user?.email) getUserTasks(user.email);
  }, [user]);

  useEffect(() => {
    if (!tasks) return;

    let sorted = [...tasks];

    if (selectedDate) {
      sorted = sorted.filter((task) =>
        new Date(task.dueDate).toDateString() === selectedDate.toDateString()
      );
    }

    if (sortBy === "dueDate") {
      sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if(sortBy === "daily"){
      sorted = sorted.filter(task => task.taskFrequency === "Daily");
    } else if(sortBy === "monthly"){
      
      sorted = sorted.filter(task => task.taskFrequency === "Monthly");
    } else if(sortBy === "weekly"){
      
      sorted = sorted.filter(task => task.taskFrequency === "Weekly");
    }else if (sortBy === "priority") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sorted.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
    } else if (sortBy === "all") {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      sorted.sort((a, b) => {
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      });
    }

    setPendingTasks(sorted.filter(task => !task.completedDate));
    setCompletedTasks(sorted.filter(task => task.completedDate));
  }, [tasks, sortBy, selectedDate]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">📝 Your Tasks</h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <FaSort className="text-xl text-gray-600" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-1 shadow focus:outline-none"
          >
            <option value="none">Sort: None</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">Both</option>
          </select>
        </div>

        {/* Calendar Filter */}
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
              className="ml-2 text-red-500 underline text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading or Error */}
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Pending Tasks */}
          <h3 className="text-xl font-semibold mt-6 mb-2 text-green-600">🕒 Pending Tasks</h3>
          {pendingTasks.length === 0 ? (
            <p className="text-gray-600">No pending tasks.</p>
          ) : (
            <ul className="space-y-4">
              {pendingTasks.map((task, index) => (
                <li key={index} className="bg-white border-l-4 border-blue-500 p-4 rounded shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">{task.task}</p>
                      <p className="text-sm text-gray-600">📅 Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">🔥 Priority: <span className="font-bold">{task.priority}</span></p>
                      <p className="text-sm text-gray-600">🔁 Frequency: {task.taskFrequency}</p>
                    </div>
                    <button
                      onClick={() => handleComplete(task._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-1"
                    >
                      <FaCheck /> Complete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Completed Tasks */}
          <h3 className="text-xl font-semibold mt-8 mb-2 text-gray-600">✅ Completed Tasks</h3>
          {completedTasks.length === 0 ? (
            <p className="text-gray-500">No completed tasks.</p>
          ) : (
            <ul className="space-y-4">
              {completedTasks.map((task, index) => (
                <li key={index} className="bg-gray-100 border-l-4 border-green-500 p-4 rounded shadow-sm">
                  <div>
                    <p className="text-lg line-through font-medium text-gray-700">{task.task}</p>
                    <p className="text-sm text-gray-500">✔ Completed on: {new Date(task.completedDate).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default UserTasks;
