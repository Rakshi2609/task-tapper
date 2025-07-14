import React from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import { useAuthStore } from "../assests/store";

const Login = () => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const { login, user } = useAuthStore();

  const handleGoogleSignUp = async () => {
    try {
      console.log("🔐 Initiating Google sign-in...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Firebase sign-in successful");

      const currentUser = auth.currentUser;
      console.log("👤 Firebase user:", currentUser);

      const email = currentUser?.email;
      const displayName = currentUser?.displayName;

      if (!email) {
        console.error("❌ No email found from Firebase user.");
        toast.error("Google email not found");
        return;
      }

      console.log("📤 Sending email to backend login API:", email);
      const loginSuccess = await login(email);
      if (!loginSuccess) {
        useAuthStore.setState({ user: null });
        await signOut(auth);
        toast.error("Login failed. Please try again.");
        return;
      }

      console.log("✅ Zustand login success, user stored:", user);
      toast.success(`Welcome ${displayName || "User"}!`);
      navigate("/");
    } catch (error) {
      console.error("❌ Google Sign-In failed:", error);
      toast.error("Google Sign-In failed: " + error.message);

      // Fail-safe logout
      try {
        await signOut(auth);
        console.log("🧹 Firebase logout after failure.");
      } catch (logoutErr) {
        console.error("❌ Error logging out from Firebase:", logoutErr);
      }

      useAuthStore.setState({ user: null });
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
