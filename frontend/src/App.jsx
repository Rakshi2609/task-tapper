import React from "react";
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
import WorldChat from "./components/WorldChat";
import { useAuthStore } from "./assests/store";

const App = () => {
  const user = useAuthStore((state) => state.user); 
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/tasks" element={<UserTasks />} />
        <Route path="/assign" element={<AssignTask />} />
        <Route path="/create" element={<CreateTaskForm />} />
        <Route path="/mywork" element={<AssignedTasks />} />
        <Route path="/chat" element={user ? <WorldChat user={user} /> : <Navigate to="/login" />} />


        {/* Fallback Route */}
        <Route
          path="*"
          element={<h1 className="text-center mt-10 text-red-600">404 - Page Not Found</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
