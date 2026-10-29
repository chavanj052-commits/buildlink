import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Building, HardHat } from 'lucide-react';
import API, { getSocket } from '../api';
import { useAuth } from '../components/ProtectedRoute';
import { getInitials, timeAgo } from '../utils/format';

export default function MessagesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get('/projects');
        setProjects(data || []);
        if (data && data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch messages for active project
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await API.get(`/messages/project/${selectedProjectId}`);
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Listen to real-time socket events
    const socket = getSocket();
    if (socket) {
      const handleNewMessage = (newMsg) => {
        if (String(newMsg.project_id) === String(selectedProjectId)) {
          setMessages((prev) => [...prev, newMsg]);
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('message', handleNewMessage);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('message', handleNewMessage);
      };
    }
  }, [selectedProjectId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedProjectId) return;

    const text = content.trim();
    setContent('');

    try {
      const { data } = await API.post(`/messages/project/${selectedProjectId}`, {
        content: text,
      });

      // Optimistic append if socket doesn't echo back to sender
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });

      // Emit socket event if active
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('send_message', data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div style={{ height: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top project selector bar */}
      <div
        className="card"
        style={{
          padding: '12px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageSquare size={18} color="#e8a838" />
          <span style={{ fontWeight: 700, fontSize: '14px' }}>Project Channel:</span>
          <select
            className="form-select"
            style={{ width: '260px', height: '36px' }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {activeProject && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Location: <strong style={{ color: 'var(--text-primary)' }}>{activeProject.location || 'Site'}</strong>
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#e8a838', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => {
              const isMe = msg.user_id === user?.id || msg.sender_id === user?.id || msg.user_name === user?.name;
              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '12px',
                    maxWidth: '75%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isMe ? '#0f1b2d' : '#e2e8f0',
                      color: isMe ? '#e8a838' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(msg.user_name || msg.sender_name || (isMe ? user?.name : 'BL'))}
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isMe ? 'You' : msg.user_name || msg.sender_name || 'Team Member'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        borderTopRightRadius: isMe ? '2px' : '12px',
                        borderTopLeftRadius: !isMe ? '2px' : '12px',
                        background: isMe ? '#0f1b2d' : '#f1f5f9',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <MessageSquare size={40} style={{ color: '#cbd5e1', margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet</div>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>
                Start the conversation for this project.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-light)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <input
            type="text"
            className="form-input"
            style={{ flex: 1, height: '42px' }}
            placeholder={`Type message to ${activeProject?.name || 'project'} team...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn--primary"
            style={{ height: '42px', padding: '0 20px' }}
            disabled={!content.trim()}
          >
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
