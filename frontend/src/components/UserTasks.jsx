import React, { useEffect } from "react";
import { useAuthStore } from "../assests/store";
import {
  acceptTask as acceptTaskAPI,
  completeTask as completeTaskAPI,
} from "../services/taskService";

const UserTasks = () => {
  const {
    user,
    tasks,
    isLoading,
    error,
    getUserTasks,
  } = useAuthStore();
  const {  getUserProfile } = useAuthStore(); // also include getUserProfile

const handleComplete = async (taskId) => {
  if (!user?.email) return;
  try {
    await completeTaskAPI(taskId, user.email);
    alert("✅ Task marked as completed!");
    getUserTasks(user.email);       // Refresh task list
    getUserProfile(user.email);     // 🔄 Refresh profile stats like TasksCompleted
  } catch (e) {
    alert("❌ Could not complete task: " + (e.response?.data?.message || e.message));
  }
};


  useEffect(() => {
    if (user?.email) getUserTasks(user.email);
  }, [user]);

  const handleAccept = async (taskId) => {
    if (!user?.email) return;
    try {
      await acceptTaskAPI(taskId, user.email);
      alert("✅ Task accepted!");
      getUserTasks(user.email); // Refresh
    } catch (e) {
      alert("❌ Could not accept task: " + (e.response?.data?.message || e.message));
    }
  };

  // const handleComplete = async (taskId) => {
  //   if (!user?.email) return;
  //   try {
  //     await completeTaskAPI(taskId, user.email);
  //     alert("✅ Task marked as completed!");
  //     getUserTasks(user.email); // Refresh
  //   } catch (e) {
  //     alert("❌ Could not complete task: " + (e.response?.data?.message || e.message));
  //   }
  // };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : tasks?.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task, index) => (
            <li key={index} className="border p-4 rounded bg-gray-100 shadow">
              <p><strong>Task:</strong> {task.task}</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
              <p><strong>Frequency:</strong> {task.taskFrequency}</p>

              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => handleAccept(task._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  🤝 Accept Task
                </button>
                <button
                  onClick={() => handleComplete(task._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  ✅ Mark as Complete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserTasks;
