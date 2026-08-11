import '../css/components/GenreSelector.css';

const genres = [
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

function GenreSelector({ selectedGenres, setSelectedGenres }) {
  function toggleGenre(genre) {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  }

  return (
    <div className="genre-selector">
      {genres.map((genre) => (
        <button
          key={genre}
          type="button"
          className={selectedGenres.includes(genre) ? 'genre-pill active' : 'genre-pill'}
          onClick={() => toggleGenre(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
export default GenreSelector;
