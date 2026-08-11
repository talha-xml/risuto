import { Link, useNavigate } from 'react-router-dom';
import {
  FaChevronDown,
  FaHome,
  FaPlus,
  FaBookOpen,
  FaSignOutAlt,
  FaTrashAlt,
  FaInfo
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

  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowMenu(false);
    navigate('/login');
  };
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
                <Link to="/about" className="menu-item" onClick={() => setShowMenu(false)}>
                  {' '}
                  <FaInfo />
                  About
                </Link>
                <button className="menu-item" onClick={handleLogout}>
                  <FaSignOutAlt />
                  Logout
                </button>
                <div className="menu-divider"></div>
                <button className="menu-item danger">
                  <FaTrashAlt />
                  Delete Account
                </button>
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
