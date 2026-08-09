import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import API_URL from '../config/api';
import signupBg from '../assets/images/signup.webp';

import '../css/pages/Auth.css';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
function Signup() {
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (!passwordRegex.test(password)) {
      setMessage(
        'Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.'
      );
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          fullName,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setMessageType('error');
        return;
      }

      setMessage(data.message);
      setMessageType('success');

      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);

      setMessage('Something went wrong. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <section
      className="auth-page signup-page"
      style={{
        '--auth-bg-image': `url(${signupBg})`
      }}
    >
      <div className="auth-left">
        <div className="auth-heading">
          <h1>Join Risuto</h1>
        </div>

        <p>Start organizing your anime collection today.</p>
      </div>

      <div className="auth-right">
        <h2>Create Account</h2>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <label>Full Name</label>
          </div>

          <div className="input-group">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

            <label>Email Address</label>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Password</label>

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <label>Confirm Password</label>
          </div>

          {message && <p className={`auth-${messageType}`}>{message}</p>}

          <button className="auth-btn" type="submit">
            Create Account
          </button>
        </form>

        <p>
          Already have an account?
          <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default Signup;
