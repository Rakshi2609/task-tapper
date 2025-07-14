import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import { useAuthStore } from "../assests/store";

const Register = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const { signup } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      console.log("🔐 Starting Google Sign-Up...");
      await signInWithPopup(auth, googleProvider);

      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        toast.error("❌ Google email not found.");
        return;
      }

      const email = currentUser.email;
      const displayName = currentUser.displayName;

      console.log("📤 Sending signup to backend for:", email, displayName);

      const signupSuccess = await signup(email, displayName); // Zustand call

      if (!signupSuccess) {
        console.warn("🚫 Zustand signup failed. Deleting Firebase user.");
        useAuthStore.setState({ user: null });

        try {
          await currentUser.delete(); // Delete Firebase Auth user
          console.log("🗑️ Firebase user deleted due to signup failure.");
        } catch (err) {
          console.error("❌ Failed to delete Firebase user:", err);
        }

        toast.error("Signup failed. Please try again.");
        return;
      }

      toast.success("🎉 Google Sign-Up successful!");
      navigate("/profile");
    } catch (error) {
      console.error("❌ Google Sign-Up error:", error.message);
      toast.error("Google Sign-Up failed: " + error.message);

      useAuthStore.setState({ user: null });

      try {
        if (auth.currentUser) {
          await auth.currentUser.delete();
          console.log("🗑️ Firebase user deleted due to network/backend error.");
        }
      } catch (err) {
        console.error("❌ Could not delete Firebase user:", err.message);
      }

      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-[91vh] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0d1b2a]/80 to-[#1b263b]/90 z-0"></div>

      <div className="relative z-10 flex flex-col justify-center items-center h-screen">
        <button
          disabled={loading}
          onClick={handleGoogleSignUp}
          className={`w-[70vh] mt-2.5 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white py-3 px-4 rounded-lg font-medium transition transform hover:scale-105`}
        >
          {loading ? "Signing you up..." : "Sign Up with Google"}
        </button>
      </div>
    </div>
  );
};

export default Register;
