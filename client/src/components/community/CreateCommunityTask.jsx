import React, { useEffect, useState } from "react";
import { createCommunityTask, getCommunityMembers } from "../../services/community";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import toast, { Toaster } from "react-hot-toast";

const CreateCommunityTask = () => {
  const { communityId, communityDeptId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    taskName: "",
    taskDescription: "",
    assignedTo: "",
    assignedName: "",
    dueDate: "",
    priority: "Medium",
    taskFrequency: "OneTime"
  });

  // ✅ LOAD COMMUNITY MEMBERS FOR DROPDOWN
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getCommunityMembers(communityId);
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members:", err);
        toast.error("Failed to load members");
      }
    };

    loadMembers();
  }, [communityId]);

  // ✅ HANDLE NORMAL INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ HANDLE MEMBER SELECT DROPDOWN
  const handleMemberSelect = (e) => {
    const selectedUser = members.find(
      (m) => m._id === e.target.value
    );

    if (!selectedUser) return;

    setForm({
      ...form,
      assignedTo: selectedUser.email,
      assignedName: selectedUser.username,
    });
  };

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.taskName ||
      !form.taskDescription ||
      !form.assignedTo ||
      !form.assignedName ||
      !form.dueDate
    ) {
      return toast.error("All fields required");
    }

    try {
      await createCommunityTask(communityId, communityDeptId, {
        ...form,
        createdBy: user?.email,
      });

      toast.success("✅ Community task created!");
      navigate(`/communities/${communityId}`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Create Community Task</h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="taskName"
            placeholder="Task Name"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="taskDescription"
            placeholder="Task Description"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          {/* ✅ MEMBER DROPDOWN */}
          <select
            onChange={handleMemberSelect}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.username} ({m.email})
              </option>
            ))}
          </select>

          {/* ✅ AUTO FILLED (READ ONLY) */}
          <input
            name="assignedTo"
            value={form.assignedTo}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
            placeholder="Assigned Email"
          />

          <input
            name="assignedName"
            value={form.assignedName}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
            placeholder="Assigned User Name"
          />

          <input
            type="date"
            name="dueDate"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <select
            name="priority"
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityTask;
