import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommunityById, approveMemberApplication, rejectMemberApplication, getAllUsers } from "../../services/community";
import { useAuthStore } from "../../assests/store";
import toast, { Toaster } from "react-hot-toast";

const PendingApplications = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [community, setCommunity] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [communityId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get community with waiting approval list
      const communityData = await getCommunityById(communityId);
      setCommunity(communityData);

      // Check if user is the owner
      if (communityData.CreatedBy !== user?._id) {
        toast.error("Only the community owner can view applications");
        navigate(`/communities/${communityId}/departments`);
        return;
      }

      // Get all users to match with waiting approval IDs
      const allUsers = await getAllUsers();
      const pending = allUsers.filter((u) =>
        communityData.waitingApproval.includes(u._id)
      );
      setPendingUsers(pending);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveMemberApplication(communityId, userId, user._id);
      toast.success("Application approved!");
      loadData(); // Reload data
    } catch (err) {
      console.error("Approve error:", err);
      toast.error(err.response?.data?.message || "Failed to approve application");
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectMemberApplication(communityId, userId, user._id);
      toast.success("Application rejected");
      loadData(); // Reload data
    } catch (err) {
      console.error("Reject error:", err);
      toast.error(err.response?.data?.message || "Failed to reject application");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pending Applications</h1>
          <button
            onClick={() => navigate(`/communities/${communityId}/departments`)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to Community
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {community?.name} - Applications
          </h2>

          {pendingUsers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No pending applications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((applicant) => (
                <div
                  key={applicant._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-lg">{applicant.username}</p>
                    <p className="text-gray-600 text-sm">{applicant.email}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(applicant._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleReject(applicant._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show count */}
        <div className="mt-4 text-center text-gray-600">
          {pendingUsers.length} pending application(s)
        </div>
      </div>
    </div>
  );
};

export default PendingApplications;
