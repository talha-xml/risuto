import Navbar from '../components/Navbar';
import AddAnimeForm from '../components/AddAnimeForm';

import '../css/pages/AddAnime.css';

function AddAnime() {
  return (
    <>
      <Navbar isLoggedIn={true} />

      <main className="add-anime-page">
        <AddAnimeForm />
      </main>
    </>
  );
}

export default AddAnime;
