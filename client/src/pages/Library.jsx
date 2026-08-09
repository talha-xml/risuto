import { useEffect, useMemo, useState } from 'react';
import { FaRedoAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import LibrarySearch from '../components/LibrarySearch';
import LibraryFilters from '../components/LibraryFilters';
import AnimeList from '../components/AnimeList';
import AIAssistant from '../components/AIAssistant';

import API_URL from '../config/api';

import '../css/pages/Library.css';

function Library() {
  const [anime, setAnime] = useState([]);

  const [search, setSearch] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ANIME_PER_PAGE = 30;

  // Reset page whenever filters change

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, priority, genre, sort, favoritesOnly]);

  // Fetch user's anime
  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setGenre('');
    setSort('');
    setFavoritesOnly(false);
  };

  const fetchAnime = async () => {
    try {
      const response = await fetch(`${API_URL}/anime`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message);
        return;
      }

      setAnime(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);
  // Shooting stars

  const stars = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 20}s`,
        duration: `${12 + Math.random() * 10}s`,
        tail: `${60 + Math.random() * 80}px`,
        size: `${2 + Math.random() * 2}px`
      })),
    []
  );

  return (
    <>
      <Navbar />

      <main className="library-page">
        <div className="shooting-stars">
          {stars.map((star, index) => (
            <span
              key={index}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
                animationDuration: star.duration,
                '--tail-length': star.tail,
                '--star-size': star.size
              }}
            />
          ))}
        </div>

        <div className="library-container">
          <div className="library-header">
            <h1>Your Anime Journey</h1>

            <p>Every story you've watched, every adventure waiting to begin.</p>
          </div>

          <div className="library-search-row">
            <LibrarySearch search={search} setSearch={setSearch} />

            <button
              type="button"
              className="reset-filters-btn"
              onClick={resetFilters}
              title="Reset filters"
              aria-label="Reset filters"
            >
              <FaRedoAlt />
            </button>
          </div>
          <AIAssistant />

          <LibraryFilters
            status={status}
            setStatus={setStatus}
            priority={priority}
            setPriority={setPriority}
            genre={genre}
            setGenre={setGenre}
            sort={sort}
            setSort={setSort}
            favoritesOnly={favoritesOnly}
            setFavoritesOnly={setFavoritesOnly}
            setSearch={setSearch}
          />

          <AnimeList
            anime={anime}
            search={search}
            status={status}
            priority={priority}
            genre={genre}
            sort={sort}
            favoritesOnly={favoritesOnly}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            animePerPage={ANIME_PER_PAGE}
            refreshAnime={fetchAnime}
          />
        </div>
      </main>
    </>
  );
}

export default Library;
