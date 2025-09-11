import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { motion } from 'framer-motion'; // Import motion
import { FaPaperPlane, FaSpinner, FaComments, FaUserCircle, FaBell } from 'react-icons/fa'; // Import icons

const WorldChat = ({ user }) => {
  // Ensure VITE_APP_API_URL is correctly defined in your .env file
  const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null); // Ref for scrolling to bottom
  const socketRef = useRef(null);

  const socketURL =
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5000' // Your local backend socket URL
      : API_BASE_URL; // Your production backend socket URL

  // Helper to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 👇 Load paginated old messages
  const loadMessages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const oldest = messages[0]?.timestamp || new Date().toISOString();

    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/messages?before=${oldest}&limit=20`); // Use API_BASE_URL for axios

      if (!Array.isArray(res.data)) {
        console.error("❌ Expected array but got:", res.data);
        setLoading(false);
        return;
      }

      if (res.data.length === 0) setHasMore(false);
      else setMessages((prev) => [...res.data.reverse(), ...prev]);
    } catch (err) {
      console.error("❌ Failed to load messages:", err);
      // Optionally show a toast error here
    } finally {
      setLoading(false);
    }
  };

  // 👇 Set up socket connection and initial message load
  useEffect(() => {
    socketRef.current = io(socketURL, {
      withCredentials: true,
    });

    socketRef.current.on('world-chat-init', (initMessages) => {
      setMessages(initMessages);
      scrollToBottom(); // Scroll to bottom on initial load
    });

    socketRef.current.on('world-chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [socketURL]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (text.trim() && user?._id && socketRef.current) {
      socketRef.current.emit('world-chat-message', {
        userId: user._id,
        username: user.username || user.displayName || user.email?.split('@')[0], // Use username from user object
        message: text,
      });
      setText('');
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore) {
      loadMessages();
    }
  };

  // Framer Motion variants for the main container
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  // Framer Motion variants for message items
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-xl mx-auto mt-8 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-indigo-100/50 opacity-60 rounded-3xl pointer-events-none"></div>

        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mb-8 text-center text-gray-900 drop-shadow-md flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FaComments className="text-blue-600 text-4xl sm:text-5xl" /> World Chat
        </motion.h2>

        <div
          onScroll={handleScroll}
          className="h-96 overflow-y-auto border border-blue-200 rounded-xl shadow-inner p-4 bg-blue-50 flex flex-col space-y-3 custom-scrollbar" // Added custom-scrollbar
        >
          {loading && (
            <p className="text-blue-600 animate-pulse text-center py-2 flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" /> Loading more messages...
            </p>
          )}
          {!hasMore && (
            <p className="text-gray-500 text-center text-sm py-2">
              — End of chat history —
            </p>
          )}

          {messages.map((msg, index) => (
            <motion.div
              key={msg._id || index} // Use _id if available, fallback to index
              className={`flex ${msg.userId === user?._id ? 'justify-end' : 'justify-start'}`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              {msg.type === 'system' ? (
                <div className="font-italic text-gray-600 text-center text-sm my-1 p-2 bg-gray-100 rounded-lg max-w-[90%] mx-auto shadow-sm flex items-center gap-2">
                  <FaBell className="text-yellow-600" /> {msg.message}
                </div>
              ) : (
                <div
                  className={`rounded-xl p-3 max-w-[80%] break-words shadow-md ${
                    msg.userId === user?._id
                      ? 'bg-blue-600 text-white self-end' // Current user's message
                      : 'bg-gray-200 text-gray-800 self-start' // Other user's message
                  }`}
                >
                  <strong className={`${msg.userId === user?._id ? 'text-blue-100' : 'text-blue-700'}`}>
                    {msg.username || 'Unknown User'}:
                  </strong>{' '}
                  {msg.message}
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} /> {/* Element to scroll into view */}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="Type your message..."
            className="flex-grow border border-blue-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-400 transition-all duration-200"
          />
          <motion.button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-lg flex items-center gap-2 font-semibold transition-all duration-300"
            whileHover={{ scale: 1.08, boxShadow: "0px 8px 20px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPaperPlane /> Send
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WorldChat;