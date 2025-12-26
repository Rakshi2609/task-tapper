import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { FaTasks, FaUserCircle, FaUsers, FaHome } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

const Navbar = ({ onMenuClick, isSidebarOpen = false, showMenu = false }) => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
      }
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
      }
    }
  };

  const navLinkClasses =
    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 hover:shadow-md";

  const mobileNavLinkClasses = 
    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 active:bg-blue-700 w-full text-left";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {showMenu && (
              <button
                className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-blue-800/40"
                onClick={onMenuClick}
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <IoClose className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
              </button>
            )}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.3 }}
                className="text-2xl sm:text-3xl text-blue-300 group-hover:text-white"
              >
                <FaTasks />
              </motion.div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                Donezo  
              </div>
            </Link>
          </div>

          {/* Desktop Nav - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <motion.button
                    className={`${navLinkClasses} bg-transparent`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FaHome /> Dashboard
                  </motion.button>
                </Link>
                
                <Link to="/communities">
                  <motion.button
                    className={`${navLinkClasses} bg-transparent`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FaUsers /> Communities
                  </motion.button>
                </Link>
                
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
              </>
            ) : (
              <>
                <Link to="/">
                  <motion.button
                    className={`${navLinkClasses} bg-transparent`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FaHome /> Home
                  </motion.button>
                </Link>
                
                <Link to="/login">
                  <motion.button
                    className="px-5 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Login
                  </motion.button>
                </Link>
                
                <Link to="/signup">
                  <motion.button
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-blue-800/40"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <IoClose className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-blue-800 border-t border-blue-700"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    <motion.button
                      className={mobileNavLinkClasses}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaHome className="text-xl" /> Dashboard
                    </motion.button>
                  </Link>
                  
                  <Link to="/communities" onClick={closeMobileMenu}>
                    <motion.button
                      className={mobileNavLinkClasses}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaUsers className="text-xl" /> Communities
                    </motion.button>
                  </Link>
                  
                  <Link to="/profile" onClick={closeMobileMenu}>
                    <motion.button
                      className={mobileNavLinkClasses}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaUserCircle className="text-xl" /> Profile
                    </motion.button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" onClick={closeMobileMenu}>
                    <motion.button
                      className={mobileNavLinkClasses}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaHome className="text-xl" /> Home
                    </motion.button>
                  </Link>
                  
                  <Link to="/login" onClick={closeMobileMenu}>
                    <motion.button
                      className="w-full px-4 py-3 bg-white text-blue-700 rounded-lg font-semibold active:bg-blue-50 transition"
                      whileTap={{ scale: 0.98 }}
                    >
                      Login
                    </motion.button>
                  </Link>
                  
                  <Link to="/signup" onClick={closeMobileMenu}>
                    <motion.button
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold active:bg-blue-400 transition"
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;