import React, { useEffect, useState } from "react";
import { getAllUsers, addMemberToCommunity } from "../../services/community";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../../assests/store";

const AddPeople = () => {
  const { communityId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        console.log("Fetched users:", data);

        setUsers(data.filter((u) => u.email !== user?.email));
      } catch (err) {
        console.error("Fetch Users Error:", err);
        toast.error("Unable to load users");
      }
    };
    loadUsers();
  }, [user?.email]);

  const handleAdd = async () => {
    if (!selectedEmail) return toast.error("Select an email");

    const selectedUser = users.find((u) => u.email === selectedEmail);
    if (!selectedUser) return toast.error("User not found");

    setLoading(true);
    try {
      await addMemberToCommunity(
  communityId,
  selectedUser._id,
  user._id     // ✅ THIS MAKES YOU THE VERIFIED ADMIN
);

      toast.success("User added!");
    } catch (err) {
      console.error("Add Member Error:", err);
      toast.error("Failed to add user");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />

      <h2 className="text-2xl font-bold mb-4">Add People to Community</h2>

      <select
        className="p-3 bg-white border rounded w-full mb-4"
        value={selectedEmail}
        onChange={(e) => setSelectedEmail(e.target.value)}
      >
        <option value="">Select Email</option>
        {users.map((u) => (
          <option key={u._id} value={u.email}>
            {u.email} ({u.username})
          </option>
        ))}
      </select>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Adding..." : "Add Member"}
      </button>
    </div>
  );
};

export default AddPeople;
