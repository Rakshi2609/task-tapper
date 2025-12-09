import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import { createCommunityRecurringTask } from "../../services/community";
import toast, { Toaster } from "react-hot-toast";

const CreateCommunityRecurringTask = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    taskName: "",
    taskDescription: "",
    taskFrequency: "",
    taskCreateDaysAhead: 1,
    taskStartDate: "",
    taskEndDate: "",
    taskAssignedBy: user?.email || "",
    taskAssignedTo: "",
    createdBy: user?.email || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.taskName ||
      !formData.taskFrequency ||
      !formData.taskStartDate ||
      !formData.taskAssignedTo
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        taskAssignedBy: user?.email || "",
        createdBy: user?.email || "",
      };

      await createCommunityRecurringTask(
        communityId,
        communityDeptId || null,
        payload
      );

      toast.success("✅ Community recurring task created!");

      setFormData({
        taskName: "",
        taskDescription: "",
        taskFrequency: "",
        taskCreateDaysAhead: 1,
        taskStartDate: "",
        taskEndDate: "",
        taskAssignedBy: user?.email || "",
        taskAssignedTo: "",
        createdBy: user?.email || "",
      });

    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create community recurring task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Toaster />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-blue-700 text-center">
          🔄 Create Community Recurring Task
        </h2>

        <input
          name="taskName"
          placeholder="Task Name"
          value={formData.taskName}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        <input
          name="taskDescription"
          placeholder="Task Description"
          value={formData.taskDescription}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        {/* Frequency */}
        <select
          name="taskFrequency"
          value={formData.taskFrequency}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        >
          <option value="">Select Frequency</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>

        {/* Start Date */}
        <input
          type="date"
          name="taskStartDate"
          value={formData.taskStartDate}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* End Date */}
        <input
          type="date"
          name="taskEndDate"
          value={formData.taskEndDate}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />

        {/* Assigned To */}
        <input
          name="taskAssignedTo"
          placeholder="Assign To (email)"
          value={formData.taskAssignedTo}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        {/* Assigned By (read-only) */}
        <input
          value={user?.email || ""}
          disabled
          className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition"
        >
          Create Community Recurring Task
        </button>

        <Link
          to={`/community/${communityId}`}
          className="block text-center text-blue-600 hover:underline"
        >
          ← Back to Community
        </Link>
      </form>
    </div>
  );
};

export default CreateCommunityRecurringTask;
