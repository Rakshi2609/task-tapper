import React, { useState } from "react";
import { createCommunity } from "../../services/community";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../assests/store";

const CreateCommunity = () => {
  const { user } = useAuthStore();     // 👈 Logged-in user from auth store
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      setError("All fields are required");
      return;
    }

    if (!user?._id) {
      setError("You must be logged in to create a community.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const newCommunity = await createCommunity({
        name,
        description,
        CreatedBy: user._id,      // 👈 EXACTLY what backend expects
      });

      setSuccess("Community created successfully!");

      setTimeout(() => {
        navigate("/communities");
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Failed to create community");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <form
        onSubmit={handleCreate}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Community</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}

        <label className="block mb-2 font-medium">Community Name</label>
        <input
          type="text"
          className="w-full p-3 border rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter community name"
        />

        <label className="block mb-2 font-medium">Description</label>
        <textarea
          className="w-full p-3 border rounded mb-4"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {loading ? "Creating..." : "Create Community"}
        </button>
      </form>
    </div>
  );
};

export default CreateCommunity;
