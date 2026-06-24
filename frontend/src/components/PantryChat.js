// src/components/PantryChat.js
// Real-time chat powered by Socket.IO — demonstrates multi-tab communication

import React, { useState, useEffect, useRef } from 'react';
import socket from '../services/socket';
import { getCurrentUser } from '../services/api';
import './PantryChat.css';

export default function PantryChat() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState('');
  const [online, setOnline]   = useState([]);
  const bottomRef             = useRef(null);
  const user                  = getCurrentUser();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit('user_join', { userId: user?.id, email: user?.email, role: user?.role });
      socket.emit('subscribe_expiry');
    }

    socket.on('pantry_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('online_users', (users) => {
      setOnline(users);
    });

    // Live pantry updates
    socket.on('item:created', ({ name, category }) => {
      setMessages(prev => [...prev, {
        from: '🔔 System',
        text: `New item added: ${name} (${category})`,
        ts:   new Date().toISOString(),
        system: true,
      }]);
    });

    socket.on('item:updated', ({ name, quantity }) => {
      setMessages(prev => [...prev, {
        from: '🔔 System',
        text: `Item updated: ${name} — qty now ${quantity}`,
        ts:   new Date().toISOString(),
        system: true,
      }]);
    });

    socket.on('item:deleted', ({ itemId }) => {
      setMessages(prev => [...prev, {
        from: '🔔 System',
        text: `Item #${itemId} removed from pantry`,
        ts:   new Date().toISOString(),
        system: true,
      }]);
    });

    return () => {
      socket.off('pantry_message');
      socket.off('online_users');
      socket.off('item:created');
      socket.off('item:updated');
      socket.off('item:deleted');
    };
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function send() {
    if (!text.trim()) return;
    socket.emit('pantry_message', { text: text.trim(), from: user?.email || 'Guest' });
    setText('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* Floating button */}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="Pantry Chat">
        💬
        {messages.length > 0 && !open && (
          <span className="chat-badge">{messages.length}</span>
        )}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>🥦 Pantry Chat</span>
            <span className="chat-online">{online.length} online</span>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">No messages yet. Say hello!</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.system ? 'chat-msg-system' : ''} ${m.from === user?.email ? 'chat-msg-mine' : ''}`}>
                <span className="chat-from">{m.from === user?.email ? 'You' : m.from}</span>
                <span className="chat-text">{m.text}</span>
                <span className="chat-ts">{new Date(m.ts).toLocaleTimeString()}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message…"
            />
            <button className="btn btn-primary chat-send" onClick={send}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
