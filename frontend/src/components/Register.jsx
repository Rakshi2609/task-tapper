import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider  } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { toast } from 'react-toastify';
import { useAuthStore } from "../assests/store";

const Register = () => {
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [name, setName] = useState("");
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("User signed up with Google:", auth.currentUser.displayName);
      await signup(auth.currentUser.email, auth.currentUser.displayName);
      console.log("User signed up with Google:", auth.currentUser.displayName);
    toast.success("Google Sign-Up successful!");
      navigate("/profile");
    } catch (error) {
      toast.error("Google Sign-Up failed: " + error.message);
    }
  };

  return (
    <div className="relative h-[91vh] overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0d1b2a]/80 to-[#1b263b]/90 z-0"></div>

      <div className="relative z-10 flex flex-col justify-center items-center h-screen">
          <button
            onClick={handleGoogleSignUp}
            className="w-[70vh] mt-2.5 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition transform hover:scale-105"
          >
            SignUp with Google
          </button>
      </div>
    </div>
  );
};

export default Register;