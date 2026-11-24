import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaKey,
  FaEnvelope,
  FaTrashAlt,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import API_URL from '../config/api';
import '../css/pages/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // User state
  const storedUser = localStorage.getItem('user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const [user, setUser] = useState(initialUser);

  // Full Name edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(initialUser?.fullName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState({ text: '', type: '' });

  // Tab state for right column: 'password' | 'email'
  const [activeTab, setActiveTab] = useState('password');

  // Form states: Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  // Form states: Change Email
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ text: '', type: '' });

  // Form states: Delete Account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  // Handle URL query parameters from email verification redirect
  useEffect(() => {
    const emailStatus = searchParams.get('emailUpdated');
    if (emailStatus === 'true') {
      setEmailMsg({
        text: 'Your email address has been successfully verified and updated!',
        type: 'success'
      });
      setActiveTab('email');
      fetchUserProfile();
    } else if (emailStatus === 'expired') {
      setEmailMsg({
        text: 'The email verification link is invalid or has expired. Please try again.',
        type: 'error'
      });
      setActiveTab('email');
    } else if (emailStatus === 'conflict') {
      setEmailMsg({
        text: 'This email is already in use by another account.',
        type: 'error'
      });
      setActiveTab('email');
    }
  }, [searchParams]);

  // Fetch fresh user profile
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setFullNameInput(data.user.fullName || '');
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update Full Name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameMsg({ text: '', type: '' });

    if (!fullNameInput.trim()) {
      setNameMsg({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    if (fullNameInput.trim() === user?.fullName) {
      setIsEditingName(false);
      return;
    }

    setNameLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullNameInput.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setNameMsg({ text: data.message || 'Failed to update name.', type: 'error' });
        return;
      }

      const updatedUser = { ...user, fullName: data.user.fullName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingName(false);
      setNameMsg({ text: 'Name updated successfully!', type: 'success' });

      // Notify Navbar and other listeners via storage event
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
      setNameMsg({ text: 'Unable to connect to server.', type: 'error' });
    } finally {
      setNameLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Change Password submit
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPassMsg({
        text:
          'Min. 8 characters with 1 uppercase letter, 1 number, and 1 special symbol.',
        type: 'error'
      });
      return;
    }

    setPassLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setPassMsg({ text: data.message || 'Failed to change password.', type: 'error' });
        return;
      }

      setPassMsg({ text: data.message, type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPassMsg({ text: 'Unable to reach the server. Please try again.', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  // Request Email Change submit
  const handleRequestEmailChange = async (e) => {
    e.preventDefault();
    setEmailMsg({ text: '', type: '' });

    if (!newEmail.trim()) {
      setEmailMsg({ text: 'Please enter a valid new email address.', type: 'error' });
      return;
    }

    setEmailLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/auth/request-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          password: emailPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailMsg({ text: data.message || 'Failed to request email change.', type: 'error' });
        return;
      }

      setEmailMsg({ text: data.message, type: 'success' });
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      console.error(err);
      setEmailMsg({ text: 'Unable to reach the server. Please try again.', type: 'error' });
    } finally {
      setEmailLoading(false);
    }
  };

  // Delete Account submit
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteMsg('');

    if (deleteConfirmText !== 'DELETE') {
      setDeleteMsg('Please type DELETE in capital letters to confirm.');
      return;
    }

    if (!deletePassword) {
      setDeleteMsg('Please enter your password.');
      return;
    }

    setDeleteLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteMsg(data.message || 'Failed to delete account.');
        setDeleteLoading(false);
        return;
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signup');
    } catch (err) {
      console.error(err);
      setDeleteMsg('Unable to reach the server. Please try again.');
      setDeleteLoading(false);
    }
  };

  // Get user avatar initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <span className="settings-badge">Account Settings</span>
            <h1>Settings & Preferences</h1>
          </div>

          {/* Compact 2-Column Layout */}
          <div className="settings-layout">
            {/* LEFT COLUMN: Square Profile Card */}
            <div className="settings-left-col">
              <div className="settings-card square-profile-card">
                <div className="profile-avatar-circle">
                  <span>{initials}</span>
                </div>

                {/* Editable Full Name */}
                <div className="profile-name-section">
                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className="inline-name-form">
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder="Your full name"
                        autoFocus
                        disabled={nameLoading}
                      />
                      <div className="inline-name-actions">
                        <button
                          type="submit"
                          className="name-action-btn save"
                          title="Save Name"
                          disabled={nameLoading}
                        >
                          <FaCheck />
                        </button>
                        <button
                          type="button"
                          className="name-action-btn cancel"
                          title="Cancel"
                          onClick={() => {
                            setFullNameInput(user?.fullName || '');
                            setIsEditingName(false);
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="name-display-wrapper">
                      <h2>{user?.fullName || 'User'}</h2>
                      <button
                        type="button"
                        className="edit-name-btn"
                        onClick={() => setIsEditingName(true)}
                        title="Edit Full Name"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  )}

                  {nameMsg.text && (
                    <span className={`name-status-msg ${nameMsg.type}`}>
                      {nameMsg.text}
                    </span>
                  )}
                </div>

                <p className="profile-email-tag">{user?.email}</p>

                <div className="profile-status-pill">
                  <FaCheckCircle /> Verified Account
                </div>

                <div className="square-card-divider"></div>

                {/* Compact Session Actions inside Left Card */}
                <div className="profile-actions-bottom">
                  <button type="button" className="btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Log Out
                  </button>

                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setDeleteMsg('');
                      setDeletePassword('');
                      setDeleteConfirmText('');
                    }}
                  >
                    <FaTrashAlt /> Delete Account
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Compact Password & Email Tabs */}
            <div className="settings-right-col">
              <div className="settings-card compact-security-card">
                {/* Switcher Tabs */}
                <div className="security-tabs">
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <FaKey />
                    <span>Change Password</span>
                  </button>
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                  >
                    <FaEnvelope />
                    <span>Change Email</span>
                  </button>
                </div>

                {/* Tab 1: Change Password */}
                {activeTab === 'password' && (
                  <div className="tab-pane">
                    {passMsg.text && (
                      <div className={`settings-alert ${passMsg.type}`}>
                        {passMsg.type === 'success' ? (
                          <FaCheckCircle />
                        ) : (
                          <FaExclamationTriangle />
                        )}
                        <span>{passMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="settings-compact-form">
                      <div className="form-group-compact">
                        <label>Current Password</label>
                        <div className="input-wrap-compact">
                          <input
                            type={showCurrentPass ? 'text' : 'password'}
                            placeholder="Current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="eye-toggle-compact"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                          >
                            {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group-compact">
                        <label>New Password</label>
                        <div className="input-wrap-compact">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            placeholder="New password (min 8 chars, 1 uppercase, 1 symbol)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="eye-toggle-compact"
                            onClick={() => setShowNewPass(!showNewPass)}
                          >
                            {showNewPass ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group-compact">
                        <label>Confirm Password</label>
                        <div className="input-wrap-compact">
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="eye-toggle-compact"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                          >
                            {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      <div className="form-actions-compact">
                        <button
                          type="submit"
                          className="btn-submit-compact"
                          disabled={passLoading}
                        >
                          {passLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab 2: Change Email */}
                {activeTab === 'email' && (
                  <div className="tab-pane">
                    {emailMsg.text && (
                      <div className={`settings-alert ${emailMsg.type}`}>
                        {emailMsg.type === 'success' ? (
                          <FaCheckCircle />
                        ) : (
                          <FaExclamationTriangle />
                        )}
                        <span>{emailMsg.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleRequestEmailChange} className="settings-compact-form">
                      <div className="form-group-compact">
                        <label>New Email Address</label>
                        <div className="input-wrap-compact">
                          <input
                            type="email"
                            placeholder="Enter your new email address"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group-compact">
                        <label>Confirm With Password</label>
                        <div className="input-wrap-compact">
                          <input
                            type={showEmailPass ? 'text' : 'password'}
                            placeholder="Enter password to confirm"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="eye-toggle-compact"
                            onClick={() => setShowEmailPass(!showEmailPass)}
                          >
                            {showEmailPass ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      <div className="form-actions-compact">
                        <button
                          type="submit"
                          className="btn-submit-compact"
                          disabled={emailLoading}
                        >
                          {emailLoading ? 'Sending Link...' : 'Send Verification Link'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="settings-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-badge">
              <FaExclamationTriangle />
            </div>
            <h3>Permanently Delete Account?</h3>
            <p className="modal-description">
              This action is <strong>irreversible</strong>. All your saved anime collection, watch
              statuses, and profile records will be permanently erased.
            </p>

            {deleteMsg && (
              <div className="settings-alert error">
                <FaExclamationTriangle />
                <span>{deleteMsg}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="modal-form">
              <div className="modal-field">
                <label>
                  Type <strong>DELETE</strong> below to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Enter your password:</label>
                <input
                  type="password"
                  placeholder="Your account password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-delete-btn"
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;
