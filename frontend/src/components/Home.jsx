// Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-200 to-indigo-50 text-gray-800 px-4">
      {user ? (
        <>
          <h1 className="text-4xl font-bold mb-4">
            Hi, Welcome {user.displayName || user.email.split("@")[0]} 👋
          </h1>
          <p className="text-lg mb-8 text-center max-w-xl">
            Ready to manage your day? You can create new tasks, track progress, and stay on top of your team's productivity.
          </p>
          <div className="flex gap-4">
            <Link to="/create">
              <button className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition">
                Create Task
              </button>
            </Link>
            <Link to="/tasks">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">
                View Tasks
              </button>
            </Link>
            <Link to="/profile">
              <button className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition">
                Profile
              </button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-4">Welcome to TaskEase</h1>
          <p className="text-lg mb-8 text-center max-w-xl">
            Manage your tasks effortlessly. Assign, track, and complete tasks with your team in real-time.
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="border border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl hover:bg-indigo-100 transition">
                Register
              </button>
            </Link>
          </div>
        </>
      )}

      <div className="mt-12 text-sm text-gray-500">
        Built with ❤️ for productivity-focused teams
      </div>
    </div>
  );
};

export default Home;
