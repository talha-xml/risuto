import { useEffect, useState } from 'react';
import API_URL from '../config/api';

import '../css/components/RecentlyAdded.css';

function RecentlyAdded() {
  const [anime, setAnime] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch(`${API_URL}/anime/recent`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        setAnime(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchRecent();
  }, []);

  return (
    <section className="recent">
      <h2>Recently Added</h2>

      {anime.length === 0 ? (
        <div className="empty">No anime added yet.</div>
      ) : (
        <ul className="recent-list">
          {anime.map((item) => (
            <li key={item._id}>{item.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentlyAdded;
