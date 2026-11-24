import { Link } from 'react-router-dom';
import {
  FaChevronDown,
  FaHome,
  FaPlus,
  FaBookOpen,
  FaInfo,
  FaCog
} from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import logo from '../assets/icons/logo.png';

function Navbar() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isLoggedIn = !!token;
  const username = user?.fullName || '';
  const email = user?.email || '';

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <nav className="navbar">
      <Link to={isLoggedIn ? '/dashboard' : '/'} className="logo">
        {' '}
        <img src={logo} alt="Risuto Logo" />
        <span>RISUTO</span>
      </Link>
      {isLoggedIn ? (
        <>
          <div className="nav-links">
            <Link to="/dashboard">
              <FaHome />
              <span>Home</span>
            </Link>
            <Link to="/add-anime">
              <FaPlus />
              <span>Anime</span>
            </Link>
            <Link to="/library">
              <FaBookOpen />
              <span>Library</span>
            </Link>
          </div>
          <div className="nav-actions" ref={menuRef}>
            <span className="username">{username}</span>
            <button className="settings-btn" onClick={() => setShowMenu(!showMenu)}>
              <FaChevronDown />
            </button>
            {showMenu && (
              <div className="settings-menu">
                <div className="menu-profile">
                  <h4>{username}</h4>
                  <p>{email}</p>
                </div>
                <div className="menu-divider"></div>
                <Link to="/settings" className="menu-item" onClick={() => setShowMenu(false)}>
                  <FaCog />
                  Settings
                </Link>
                <Link to="/about" className="menu-item" onClick={() => setShowMenu(false)}>
                  <FaInfo />
                  About
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/signup" className="signup-btn">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
