import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { FaTasks, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 4px 15px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const navLinkClasses =
    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 hover:shadow-md";

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-3 shadow-xl relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
            className="text-3xl text-blue-300 group-hover:text-white"
          >
            <FaTasks />
          </motion.div>
          <div className="text-2xl font-extrabold text-white tracking-wide">
            Donezo  
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="flex items-center space-x-4">
          {user && (
            <Link to="/profile">
              <motion.button
                className={`${navLinkClasses} bg-transparent`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaUserCircle /> Profile
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;