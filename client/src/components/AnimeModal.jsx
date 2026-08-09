import { FaTimes } from 'react-icons/fa';
import AddAnimeForm from './AddAnimeForm';

import '../css/components/AnimeModal.css';

function AnimeModal({ anime, onClose, refreshAnime }) {
  const onSuccess = () => {
    refreshAnime();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>

        <AddAnimeForm mode="edit" anime={anime} onSuccess={onSuccess} />
      </div>
    </div>
  );
}

export default AnimeModal;
