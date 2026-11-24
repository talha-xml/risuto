import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaUser,
  FaKey,
  FaEnvelope,
  FaTrashAlt,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt
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
      // Refresh current user info
      fetchUserProfile();
    } else if (emailStatus === 'expired') {
      setEmailMsg({
        text: 'The email verification link is invalid or has expired. Please try again.',
        type: 'error'
      });
    } else if (emailStatus === 'conflict') {
      setEmailMsg({
        text: 'This email is already in use by another account.',
        type: 'error'
      });
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
          'New password must be at least 8 characters long and include an uppercase letter, a number, and a special character.',
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

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <span className="settings-badge">Account Settings</span>
            <h1>Manage Your Account</h1>
            <p className="settings-subtitle">
              Update your security credentials, email address, or manage your account session.
            </p>
          </div>

          <div className="settings-grid">
            {/* Section 1: Profile Overview */}
            <div className="settings-card profile-card">
              <div className="card-header">
                <div className="card-icon-wrapper">
                  <FaUser />
                </div>
                <div>
                  <h2>Profile Information</h2>
                  <p>Your current active account details</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="profile-item">
                  <span className="profile-label">Full Name</span>
                  <span className="profile-value">{user?.fullName || 'User'}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Email Address</span>
                  <span className="profile-value">{user?.email || 'No email available'}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Account Status</span>
                  <span className="profile-badge verified">
                    <FaCheckCircle /> Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Change Password */}
            <div className="settings-card">
              <div className="card-header">
                <div className="card-icon-wrapper purple">
                  <FaKey />
                </div>
                <div>
                  <h2>Change Password</h2>
                  <p>Keep your account secure with a strong password</p>
                </div>
              </div>

              {passMsg.text && (
                <div className={`settings-alert ${passMsg.type}`}>
                  {passMsg.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <span>{passMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="settings-form">
                <div className="settings-field">
                  <label>Current Password</label>
                  <div className="settings-input-wrapper">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>New Password</label>
                  <div className="settings-input-wrapper">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="Enter new password (min. 8 chars, 1 uppercase, 1 symbol)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <div className="settings-input-wrapper">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="save-btn" disabled={passLoading}>
                    {passLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Section 3: Change Email */}
            <div className="settings-card">
              <div className="card-header">
                <div className="card-icon-wrapper blue">
                  <FaEnvelope />
                </div>
                <div>
                  <h2>Change Email Address</h2>
                  <p>A verification link will be sent to confirm your new email</p>
                </div>
              </div>

              {emailMsg.text && (
                <div className={`settings-alert ${emailMsg.type}`}>
                  {emailMsg.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <span>{emailMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleRequestEmailChange} className="settings-form">
                <div className="settings-field">
                  <label>New Email Address</label>
                  <div className="settings-input-wrapper">
                    <input
                      type="email"
                      placeholder="Enter new email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <label>Current Password (for verification)</label>
                  <div className="settings-input-wrapper">
                    <input
                      type={showEmailPass ? 'text' : 'password'}
                      placeholder="Enter password to confirm request"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowEmailPass(!showEmailPass)}
                    >
                      {showEmailPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="settings-form-actions">
                  <button type="submit" className="save-btn" disabled={emailLoading}>
                    {emailLoading ? 'Sending Verification Link...' : 'Send Verification Link'}
                  </button>
                </div>
              </form>
            </div>

            {/* Section 4: Session & Danger Zone */}
            <div className="settings-card danger-card">
              <div className="card-header">
                <div className="card-icon-wrapper red">
                  <FaShieldAlt />
                </div>
                <div>
                  <h2>Session & Danger Zone</h2>
                  <p>Sign out of your session or permanently remove your account</p>
                </div>
              </div>

              <div className="danger-zone-actions">
                <div className="danger-action-row">
                  <div>
                    <h4>Log Out of Risuto</h4>
                    <p>Securely end your current session on this device.</p>
                  </div>
                  <button type="button" className="logout-action-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Log Out
                  </button>
                </div>

                <div className="divider"></div>

                <div className="danger-action-row">
                  <div>
                    <h4 className="danger-text">Delete Account</h4>
                    <p>
                      Permanently delete your profile and all saved anime history. This cannot be
                      undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="delete-action-btn"
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
                  {deleteLoading ? 'Deleting Account...' : 'Yes, Delete My Account'}
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

