import { useState } from 'react';
import { FaTags, FaChevronDown } from 'react-icons/fa';

import '../css/components/GenreFilter.css';

function GenreFilter({ genre, setGenre }) {
  const [open, setOpen] = useState(false);

  const genres = [
    'All',
    'Action',
    'Adventure',
    'Sci-Fi',
    'Comedy',
    'Drama',
    'Romance',
    'Slice of Life',
    'Isekai',
    'Fantasy',
    'Horror',
    'Thriller',
    'Psychological',
    'Mystery',
    'Sports'
  ];

  const handleSelect = (item) => {
    setGenre(item === 'All' ? '' : item);

    setOpen(false);
  };

  return (
    <div className="genre-filter">
      <label>
        <FaTags />
        Genres
      </label>

      <button className="genre-button" onClick={() => setOpen(!open)}>
        <span>{genre || 'All'}</span>

        <FaChevronDown className={open ? 'rotate' : ''} />
      </button>

      {open && (
        <div className="genre-menu">
          {genres.map((item) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              className={genre === item || (item === 'All' && genre === '') ? 'active' : ''}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenreFilter;
