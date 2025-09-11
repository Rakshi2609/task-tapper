import React, { useState, useEffect } from "react";
import { createTask } from "../services/taskService";
import { useAuthStore } from "../assests/store";
import axios from "axios";

// Icons
import { FaTasks, FaUserPlus, FaCalendarAlt, FaFlag, FaRepeat, FaUserCircle } from "react-icons/fa";

const CreateTaskForm = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    createdBy: user?.email || "",
    task: "",
    assignedTo: "",
    assignedName: "",
    taskFrequency: "",
    dueDate: "",
    priority: "",
  });

  const [allEmails, setAllEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get("/api/users/emails");
        setAllEmails(res.data.emails || []);
      } catch (err) {
        console.error("Error fetching emails:", err);
      }
    };

    fetchEmails();
  }, []);

  const handleEmailInput = (e) => {
    const input = e.target.value;
    setFormData({ ...formData, assignedTo: input });

    const suggestions = allEmails.filter(email =>
      email.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredEmails(suggestions);
  };

  const handleSelectEmail = (email) => {
    setFormData({ ...formData, assignedTo: email });
    setFilteredEmails([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      alert("Task created successfully!");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 mt-6"
    >
      <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
        <FaTasks /> Create New Task
      </h2>

      <div className="flex items-center gap-2">
        <FaTasks className="text-gray-500" />
        <input
          name="task"
          placeholder="Task Description"
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <FaUserPlus className="text-gray-500" />
          <input
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleEmailInput}
            placeholder="Assignee Email"
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        {filteredEmails.length > 0 && (
          <ul className="absolute bg-white border w-full z-10 max-h-40 overflow-y-auto shadow-lg rounded">
            {filteredEmails.map((email, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectEmail(email)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {email}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2">
        <FaUserCircle className="text-gray-500" />
        <input
          name="assignedName"
          placeholder="Assignee Name"
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <FaRepeat className="text-gray-500" />
        <select
          name="taskFrequency"
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full"
        >
          <option value="">Select Frequency</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <FaCalendarAlt className="text-gray-500" />
        <input
          type="date"
          name="dueDate"
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <FaFlag className="text-gray-500" />
        <select
          name="priority"
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full"
        >
          <option value="">Select Priority</option>
          <option value="High" className="text-red-600">High</option>
          <option value="Medium" className="text-yellow-600">Medium</option>
          <option value="Low" className="text-green-600">Low</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full transition"
      >
        Create Task
      </button>
    </form>
  );
};

export default CreateTaskForm;
