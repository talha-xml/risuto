import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import API_URL from '../config/api';
import '../css/pages/ResetPassword.css';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [updated, setUpdated] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');

    // Check reset token
    if (!token) {
      setMessage('This password reset link is invalid or missing.');
      setMessageType('error');
      return;
    }

    // Check passwords
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      setMessage(
        'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.'
      );
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          token,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Unable to reset your password. Please try again.');

        setMessageType('error');

        return;
      }

      setUpdated(true);
    } catch (error) {
      console.error(error);

      setMessage('Unable to connect to the server. Please try again.');

      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reset-page">
      <div className="reset-left">
        {!updated ? (
          <>
            <h1>Create New Password</h1>

            <p>Choose a strong password to secure your Risuto account.</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <label>New Password</label>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <label>Confirm Password</label>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {message && <p className={`reset-${messageType}`}>{message}</p>}

              <button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="reset-success">
            <div className="success-icon">✓</div>

            <h1>Password Updated</h1>

            <p>
              Your password has been changed successfully. You can now login with your new password.
            </p>

            <Link to="/login" className="login-redirect-btn">
              Go to Login
            </Link>
          </div>
        )}
      </div>

      <div className="reset-right">
        <div className="reset-overlay">
          <h2>Your Anime Journey Awaits.</h2>

          <p>Keep your memories safe with Risuto.</p>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
