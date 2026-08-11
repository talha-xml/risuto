import { useState } from 'react';
import '../css/pages/ForgotPassword.css';
import API_URL from '../config/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Something went wrong. Please try again.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (error) {
      console.error(error);

      setMessage('Unable to connect to the server. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="forgot-page">
      <div className="forgot-left">
        {!sent ? (
          <>
            <h1>Reset Your Password</h1>
            <p>
              Don't worry, it happens. Enter your email and we'll help you get back into your Risuto
              journey.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label>Email Address</label>
              </div>

              {message && <p className={`forgot-${messageType}`}>{message}</p>}

              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h1>Check Your Email</h1>
            <p>
              If an account exists with this email, we have sent a password reset link. Please check
              your inbox and follow the instructions.
            </p>
          </div>
        )}
      </div>
      <div className="forgot-right">
        <div className="forgot-overlay">
          <h2>Never Lose Your Anime Memories.</h2>
          <p>Your collection matters the most in this journey.</p>
        </div>
      </div>
    </section>
  );
}
export default ForgotPassword;
