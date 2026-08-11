import { useEffect, useRef, useState } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

import '../css/components/AIAssistant.css';

function AIAssistant() {
  const [open, setOpen] = useState(false);
  const chatRef = useRef(null);

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

            <button onClick={() => setOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="ai-body">
            <div className="ai-message">
              <strong>Risuto AI</strong>
              <p>Hey there! How can I help you today?</p>
              <p>I can help you explore your anime collection.</p>
            </div>
            <div className="suggestions">
              <button>What should I watch next?</button>
              <button>Show completed anime</button>
              <button>What's on hold?</button>
              <button>Recently added</button>
            </div>
          </div>
          <div className="ai-input">
            <input type="text" placeholder="Ask Risuto AI..." />

            <button>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;
