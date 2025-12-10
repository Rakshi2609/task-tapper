import React, { useEffect, useState } from "react";
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
import Landing from "./components/Landing";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

import AllCommunity from "./components/community/AllCommunity";
import CommunityDepartments from "./components/community/CommunityDepartment";
import CommunityMembers from "./components/community/CommunityMembers";
import CommunityTeams from "./components/community/CommunityTeams";
import CreateCommunity from "./components/community/CreateCommunity";
import AddPeople from "./components/community/AddPeople";
import ApplyToJoinCommunity from "./components/community/ApplyToJoinCommunity";
import CreateCommunityTask from "./components/community/CreateCommunityTask";
import CreateCommunityRecurringTask from "./components/community/CreateCommunityRecurringTask";
import CreateCommunityDept from "./components/community/CreateCommunityDept";




const App = () => {
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setIsAuthed(!!u);
      if (!u) setSidebarOpen(false); // close sidebar on logout
    });
    return () => unsub();
  }, []);

  const mainOffsetClass = isAuthed && sidebarOpen ? "lg:ml-72" : "lg:ml-0";

  return (
    <BrowserRouter>
      <Navbar
        onMenuClick={() => setSidebarOpen((v) => !v)}
        isSidebarOpen={sidebarOpen}
        showMenu={isAuthed}
      />
      <div className={`relative ${mainOffsetClass}`}>
        {isAuthed && (
          <SideNavbar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="px-4 py-4">
            {/* content wrapper */}
            <Routes>
              {/* Public routes */}
              <Route
                path="/"
                element={
                  isAuthed ? <Navigate to="/profile" replace /> : <Landing />
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <UserTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assign"
                element={
                  <ProtectedRoute>
                    <AssignTask />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateTaskForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mywork"
                element={
                  <ProtectedRoute>
                    <AssignedTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recurring/create"
                element={
                  <ProtectedRoute>
                    <CreateRecurringTask />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recurring/list"
                element={
                  <ProtectedRoute>
                    <RecurringTaskList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <WorldChat user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/:taskId"
                element={
                  <ProtectedRoute>
                    <TaskDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recurring/tasks/:taskId"
                element={
                  <ProtectedRoute>
                    <RecurringTaskDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/communities" element={<AllCommunity />} />
              <Route
                path="/communities/:communityId/departments"
                element={<CommunityDepartments />}
              />
              <Route
                path="/communities/:communityId/members"
                element={<CommunityMembers />}
              />
              <Route
                path="/communities/:communityId/teams"
                element={<CommunityTeams />}
              />
              <Route path="/communities/create" element={<CreateCommunity />} />
              <Route
                path="/communities/:communityId/add-people"
                element={<AddPeople />}
              />
              <Route
                path="/communities/:communityId/apply"
                element={<ApplyToJoinCommunity />}
              />
              <Route
  path="/communities/:communityId/:communityDeptId/create-task"
  element={<CreateCommunityTask />}
  
/>
<Route
  path="/communities/:communityId/departments/:communityDeptId"
  element={<CommunityDepartments />}
/>
<Route
  path="/communities/:communityId/:communityDeptId/recurring/create"
  element={
      <CreateCommunityRecurringTask />
  }
/>

<Route
  path="/communities/:communityId/departments/create"
  element={<CreateCommunityDept />}
/>




              {/* Fallback Route */}
              <Route
                path="*"
                element={
                  <h1 className="text-center mt-10 text-red-600">
                    404 - Page Not Found
                  </h1>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
