import React, { useMemo, useState } from "react";
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
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

// Contract:
// props: { isOpen: boolean, onClose?: () => void }
// Renders a responsive side navigation. On mobile, it overlays and can be closed.
const SideNavbar = ({ isOpen, onClose }) => {
  const [openGroups, setOpenGroups] = useState({
    0: true, // Overview open by default
    1: true, // Tasks open by default
    2: true, // Communication open by default
  });

  const toggleGroup = (index) => {
    setOpenGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const linkBaseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors";
  const activeClasses = "bg-blue-100 text-blue-700";

  const navGroups = useMemo(
    () => [
      {
        title: "Overview",
        links: [
          { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
        ]
      },
      {
        title: "Tasks",
        links: [
          { to: "/tasks", label: "One-Time Tasks", icon: <FaClipboardList /> },
          { to: "/recurring/list", label: "Recurring Tasks", icon: <FaSyncAlt /> },
          { to: "/mywork", label: "Assigned by Me", icon: <FaTasks /> },
        ]
      },
      {
        title: "Communication",
        links: [
          { to: "/chat", label: "World Chat", icon: <FaComments /> },
        ]
      },
    ],
    []
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity z-30 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar - Overlay Mode */}
      <aside
        className={`bg-white border-r border-gray-200 w-72
          fixed top-16 left-0 z-40 overflow-y-auto custom-scrollbar
          h-[calc(100vh-4rem)]
          transition-transform duration-300 ease-in-out
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-800">Navigation</span>
          {onClose && (
            <button
              className="inline-flex items-center px-2 py-1 text-sm rounded hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        <nav className="p-3 space-y-2">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="border-b border-gray-100 pb-2">
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="uppercase tracking-wider">{group.title}</span>
                {openGroups[groupIndex] ? (
                  <FaChevronDown className="text-gray-400 text-xs" />
                ) : (
                  <FaChevronRight className="text-gray-400 text-xs" />
                )}
              </button>
              {openGroups[groupIndex] && (
                <div className="mt-1 space-y-1">
                  {group.links.map(({ to, label, icon }) => (
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
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideNavbar;
