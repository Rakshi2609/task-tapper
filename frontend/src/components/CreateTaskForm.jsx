import React, { useState, useEffect } from "react";
import { useAuthStore } from "../assests/store";
import { getAllEmails, createTask } from "../services/taskService";

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
  const [error, setError] = useState("");
  const [loadingEmails, setLoadingEmails] = useState(true);

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
        setError("Could not load email list.");
      } finally {
        setLoadingEmails(false);
      }
    };

    fetchEmails();
  }, []);

  const handleEmailInput = (e) => {
    const input = e.target.value;
    setFormData({ ...formData, assignedTo: input });

    const suggestions = allEmails.filter((email) =>
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
    setError("");
    try {
      await createTask(formData);
      alert("✅ Task created successfully!");
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("❌ Something went wrong.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6 mt-6"
    >
      <h2 className="text-2xl font-bold text-indigo-700">📝 Create New Task</h2>

      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      <input
        name="task"
        placeholder="Task Description"
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full"
        required
      />

      {/* 📧 Email dropdown */}
      <div className="relative">
        <input
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleEmailInput}
          placeholder="Search or select assignee email"
          className="border border-gray-300 p-2 rounded w-full"
          required
          autoComplete="off"
        />
        {filteredEmails.length > 0 && (
          <ul className="absolute bg-white border w-full z-20 max-h-40 overflow-y-auto shadow-lg rounded">
            {filteredEmails.map((email, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectEmail(email)}
                className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${
                  email === user?.email ? "font-bold text-blue-600" : ""
                }`}
              >
                {email}
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        name="assignedName"
        placeholder="Assignee Name"
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full"
        required
      />

      <select
        name="taskFrequency"
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full"
        required
      >
        <option value="">Select Frequency</option>
        <option value="Daily">Daily</option>
        <option value="Weekly">Weekly</option>
        <option value="Monthly">Monthly</option>
        <option value="OneTime">One Time</option>
      </select>

      <input
        type="date"
        name="dueDate"
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full"
        required
      />

      <select
        name="priority"
        onChange={handleChange}
        className="border border-gray-300 p-2 rounded w-full"
        required
      >
        <option value="">Select Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full transition"
      >
        ✅ Create Task
      </button>
    </form>
  );
};

export default CreateTaskForm;
