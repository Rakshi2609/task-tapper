import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FaBars, FaTimes } from "react-icons/fa";

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
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-blue-700 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
        <div className="text-2xl font-bold">Task Manager</div>
</Link>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden lg:inline">Welcome, {user.displayName || user.email}</span>
              <Link to='/create' className='bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded'>
                Create Task
              </Link>
              <Link to="/profile" className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
                Login
              </Link>
              <Link to="/signup" className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-2xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-2 flex flex-col items-start px-4">
          {user ? (
            <>
              <span>Welcome, {user.displayName || user.email}</span>
              <Link to='/create' onClick={toggleMenu} className='bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded w-full'>
                Create Task
              </Link>
              <Link to="/profile" onClick={toggleMenu} className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded w-full">
                Profile
              </Link>
              <button
                onClick={() => { handleLogout(); toggleMenu(); }}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded w-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={toggleMenu} className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded w-full">
                Login
              </Link>
              <Link to="/signup" onClick={toggleMenu} className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded w-full">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
