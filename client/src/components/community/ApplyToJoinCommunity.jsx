import React, { useEffect, useState } from "react";
import { applyToJoinCommunity } from "../../services/community";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../assests/store";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const ApplyToJoinCommunity = () => {
  const { communityId } = useParams();
  const { user } = useAuthStore();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/community/${communityId}`
        );
        setCommunity(res.data);
      } catch (err) {
        toast.error("Error loading community");
      }
    };
    loadCommunity();
  }, [communityId]);

  const handleApply = async () => {
    if (!user?._id) return toast.error("You must be signed in");

    setLoading(true);
    try {
      await applyToJoinCommunity(communityId, user._id);
      toast.success("Application submitted successfully!");
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to apply");
      }
    }
    setLoading(false);
  };

  if (!community) {
    return (
      <div className="p-6 text-center">
        <Toaster />
        <p className="text-gray-500">Loading community...</p>
      </div>
    );
  }

  const alreadyApplied =
    community.waitingApproval?.includes(user._id);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />

      <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-blue-700 mb-3">
          Join Community
        </h2>

        <p className="text-gray-700 mb-6">
          Community:{" "}
          <span className="font-semibold">{community.name}</span>
        </p>

        {alreadyApplied ? (
          <p className="text-yellow-600 font-semibold">
            You have already applied to join this community.
          </p>
        ) : (
          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            {loading ? "Applying..." : "Apply to Join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplyToJoinCommunity;
