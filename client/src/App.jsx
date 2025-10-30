import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";


import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/Register";
import AssignTask from "./components/AssignTask";
import CreateTaskForm from "./components/CreateTaskForm";
import Navbar from "./components/Navbar";
import UserProfile from "./components/UserProfile";
import UserTasks from "./components/UserTasks";
import AssignedTasks from "./components/AssignedTasks";
import TaskDetail from "./components/TaskDetail";
import WorldChat from "./components/WorldChat";
import { useAuthStore } from "./assests/store";
import CreateRecurringTask from "./components/RecurringTaskForm";
import RecurringTaskList from "./components/RecurringTaskList";
import RecurringTaskDetail from "./components/RecurringTaskDetail";
import SideNavbar from "./components/SideNavbar";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const user = useAuthStore((state) => state.user); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex relative">
        <SideNavbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 lg:ml-0 lg:pl-0">
          <div className="px-4 py-4">{/* content wrapper */}
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected routes */}
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><UserTasks /></ProtectedRoute>} />
              <Route path="/assign" element={<ProtectedRoute><AssignTask /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreateTaskForm /></ProtectedRoute>} />
              <Route path="/mywork" element={<ProtectedRoute><AssignedTasks /></ProtectedRoute>} />
              <Route path="/recurring/create" element={<ProtectedRoute><CreateRecurringTask /></ProtectedRoute>} />
              <Route path="/recurring/list" element={<ProtectedRoute><RecurringTaskList /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><WorldChat user={user} /></ProtectedRoute>} />
              <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
              <Route path="/recurring/tasks/:taskId" element={<ProtectedRoute><RecurringTaskDetail /></ProtectedRoute>} />

              {/* Fallback Route */}
              <Route
                path="*"
                element={<h1 className="text-center mt-10 text-red-600">404 - Page Not Found</h1>}
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
