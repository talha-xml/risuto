import { FaFlag, FaEye, FaSort, FaHeart } from 'react-icons/fa';
import CustomDropdown from './CustomDropdown';
import GenreFilter from './GenreFilter';
import '../css/components/LibraryFilters.css';

function LibraryFilters({
  status,
  setStatus,

  priority,
  setPriority,

  genre,
  setGenre,

  sort,
  setSort,

  favoritesOnly,
  setFavoritesOnly
}) {
  return (
    <div className="library-filters">
      {/* Status */}

      <div className="filter-card">
        <CustomDropdown
          label="Status"
          icon={<FaEye />}
          value={status || 'All Status'}
          onChange={setStatus}
          options={[
            'All Status',
            'Plan to Watch',
            'Watching',
            'Incomplete',
            'Completed',
            'On Hold',
            'Dropped'
          ]}
        />
      </div>

      {/* Priority (Enable whenever you want) */}

      <div className="filter-card">
        <CustomDropdown
          label="Priority"
          icon={<FaFlag />}
          value={priority || 'All Priority'}
          onChange={setPriority}
          options={['All Priority', 'Low', 'Normal', 'High']}
        />
      </div>

      {/* Sort */}

      <div className="filter-card">
        <CustomDropdown
          label="Sort"
          icon={<FaSort />}
          value={sort || 'Sort By'}
          onChange={setSort}
          options={['Sort By', 'Title A-Z', 'Priority', 'Status']}
        />
      </div>

      {/* Genre */}

      <div className="filter-card">
        <GenreFilter genre={genre} setGenre={setGenre} />
      </div>

      {/* Favorites */}

      <div className="filter-card">
        <label className="favorite-label">
          <FaHeart />
          Favorites
        </label>

        <div className="favorite-toggle">
          <span>Favorites Only</span>

          <button
            type="button"
            className={`toggle-switch ${favoritesOnly ? 'active' : ''}`}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            <span className="toggle-knob"></span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LibraryFilters;
