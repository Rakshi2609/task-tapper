import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../assests/store"; // Assuming this path is correct
import { getAllEmails, getUserProfile } from "../services/taskService"; // Added getUserProfile for auto-fill names
import { createRecurringTask } from '../services/rexurring'; // Corrected service import name
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaUser, FaCalendarAlt, FaStar, FaClock, FaTimesCircle, FaChevronDown, FaAlignLeft } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { Link } from "react-router-dom";

const RecurringTaskForm = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    taskName: '',
    taskDescription: '',
    taskFrequency: '',
    taskCreateDaysAhead: 1,
    taskStartDate: '',
    taskEndDate: '',
    taskAssignedBy: user?.email || '',
    taskAssignedTo: '',
    createdBy: user?.email || "",
  });

  const [allEmails, setAllEmails] = useState([]);
  const [filteredAssignedByEmails, setFilteredAssignedByEmails] = useState([]);
  const [filteredAssignedToEmails, setFilteredAssignedToEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [taskAssignedByName, setTaskAssignedByName] = useState("");
  const [taskAssignedToName, setTaskAssignedToName] = useState("");

  // States for dropdown visibility
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showAssignedByEmailSuggestions, setShowAssignedByEmailSuggestions] = useState(false);
  const [showAssignedToEmailSuggestions, setShowAssignedToEmailSuggestions] = useState(false);

  // Refs for click-outside detection
  const frequencyDropdownRef = useRef(null);
  const assignedByEmailInputRef = useRef(null);
  const assignedToEmailInputRef = useRef(null);

  // Options for Frequency
  const frequencyOptions = [
    { value: "Daily", label: "🕓 Daily" },
    { value: "Weekly", label: "📆 Weekly" },
    { value: "Monthly", label: "🗓️ Monthly" },
  ];

  // 🔁 Fetch emails on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emails = await getAllEmails();
        const sorted = emails.filter((e) => e !== user?.email);
        if (user?.email) sorted.unshift(user.email);
        setAllEmails(sorted);
      } catch (err) {
        console.error("Error fetching emails:", err);
        toast.error("Could not load email list. Please try again later.");
      } finally {
        setLoadingEmails(false);
      }
    };

    fetchEmails();
  }, [user?.email]);

  // Update createdBy when user changes
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      createdBy: user?.email || "",
      taskAssignedBy: user?.email || '',
    }));
  }, [user?.email]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (frequencyDropdownRef.current && !frequencyDropdownRef.current.contains(event.target)) {
        setShowFrequencyDropdown(false);
      }
      if (assignedByEmailInputRef.current && !assignedByEmailInputRef.current.contains(event.target)) {
        setShowAssignedByEmailSuggestions(false);
      }
      if (assignedToEmailInputRef.current && !assignedToEmailInputRef.current.contains(event.target)) {
        setShowAssignedToEmailSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Email Dropdown Logic ---
  const handleEmailInput = (e, fieldName) => {
    const input = e.target.value;
    setFormData({ ...formData, [fieldName]: input });

    if (input.length > 0) {
      const suggestions = allEmails.filter((email) =>
        email.toLowerCase().includes(input.toLowerCase())
      );
      if (fieldName === "taskAssignedBy") {
        setFilteredAssignedByEmails(suggestions);
        setShowAssignedByEmailSuggestions(true);
      } else if (fieldName === "taskAssignedTo") {
        setFilteredAssignedToEmails(suggestions);
        setShowAssignedToEmailSuggestions(true);
      }
    } else {
      if (fieldName === "taskAssignedBy") {
        setFilteredAssignedByEmails(allEmails);
        setShowAssignedByEmailSuggestions(true);
      } else if (fieldName === "taskAssignedTo") {
        setFilteredAssignedToEmails(allEmails);
        setShowAssignedToEmailSuggestions(true);
      }
    }
  };

  const handleSelectEmail = async (email, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: email }));
    if (fieldName === "taskAssignedBy") {
      setFilteredAssignedByEmails([]);
      setShowAssignedByEmailSuggestions(false);
    } else if (fieldName === "taskAssignedTo") {
      setFilteredAssignedToEmails([]);
      setShowAssignedToEmailSuggestions(false);
    }
    try {
      const profile = await getUserProfile(email);
      const name = profile?.user?.username || email.split('@')[0];
      if (fieldName === 'taskAssignedBy') setTaskAssignedByName(name || "");
      if (fieldName === 'taskAssignedTo') setTaskAssignedToName(name || "");
    } catch (err) {
      console.warn('Could not fetch profile for', email, err.message);
    }
  };

  // --- Generic Change Handler for Inputs (not custom dropdowns) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Custom Dropdown Handlers (Frequency) ---
  const handleSelectDropdownItem = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (name === "taskFrequency") setShowFrequencyDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.taskName || !formData.taskDescription || !formData.taskFrequency || !formData.taskStartDate || !user?.email || !formData.taskAssignedTo) {
      toast.error("All fields are required. Please fill them out.");
      return;
    }

    if (formData.taskEndDate && formData.taskEndDate < formData.taskStartDate) {
      toast.error("End date cannot be before start date.");
      return;
    }

    try {
      const payload = {
        ...formData,
        taskAssignedBy: user?.email || '',
        createdBy: user?.email || '',
      };
      await createRecurringTask(payload);
      toast.success("✅ Recurring task created successfully!");
      setFormData({
        taskName: '',
        taskDescription: '',
        taskFrequency: '',
        taskCreateDaysAhead: 1,
        taskStartDate: '',
        taskEndDate: '',
        taskAssignedBy: user?.email || '',
        taskAssignedTo: '',
        createdBy: user?.email || "",
      });
      setFilteredAssignedByEmails([]);
      setFilteredAssignedToEmails([]);
      setShowAssignedByEmailSuggestions(false);
      setShowAssignedToEmailSuggestions(false);
    } catch (error) {
      console.error("Error creating recurring task:", error);
      if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`);
      } else {
        toast.error("❌ Failed to create recurring task. Please try again.");
      }
    }
  };

  // Variants for Framer Motion animations
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const inputVariants = {
    rest: { boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
    hover: { boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.3)" },
    focus: { boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.5)", borderColor: "#3B82F6" }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.95, originY: 0 },
    visible: { opacity: 1, y: 0, scaleY: 1, originY: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, scaleY: 0.95, originY: 0, transition: { duration: 0.15, ease: "easeIn" } }
  };

  // Helper to get display label for selected dropdown value
  const getDisplayLabel = (value, options, placeholder) => {
    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl border border-blue-200 space-y-6 mt-10"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <Toaster />

      <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-900 drop-shadow-md">
        <span className="text-blue-600">🔄</span> Create Recurring Task
      </h2>

      {/* Task Name */}
      <div className="space-y-2"> {/* Added div for label-input grouping */}
        <label htmlFor="taskName" className="block text-gray-700 font-semibold text-sm">Task Name:</label>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaPaperPlane className="text-blue-500 ml-4 mr-2" />
          <input
            id="taskName" // Added id
            name="taskName"
            placeholder="e.g., Daily Stand-up Meeting, Weekly Report"
            value={formData.taskName}
            onChange={handleChange}
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            required
            title="Enter a concise name for your recurring task."
          />
        </motion.div>
      </div>

      {/* Task Description */}
      <div className="space-y-2">
        <label htmlFor="taskDescription" className="block text-gray-700 font-semibold text-sm">Task Description:</label>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaAlignLeft className="text-blue-500 ml-4 mr-2" />
          <input
            id="taskDescription" // Added id
            name="taskDescription"
            placeholder="e.g., Discuss project progress, Submit sales figures"
            value={formData.taskDescription}
            onChange={handleChange}
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            title="Provide a detailed description of what this recurring task involves."
          />
        </motion.div>
      </div>

      {/* Task Frequency (Custom Dropdown) */}
      <div className="space-y-2 relative" ref={frequencyDropdownRef}>
        <label htmlFor="taskFrequency" className="block text-gray-700 font-semibold text-sm">Task Frequency:</label>
        <motion.div
          id="taskFrequency" // Added id for label association
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200 cursor-pointer"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
          onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
          title="Select how often this task should recur (Daily, Weekly, Monthly)."
        >
          <FaClock className="text-blue-500 ml-4 mr-2" />
          <div className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-700 font-medium">
            {getDisplayLabel(formData.taskFrequency, frequencyOptions, "📅 Select Frequency")}
          </div>
          <FaChevronDown className={`absolute right-4 text-blue-500 transition-transform duration-200 ${showFrequencyDropdown ? 'rotate-180' : ''}`} />
        </motion.div>
        <AnimatePresence>
          {showFrequencyDropdown && (
            <motion.ul
              className="absolute bg-white border border-blue-200 w-full z-20 max-h-48 overflow-y-auto shadow-lg rounded-b-xl mt-1 custom-scrollbar"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {loadingEmails ? (
                <li className="px-4 py-2 text-gray-500 text-center">Loading frequencies...</li>
              ) : frequencyOptions.map((option, idx) => (
                <motion.li
                  key={idx}
                  onClick={() => handleSelectDropdownItem("taskFrequency", option.value)}
                  className={`px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors duration-200 text-gray-700 ${
                    formData.taskFrequency === option.value ? "font-bold text-blue-600 bg-blue-50" : ""
                  }`}
                  whileHover={{ scale: 1.01, backgroundColor: "#E0F2FE" }}
                  transition={{ duration: 0.1 }}
                >
                  {option.label}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Task Create Days Ahead: removed from UI; default kept in state */}

      {/* Task Start Date */}
      <div className="space-y-2">
        <label htmlFor="taskStartDate" className="block text-gray-700 font-semibold text-sm">Start Date:</label>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaCalendarAlt className="text-blue-500 ml-4 mr-2" />
          <input
            id="taskStartDate" // Added id
            type="date"
            name="taskStartDate"
            value={formData.taskStartDate}
            onChange={handleChange}
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 cursor-pointer"
            required
            title="Select the date from which this recurring task should begin."
          />
        </motion.div>
      </div>

      {/* Task End Date (Optional) */}
      <div className="space-y-2">
        <label htmlFor="taskEndDate" className="block text-gray-700 font-semibold text-sm">End Date (Optional):</label>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaCalendarAlt className="text-blue-500 ml-4 mr-2" />
          <input
            id="taskEndDate" // Added id
            type="date"
            name="taskEndDate"
            value={formData.taskEndDate}
            onChange={handleChange}
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 cursor-pointer"
            placeholder="Task End Date (Optional)"
            title="Optionally select a date when this recurring task should stop being generated."
          />
        </motion.div>
      </div>

      {/* Task Assigned By (Email - locked to current user) */}
      <div className="space-y-2 relative" ref={assignedByEmailInputRef}>
        <label htmlFor="taskAssignedBy" className="block text-gray-700 font-semibold text-sm">Assigned By Email:</label>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaUser className="text-blue-500 ml-4 mr-2" />
          <input
            id="taskAssignedBy"
            name="taskAssignedBy"
            value={formData.taskAssignedBy}
            readOnly
            disabled
            placeholder="Your email (auto)"
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            required
            autoComplete="off"
            title="Assigned by is automatically set to your account."
          />
          {/* Clear/suggestions removed since field is locked */}
        </motion.div>
      </div>

      {/* Task Assigned To (Email dropdown) */}
      <div className="space-y-2 relative" ref={assignedToEmailInputRef}>
        <label htmlFor="taskAssignedTo" className="block text-gray-700 font-semibold text-sm">Assigned To Email:</label>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaUser className="text-blue-500 ml-4 mr-2" />
          <input
            id="taskAssignedTo" // Added id
            name="taskAssignedTo"
            value={formData.taskAssignedTo}
            onChange={(e) => handleEmailInput(e, "taskAssignedTo")}
            onFocus={() => {
                if (formData.taskAssignedTo.length === 0 && allEmails.length > 0 && !loadingEmails) {
                    setFilteredAssignedToEmails(allEmails);
                }
                setShowAssignedToEmailSuggestions(true);
            }}
            placeholder="e.g., assignee.email@example.com (Who will perform this task?)"
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            required
            autoComplete="off"
            title="Enter or select the email of the person responsible for completing this recurring task."
          />
          {formData.taskAssignedTo && (
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, taskAssignedTo: "" });
                setFilteredAssignedToEmails([]);
                setShowAssignedToEmailSuggestions(false);
                setTaskAssignedToName("");
              }}
              className="mr-3 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear email"
            >
              <FaTimesCircle />
            </button>
          )}
        </motion.div>
        {taskAssignedToName && (
          <p className="text-xs text-gray-600 mt-1 ml-1 italic">Name: <span className="font-medium">{taskAssignedToName}</span></p>
        )}
        <AnimatePresence>
          {showAssignedToEmailSuggestions && (
            <motion.ul
              className="absolute bg-white border border-blue-200 w-full z-20 max-h-48 overflow-y-auto shadow-lg rounded-b-xl mt-1 custom-scrollbar"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {loadingEmails ? (
                <li className="px-4 py-2 text-gray-500 text-center">Loading emails...</li>
              ) : filteredAssignedToEmails.length > 0 ? (
                filteredAssignedToEmails.map((email, idx) => (
                  <motion.li
                    key={idx}
                    onClick={() => handleSelectEmail(email, "taskAssignedTo")}
                    className={`px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors duration-200 text-gray-700 ${
                      email === user?.email ? "font-bold text-blue-600 bg-blue-50" : ""
                    }`}
                    whileHover={{ scale: 1.01, backgroundColor: "#E0F2FE" }}
                    transition={{ duration: 0.1 }}
                  >
                    {email} {email === user?.email && <span className="text-blue-500 font-normal text-xs">(You)</span>}
                  </motion.li>
                ))
              ) : (
                <li className="px-4 py-3 text-gray-500 text-center">No matching emails found.</li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Created By: removed from UI; still included in payload via state */}

      <motion.button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300"
        whileTap={{ scale: 0.95 }}
      >
        <span className="flex items-center justify-center gap-2">
          <FaPaperPlane /> Create Recurring Task
        </span>
      </motion.button>
      <Link to="/create" className="text-blue-600 hover:underline text-center block mt-4">
        Go Back to Create One-Time Task
      </Link>
    </motion.form>
  );
};

export default RecurringTaskForm;