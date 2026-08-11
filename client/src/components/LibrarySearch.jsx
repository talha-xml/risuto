import { FaSearch } from 'react-icons/fa';
import '../css/components/LibrarySearch.css';

function LibrarySearch({ search, setSearch }) {
  return (
    <div className="library-search">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search by title or genre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default LibrarySearch;
