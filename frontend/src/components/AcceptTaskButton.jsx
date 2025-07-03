import React, { useState } from "react";
import { acceptTask } from "../services/taskService";
import { useAuthStore } from "../assests/store";
import { toast } from "react-toastify";

const AcceptTaskButton = ({ taskId }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptTask({ taskId, email: user.email });
      toast.success("👍 Task Accepted");
    } catch (err) {
      toast.error("❌ Failed to accept task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
    >
      {loading ? "Accepting..." : "Accept Task"}
    </button>
  );
};

export default AcceptTaskButton;
