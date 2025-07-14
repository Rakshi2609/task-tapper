import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import {
  FaBars,
  FaTimes,
  FaHome,
  FaPlusCircle,
  FaClipboardList,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaComments, // Icon for Chat
  FaTasks // Icon for View Tasks (if needed, currently using FaClipboardList)
} from 'react-icons/fa';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setMenuOpen(false); // Close menu on logout
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Framer Motion variants for mobile menu
  const menuVariants = {
    hidden: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Framer Motion variants for button hover/tap effects
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 4px 15px rgba(59, 130, 246, 0.3)', // Subtle blue glow
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const navLinkClasses = 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 hover:shadow-md';
  const mobileLinkClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 w-full text-left bg-blue-700 hover:bg-blue-600 hover:shadow-md';


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
            <FaTasks /> {/* Using FaTasks for a task-related logo */}
          </motion.div>
          <div className="text-2xl font-extrabold text-white tracking-wide">
            TaskEase
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden lg:inline text-blue-200 text-sm font-light">Welcome, {user.displayName || user.email?.split('@')[0]}</span>
             
              <Link to="/create" className={navLinkClasses}>
                <FaPlusCircle /> Create Task
              </Link>
              <Link to="/tasks" className={navLinkClasses}>
                <FaClipboardList /> My Tasks

              </Link>
              <Link to="/chat" className={navLinkClasses}>
                <FaComments /> Chat
              </Link>
              <Link to="/profile" className={navLinkClasses}>
                <FaUserCircle /> Profile
              </Link>
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-red-700 hover:shadow-md"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaSignOutAlt /> Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/login">
                <motion.button
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 hover:shadow-md"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaSignInAlt /> Login
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  className="flex items-center gap-2 border border-blue-300 text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-800 hover:text-white hover:shadow-md"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaUserPlus /> Sign Up
                </motion.button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-2xl p-2 rounded-md hover:bg-blue-800 transition-colors duration-200">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Nav Dropdown with Framer Motion */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden mt-3 space-y-2 flex flex-col items-start px-4 py-4 bg-blue-800 rounded-b-lg shadow-lg absolute w-full left-0"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {user ? (
              <>
                <span className="text-blue-200 text-sm font-light mb-2">Welcome, {user.displayName || user.email?.split('@')[0]}</span>
                
                <Link to="/create" onClick={toggleMenu} className={mobileLinkClasses}>
                  <FaPlusCircle /> Create Task
                </Link>
                <Link to="/tasks" onClick={toggleMenu} className={mobileLinkClasses}>
                  <FaClipboardList /> My Tasks

                </Link>
                <Link to="/chat" onClick={toggleMenu} className={mobileLinkClasses}>
                  <FaComments /> Chat
                </Link>
                <Link to="/profile" onClick={toggleMenu} className={mobileLinkClasses}>
                  <FaUserCircle /> Profile
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 w-full text-left hover:bg-red-700 hover:shadow-md"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaSignOutAlt /> Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={toggleMenu} className={mobileLinkClasses}>
                  <FaSignInAlt /> Login
                </Link>
                <Link to="/signup" onClick={toggleMenu} className={mobileLinkClasses}>
                  <FaUserPlus /> Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;