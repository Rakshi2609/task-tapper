import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase"; // Your Firebase config
import { toast } from "react-toastify";
import { useAuthStore } from "../assests/store"; // Your Zustand store

const Login = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const { login, user } = useAuthStore(); // optional: pull user for logging

  const handleGoogleSignUp = async () => {
    try {
      // Step 1: Sign in with Google popup
      await signInWithPopup(auth, googleProvider);

      const email = auth.currentUser?.email;
      const displayName = auth.currentUser?.displayName;

      if (!email) {
        toast.error("Google email not found");
        return;
      }

      console.log("📤 Sending email to backend:", email);

      // Step 2: Call backend login via Zustand
      await login(email);

      console.log("✅ User from Zustand:", user); // optional log

      navigate("/");
      toast.success(`Welcome ${displayName || "User"}!`);
      
      // Step 3: Navigate after successful login
      console.log("🔁 Navigating to /home");
    } catch (error) {
      toast.error("Google Sign-In failed: " + error.message);
      console.error("❌ Google Login Error:", error);
    }
  };

  return (
    <div className="relative h-[91vh] overflow-hidden">
      

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0d1b2a]/80 to-[#1b263b]/90 z-0"></div>

      <div className="relative z-10 flex justify-center items-center h-full">
        <button
          onClick={handleGoogleSignUp}
          className="w-[70vh] mt-2.5 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition transform hover:scale-105"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
