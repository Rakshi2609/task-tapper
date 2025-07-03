import React from "react";
import { useAuthStore } from "../assests/store";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center mt-10 text-red-600 font-semibold">
        User not logged in.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-center">👤 User Profile</h2>
      <div className="space-y-2 text-lg">
        <p><strong>Name:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Tasks Assigned:</strong> {user.TasksAssigned || 0}</p>
        <p><strong>Tasks In Progress:</strong> {user.TasksInProgress || 0}</p>
        <p><strong>Tasks Completed:</strong> {user.TasksCompleted || 0}</p>
        <p><strong>Tasks Not Started:</strong> {user.TasksNotStarted || 0}</p>
        <Link to="/tasks" className="text-blue-600 hover:underline">
          View Your Tasks
        </Link>
      </div>
    </div>
  );
};

export default UserProfile;
