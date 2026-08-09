import { Link } from 'react-router-dom';
import { FaHome, FaGhost } from 'react-icons/fa';

import notFoundBg from '../assets/images/404.jpg';

import '../css/pages/NotFound.css';

function NotFound() {
  return (
    <main
      className="not-found-page"
      style={{
        '--not-found-bg': `url(${notFoundBg})`
      }}
    >
      <div className="not-found-overlay"></div>

      <div className="not-found-content">
        <div className="not-found-icon">
          <FaGhost />
        </div>

        <h1>404</h1>

        <h2>Oops! This page got lost.</h2>

        <p>
          Looks like you've wandered into an empty part of the anime world. The page you're looking
          for doesn't exist.
        </p>

        <Link to="/" className="not-found-home">
          <FaHome />
          Back to Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
