import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import API_URL from '../config/api';
import loginBg from '../assets/images/login.jpg';

import '../css/pages/Auth.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setMessage('Email verified successfully. You can now log in.');
      setMessageType('success');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (error) {
      console.error(error);

      setMessage('Unable to connect to the server.');
      setMessageType('error');
    }
  };

  return (
    <section
      className="auth-page login-page"
      style={{
        '--auth-bg-image': `url(${loginBg})`
      }}
    >
      <div className="auth-left">
        <div className="auth-heading">
          <h1>Welcome Back</h1>
        </div>

        <p>Continue your anime journey with Risuto.</p>
      </div>

      <div className="auth-right">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
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

          {message && <p className={`auth-${messageType}`}>{message}</p>}

          <Link to="/forgot-password" className="forgot-password">
            Forgot Password?
          </Link>

          <button className="auth-btn" type="submit">
            Login
          </button>
        </form>

        <p>
          Don't have an account?
          <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
