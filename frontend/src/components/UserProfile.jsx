import React, { useEffect, useState } from "react";
import { useAuthStore } from "../assests/store";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const UserProfile = () => {
  const { user, isAuthenticated, tasks, getUserTasks } = useAuthStore();
  const [todayTasks, setTodayTasks] = useState([]);

  useEffect(() => {
    if (user?.email) getUserTasks(user.email);
  }, [user]);

  useEffect(() => {
    if (!tasks) return;
    const today = new Date().toDateString();
    const filtered = tasks.filter(
      (task) =>
        new Date(task.dueDate).toDateString() === today &&
        !task.completedDate
    );
    setTodayTasks(filtered);
  }, [tasks]);

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center mt-10 text-red-600 font-semibold">
        User not logged in.
      </div>
    );
  }

  const taskStats = [
    { name: "Assigned", value: user.TasksAssigned || 0 },
    { name: "In Progress", value: user.TasksInProgress || 0 },
    { name: "Completed", value: user.TasksCompleted || 0 },
    { name: "Not Started", value: user.TasksNotStarted || 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">👤 User Dashboard</h2>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">User Details</h3>
          <div className="space-y-2 text-md text-gray-700">
            <p><strong>Name:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <Link to="/tasks" className="text-blue-600 hover:underline text-sm">View All Tasks</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Task Stats</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskStats}>
              <XAxis dataKey="name" stroke="#555" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">📅 Today's Due Tasks</h3>
        {todayTasks.length === 0 ? (
          <p className="text-gray-500">No tasks due today.</p>
        ) : (
          <ul className="space-y-4">
            {todayTasks.map((task, index) => (
              <li key={index} className="border p-4 rounded shadow bg-gray-50">
                <p className="text-md font-medium text-gray-800">{task.task}</p>
                <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                <p className="text-sm text-gray-600">Frequency: {task.taskFrequency}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
