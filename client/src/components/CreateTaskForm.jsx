import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../assests/store";
import { getAllEmails, createTask } from "../services/taskService";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaUser, FaCalendarAlt, FaStar, FaClock, FaTimesCircle, FaChevronDown, FaAlignLeft } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast'; // Import toast and Toaster
import { Link } from "react-router-dom";

const CreateTaskForm = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    createdBy: user?.email || "",
    taskName: "",
    taskDescription: "", // This is the state property for description
    assignedTo: "",
    assignedName: "",
    taskFrequency: "",
    dueDate: "",
    priority: "",
  });

  const [allEmails, setAllEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(true);

  // States for dropdown visibility
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Refs for click-outside detection
  const emailInputRef = useRef(null);
  const frequencyDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);

  // Options for Frequency and Priority
  const frequencyOptions = [
    { value: "Daily", label: "🕓 Daily" },
    { value: "Weekly", label: "📆 Weekly" },
    { value: "Monthly", label: "🗓️ Monthly" },
    { value: "OneTime", label: "🎯 One Time" },
  ];

  const priorityOptions = [
    { value: "High", label: "🔴 High" },
    { value: "Medium", label: "🟡 Medium" },
    { value: "Low", label: "🟢 Low" },
  ];

  // 🔁 Fetch emails on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const emails = await getAllEmails();
        const sorted = emails.filter((e) => e !== user?.email);
        if (user?.email) sorted.unshift(user.email); // Put current user first
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
    }));
  }, [user?.email]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailInputRef.current && !emailInputRef.current.contains(event.target)) {
        setShowEmailSuggestions(false);
      }
      if (frequencyDropdownRef.current && !frequencyDropdownRef.current.contains(event.target)) {
        setShowFrequencyDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Email Dropdown Logic ---
  const handleEmailInput = (e) => {
    const input = e.target.value;
    setFormData({ ...formData, assignedTo: input });

    if (input.length > 0) {
      const suggestions = allEmails.filter((email) =>
        email.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredEmails(suggestions);
      setShowEmailSuggestions(true);
    } else {
      setFilteredEmails([]);
      setShowEmailSuggestions(true); // Keep open if clearing, show all
    }
  };

  const handleSelectEmail = (email) => {
    setFormData({ ...formData, assignedTo: email });
    setFilteredEmails([]); // Clear filters after selection
    setShowEmailSuggestions(false);
  };

  // --- Generic Change Handler for Inputs (not custom dropdowns) ---
  const handleChange = (e) => {
    // This correctly uses the input's name attribute to update the corresponding state
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Custom Dropdown Handlers (Frequency, Priority) ---
  const handleSelectDropdownItem = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (name === "taskFrequency") setShowFrequencyDropdown(false);
    if (name === "priority") setShowPriorityDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (updated to check taskName and taskDescription)
    if (!formData.taskName || !formData.taskDescription || !formData.assignedTo || !formData.assignedName || !formData.taskFrequency || !formData.dueDate || !formData.priority) {
      toast.error("All fields are required. Please fill them out."); // Use toast for validation error
      return;
    }

    try {
      await createTask(formData);
      toast.success("✅ Task created successfully!"); // Use toast for success
      // Reset form after successful submission
      setFormData({
        createdBy: user?.email || "",
        taskName: "",        // Reset taskName
        taskDescription: "", // Reset taskDescription
        assignedTo: "",
        assignedName: "",
        taskFrequency: "",
        dueDate: "",
        priority: "",
      });
      setFilteredEmails([]);
      setShowEmailSuggestions(false);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response?.data?.message) {
        toast.error(`❌ ${error.response.data.message}`); // Use toast for API error
      } else {
        toast.error("❌ Failed to create task. Please try again."); // Generic error toast
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
    hover: { boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.3)" }, // Blue glow
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
        <span className="text-blue-600">📝</span> Create New Task
      </h2>

      {/* Task Name */}
      <motion.div
        className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
        whileHover="hover"
        whileFocus="focus"
        variants={inputVariants}
      >
        <FaPaperPlane className="text-blue-500 ml-4 mr-2" />
        <input
          name="taskName"
          placeholder="Task Name"
          value={formData.taskName}
          onChange={handleChange}
          className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          required
        />
      </motion.div>

      {/* Task Description */}
      <motion.div
        className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
        whileHover="hover"
        whileFocus="focus"
        variants={inputVariants}
      >
        <FaAlignLeft className="text-blue-500 ml-4 mr-2" />
        <input
          name="taskDescription" // <-- Changed name from "task" to "taskDescription"
          placeholder="Task Description"
          value={formData.taskDescription}
          onChange={handleChange}
          className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          required
        />
      </motion.div>

      {/* 📧 Email dropdown (Existing custom dropdown) */}
      <div className="relative" ref={emailInputRef}>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
        >
          <FaUser className="text-blue-500 ml-4 mr-2" />
          <input
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleEmailInput}
            onFocus={() => {
                if (formData.assignedTo.length === 0 && allEmails.length > 0 && !loadingEmails) {
                    setFilteredEmails(allEmails);
                }
                setShowEmailSuggestions(true);
            }}
            placeholder="Search or select assignee email"
            className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
            required
            autoComplete="off"
          />
          {formData.assignedTo && (
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, assignedTo: "" });
                setFilteredEmails([]);
                setShowEmailSuggestions(false);
              }}
              className="mr-3 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear email"
            >
              <FaTimesCircle />
            </button>
          )}
        </motion.div>
        <AnimatePresence>
          {showEmailSuggestions && (
            <motion.ul
              className="absolute bg-white border border-blue-200 w-full z-20 max-h-48 overflow-y-auto shadow-lg rounded-b-xl mt-1 custom-scrollbar"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {loadingEmails ? (
                <li className="px-4 py-2 text-gray-500 text-center">Loading emails...</li>
              ) : filteredEmails.length > 0 ? (
                filteredEmails.map((email, idx) => (
                  <motion.li
                    key={idx}
                    onClick={() => handleSelectEmail(email)}
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

      {/* Assignee Name */}
      <motion.div
        className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
        whileHover="hover"
        whileFocus="focus"
        variants={inputVariants}
      >
        <FaUser className="text-blue-500 ml-4 mr-2" />
        <input
          name="assignedName"
          placeholder="Assignee Name"
          value={formData.assignedName}
          onChange={handleChange}
          className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
          required
        />
      </motion.div>

      {/* Task Frequency (Custom Dropdown) */}
      <div className="relative" ref={frequencyDropdownRef}>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200 cursor-pointer"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
          onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
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
              {frequencyOptions.map((option, idx) => (
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

      {/* Due Date */}
      <motion.div
        className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200"
        whileHover="hover"
        whileFocus="focus"
        variants={inputVariants}
      >
        <FaCalendarAlt className="text-blue-500 ml-4 mr-2" />
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 cursor-pointer"
          required
        />
      </motion.div>

      {/* Priority (Custom Dropdown) */}
      <div className="relative" ref={priorityDropdownRef}>
        <motion.div
          className="flex items-center bg-white rounded-xl shadow-sm border border-blue-100 focus-within:border-blue-400 transition-all duration-200 cursor-pointer"
          whileHover="hover"
          whileFocus="focus"
          variants={inputVariants}
          onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
        >
          <FaStar className="text-blue-500 ml-4 mr-2" />
          <div className="p-3 rounded-r-xl w-full bg-transparent outline-none text-gray-700 font-medium">
            {getDisplayLabel(formData.priority, priorityOptions, "⭐ Select Priority")}
          </div>
          <FaChevronDown className={`absolute right-4 text-blue-500 transition-transform duration-200 ${showPriorityDropdown ? 'rotate-180' : ''}`} />
        </motion.div>
        <AnimatePresence>
          {showPriorityDropdown && (
            <motion.ul
              className="absolute bg-white border border-blue-200 w-full z-20 max-h-48 overflow-y-auto shadow-lg rounded-b-xl mt-1 custom-scrollbar"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {priorityOptions.map((option, idx) => (
                <motion.li
                  key={idx}
                  onClick={() => handleSelectDropdownItem("priority", option.value)}
                  className={`px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors duration-200 text-gray-700 ${
                    formData.priority === option.value ? "font-bold text-blue-600 bg-blue-50" : ""
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

      <motion.button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300"
        whileTap={{ scale: 0.95 }}
      >
        <span className="flex items-center justify-center gap-2">
          <FaPaperPlane /> Create Task
        </span>
      </motion.button>
      <Link to="/recurring/create" className="text-blue-600 hover:underline text-center block mt-4">
        Create Recurring Task
      </Link>
    </motion.form>
  );
};

export default CreateTaskForm;
