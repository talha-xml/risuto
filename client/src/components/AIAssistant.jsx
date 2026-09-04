import { useEffect, useRef, useState } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

import API_URL from '../config/api';

import '../css/components/AIAssistant.css';

function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (open && chatRef.current && !chatRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Send message to AI
  const sendMessage = async (text = message) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Please log in to use Risuto AI.'
        }
      ]);

      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage
      }
    ]);

    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to get a response from Risuto AI.');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.response
        }
      ]);
    } catch (error) {
      console.error('AI REQUEST ERROR:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: error.message || 'Something went wrong. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {!open && (
        <button className="ai-button" onClick={() => setOpen(true)}>
          <FaRobot />
          <span>Ask Risuto.AI</span>
        </button>
      )}

      {open && (
        <div className="ai-window" ref={chatRef}>
          <div className="ai-header">
            <div className="ai-title">
              <FaRobot />
              <span>Risuto AI</span>
            </div>

            <button onClick={() => setOpen(false)} aria-label="Close Risuto AI">
              <FaTimes />
            </button>
          </div>

          <div className="ai-body">
            {messages.length === 0 ? (
              <>
                <div className="ai-message">
                  <strong>Risuto AI</strong>
                  <p>Hey there! How can I help you today?</p>
                  <p>I can help you explore your anime collection.</p>
                </div>

                <div className="suggestions">
                  <button onClick={() => handleSuggestion('What should I watch next?')}>
                    What should I watch next?
                  </button>

                  <button onClick={() => handleSuggestion('Show completed anime')}>
                    Show completed anime
                  </button>

                  <button onClick={() => handleSuggestion("What's on hold?")}>
                    What's on hold?
                  </button>

                  <button onClick={() => handleSuggestion('Recently added')}>Recently added</button>
                </div>
              </>
            ) : (
              <div className="ai-chat">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    {msg.role === 'ai' && <strong>Risuto AI</strong>}

                    <p>{msg.text}</p>
                  </div>
                ))}

                {loading && (
                  <div className="chat-message ai">
                    <strong>Risuto AI</strong>

                    <div className="ai-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="ai-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Risuto AI..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              onClick={() => sendMessage()}
              disabled={!message.trim() || loading}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;
