import { FaExclamationTriangle } from 'react-icons/fa';

import '../css/components/AnimeRow.css';

function AnimeRow({ anime, onClick }) {
  return (
    <div className="anime-row" onClick={() => onClick(anime)}>
      {anime.favorite && <div className="favorite-ribbon">Cherished</div>}

      <div className="anime-main">
        <div className="anime-top">
          <h3>{anime.title}</h3>

          <span className={`status ${anime.status.toLowerCase().replaceAll(' ', '-')}`}>
            {anime.status}
          </span>
        </div>

        <div className="anime-bottom">
          <div className="anime-genres">
            {anime.genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>

          <div className="anime-meta">
            {anime.priority !== 'Normal' && (
              <span className={`priority ${anime.priority.toLowerCase()}`}>
                {anime.priority === 'High' && '▲ '}
                {anime.priority === 'Low' && '▼ '}
                {anime.priority}
              </span>
            )}

            {anime.mature && <FaExclamationTriangle className="mature-icon" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeRow;
