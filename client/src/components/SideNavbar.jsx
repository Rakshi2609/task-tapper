import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaSyncAlt,
  FaTasks,
  FaRegCalendarPlus,
  FaRecycle,
  FaUserCircle,
  FaComments,
  FaUsers,
} from "react-icons/fa";

// Contract:
// props: { isOpen: boolean, onClose?: () => void }
// Renders a responsive side navigation. On mobile, it overlays and can be closed.
const SideNavbar = ({ isOpen, onClose }) => {
  const linkBaseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors";
  const activeClasses = "bg-blue-100 text-blue-700";

  const links = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
      { to: "/communities", label: "Communities", icon: <FaUsers /> },
      { to: "/tasks", label: "One-Time Tasks", icon: <FaClipboardList /> },
      { to: "/recurring/list", label: "Recurring Tasks", icon: <FaSyncAlt /> },
      { to: "/mywork", label: "Assigned by Me", icon: <FaTasks /> },
      { to: "/create", label: "Create One-Time", icon: <FaRegCalendarPlus /> },
      { to: "/recurring/create", label: "Create Recurring", icon: <FaRecycle /> },
      { to: "/chat", label: "World Chat", icon: <FaComments /> },
      { to: "/profile", label: "Profile", icon: <FaUserCircle /> },
    ],
    []
  );

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 bg-black/30 transition-opacity lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`bg-white ${isOpen ? "border-r border-gray-200" : "lg:border-0"} w-72
          fixed top-16 left-0 z-40 overflow-y-auto custom-scrollbar
          h-[calc(100vh-4rem)]
          transition-[transform,width] duration-200 ease-in-out
          ${isOpen ? "translate-x-0 lg:w-72" : "-translate-x-full lg:translate-x-0 lg:w-0"}`}
      >
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-800">Navigation</span>
          {onClose && (
            <button
              className="lg:hidden inline-flex items-center px-2 py-1 text-sm rounded hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="p-3 space-y-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${linkBaseClasses} ${isActive ? activeClasses : "text-gray-700"}`
              }
              onClick={onClose}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideNavbar;
