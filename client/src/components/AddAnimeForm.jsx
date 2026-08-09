import {
  FaBookOpen,
  FaStickyNote,
  FaEye,
  FaFlag,
  FaTags,
  FaHeart,
  FaExclamationTriangle
} from 'react-icons/fa';

import { useState } from 'react';
import GenreSelector from './GenreSelector';
import CustomDropdown from './CustomDropdown';
import API_URL from '../config/api';
import '../css/components/AddAnimeForm.css';

function AddAnimeForm({ mode = 'add', anime = null, onSuccess }) {
  const [title, setTitle] = useState(anime?.title || '');
  const [notes, setNotes] = useState(anime?.notes || '');
  const [status, setStatus] = useState(anime?.status || 'Plan to Watch');
  const [priority, setPriority] = useState(anime?.priority || 'Normal');
  const [genres, setGenres] = useState(anime?.genres || []);
  const [favorite, setFavorite] = useState(anime?.favorite || false);
  const [mature, setMature] = useState(anime?.mature || false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const clearForm = () => {
    setTitle('');
    setNotes('');
    setStatus('Plan to Watch');
    setPriority('Normal');
    setGenres([]);
    setFavorite(false);
    setMature(false);
  };

  const handleSubmit = async () => {
    setMessage('');
    setMessageType('');
    if (!title.trim()) {
      setMessage('Please enter an anime title.');
      setMessageType('error');
      return;
    }
    if (genres.length === 0) {
      setMessage('Please select at least one genre.');
      setMessageType('error');
      return;
    }
    try {
      const response = await fetch(
        mode === 'edit' ? `${API_URL}/anime/${anime._id}` : `${API_URL}/anime`,
        {
          method: mode === 'edit' ? 'PUT' : 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },

          body: JSON.stringify({
            title,
            notes,
            status,
            priority,
            genres,
            favorite,
            mature
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setMessageType('error');
        return;
      }
      setMessage(mode === 'edit' ? 'Anime updated successfully!' : 'Anime added successfully!');

      setMessageType('success');

      if (mode === 'add') {
        clearForm();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.log(error);
      setMessage('Unable to connect to the server.');
      setMessageType('error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/anime/${anime._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setMessageType('error');
        return;
      }

      setMessage('Anime deleted successfully!');
      setMessageType('success');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.log(error);
      setMessage('Unable to delete anime.');
      setMessageType('error');
    }
  };

  return (
    <>
      <section className="anime-form-container">
        <div className="anime-form">
          <h1>{mode === 'add' ? 'Add to your collection' : '✏ Edit Anime Details'}</h1>

          <p>{mode === 'add' ? 'So, Whats Cookin?' : 'Update the information for this anime.'}</p>

          <div className="anime-details">
            {/* LEFT */}

            <div className="left-fields">
              <div className="form-group">
                <label>
                  <FaBookOpen />
                  What's the Title *
                </label>

                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="form-group">
                <label>
                  <FaStickyNote />
                  Personal Notes (Optional)
                </label>

                <textarea
                  placeholder="Write anything you'd like to remember about this anime..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {message && <p className={`auth-${messageType}`}>{message}</p>}

              <div className="form-buttons">
                <button className="save-anime-btn" onClick={handleSubmit}>
                  {mode === 'add' ? 'Gotcha' : 'Save Changes'}
                </button>

                {mode === 'edit' && (
                  <button className="delete-anime-btn" onClick={() => setShowDeleteConfirm(true)}>
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT */}

            <div className="right-fields">
              {/* Status + Priority */}

              <div className="top-row">
                <div className="mini-card">
                  <CustomDropdown
                    label="Status"
                    icon={<FaEye />}
                    value={status}
                    onChange={setStatus}
                    options={[
                      'Plan to Watch',
                      'Watching',
                      'Incomplete',
                      'Completed',
                      'On Hold',
                      'Dropped'
                    ]}
                  />
                </div>

                <div className="mini-card">
                  <CustomDropdown
                    label="Priority"
                    icon={<FaFlag />}
                    value={priority}
                    onChange={setPriority}
                    options={['Low', 'Normal', 'High']}
                  />
                </div>
              </div>

              {/* Genres */}

              <div className="mini-card">
                <label>
                  <FaTags />
                  Genres *
                </label>

                <GenreSelector selectedGenres={genres} setSelectedGenres={setGenres} />
              </div>

              {/* Toggles */}

              <div className="toggle-row">
                <div className="toggle-card">
                  <div className="toggle-title">
                    <FaHeart />
                    Favorite
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={favorite}
                      onChange={(e) => setFavorite(e.target.checked)}
                    />

                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-card">
                  <div className="toggle-title">
                    <FaExclamationTriangle />
                    Mature
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={mature}
                      onChange={(e) => setMature(e.target.checked)}
                    />

                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DELETE CONFIRMATION */}

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-box">
            <h2>Delete Anime?</h2>

            <p>
              Are you sure you want to delete
              <strong> {anime.title}</strong>?
            </p>

            <p className="warning-text">This action cannot be undone.</p>

            <div className="delete-actions">
              <button className="cancel-delete" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>

              <button className="confirm-delete" onClick={handleDelete}>
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default AddAnimeForm;
