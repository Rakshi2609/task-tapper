import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const WorldChat = ({ user }) => {
    const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const topRef = useRef();
  const socketRef = useRef(null);

  const socketURL =
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5000'
      : API_BASE_URL;

  // 👇 Load paginated old messages
  const loadMessages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const oldest = messages[0]?.timestamp || new Date().toISOString();

    try {
      const res = await axios.get(`/api/chat/messages?before=${oldest}&limit=20`);

      if (!Array.isArray(res.data)) {
        console.error("❌ Expected array but got:", res.data);
        setLoading(false);
        return;
      }

      if (res.data.length === 0) setHasMore(false);
      else setMessages((prev) => [...res.data.reverse(), ...prev]);
    } catch (err) {
      console.error("❌ Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Set up socket connection
  useEffect(() => {
    socketRef.current = io(socketURL, {
      withCredentials: true,
    });

    socketRef.current.on('world-chat-init', (initMessages) => {
      setMessages(initMessages);
    });

    socketRef.current.on('world-chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (text.trim()) {
      socketRef.current.emit('world-chat-message', {
        userId: user._id,
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

  return (
    <div>
      <h2>🌍 World Chat</h2>

      <div
        onScroll={handleScroll}
        style={{
          height: 300,
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 10,
          background: '#f9f9f9',
        }}
      >
        <div ref={topRef}></div>

        {messages.map((msg) => (
          <div key={msg._id} style={{ marginBottom: '8px' }}>
            {msg.type === 'system' ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>
                🛎️ {msg.message}
              </div>
            ) : (
              <div>
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            )}
          </div>
        ))}

        {loading && <p>⏳ Loading more...</p>}
      </div>
        
      <div style={{ marginTop: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '70%', padding: 5, marginRight: 5 }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default WorldChat;
