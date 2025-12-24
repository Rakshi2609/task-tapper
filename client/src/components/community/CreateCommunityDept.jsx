import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../../assests/store";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_APP_API_URL}/api/community`;

const CreateCommunityDept = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !description) {
      return toast.error("Please fill all fields");
    }

    if (!user?._id) {
      return toast.error("User not authenticated");
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/${communityId}/dept/create`,
        {
          name,
          description,
          requesterId: user._id, // ✅ REQUIRED FOR MEMBER CHECK
        },
        { withCredentials: true }
      );

      toast.success("✅ Department created successfully!");
      navigate(`/communities/${communityId}/departments`);
    } catch (err) {
      console.error("Create Dept Error:", err);
      toast.error("❌ Failed to create department");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
      <Toaster />

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-5 text-center">
          Create Community Department
        </h2>

        <input
          type="text"
          placeholder="Department Name (HR, Tech, Marketing...)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 border rounded w-full mb-4"
        />

        <textarea
          placeholder="Department Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-3 border rounded w-full mb-4"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition"
        >
          {loading ? "Creating..." : "Create Department"}
        </button>
      </div>
    </div>
  );
};

export default CreateCommunityDept;
