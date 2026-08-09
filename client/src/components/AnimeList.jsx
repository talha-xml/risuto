import { useState } from 'react';

import AnimeRow from './AnimeRow';
import AnimeModal from './AnimeModal';

import '../css/components/AnimeList.css';

function AnimeList({
  anime,
  search,
  status,
  priority,
  genre,
  sort,
  favoritesOnly,
  currentPage,
  setCurrentPage,
  animePerPage,
  refreshAnime
}) {
  const [selectedAnime, setSelectedAnime] = useState(null);

  // ===========================
  // FILTERING
  // ===========================

  const filteredAnime = anime.filter((item) => {
    if (favoritesOnly && !item.favorite) {
      return false;
    }

    const query = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.genres.some((g) => g.toLowerCase().includes(query));

    const matchesStatus = status === '' || status === 'All Status' || item.status === status;

    const matchesPriority =
      priority === '' || priority === 'All Priority' || item.priority === priority;

    const matchesGenre = genre === '' || genre === 'All Genres' || item.genres.includes(genre);

    return matchesSearch && matchesStatus && matchesPriority && matchesGenre;
  });

  // ===========================
  // SORTING
  // ===========================

  let sortedAnime = [...filteredAnime];

  switch (sort) {
    case 'Title A-Z':
      sortedAnime.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case 'Priority':
      sortedAnime.sort((a, b) => {
        const order = {
          High: 3,
          Normal: 2,
          Low: 1
        };

        return order[b.priority] - order[a.priority];
      });
      break;

    case 'Status':
      sortedAnime.sort((a, b) => a.status.localeCompare(b.status));
      break;

    default:
      sortedAnime.sort((a, b) => a.title.localeCompare(b.title));
  }

  // ===========================
  // PAGINATION
  // ===========================

  const totalPages = Math.max(1, Math.ceil(sortedAnime.length / animePerPage));

  const startIndex = (currentPage - 1) * animePerPage;

  const paginatedAnime = sortedAnime.slice(startIndex, startIndex + animePerPage);

  // ===========================
  // GROUPING
  // ===========================

  const groupedAnime = paginatedAnime.reduce((groups, item) => {
    const letter = item.title[0].toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    }

    groups[letter].push(item);

    return groups;
  }, {});

  return (
    <section className="anime-list">
      {Object.keys(groupedAnime).map((letter) => (
        <div key={letter} className="letter-group">
          <h2 className="letter-heading">{letter}</h2>

          {groupedAnime[letter].map((anime) => (
            <AnimeRow key={anime._id} anime={anime} onClick={setSelectedAnime} />
          ))}
        </div>
      ))}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          refreshAnime={refreshAnime}
        />
      )}
    </section>
  );
}
export default AnimeList;
