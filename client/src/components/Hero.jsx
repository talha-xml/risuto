import { Link } from 'react-router-dom';
import heroBg from '../assets/images/hero.jpg';

function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(5, 10, 25, 0.25),
            rgba(5, 10, 25, 0.35)
          ),
          url(${heroBg})
        `
      }}
    >
      {/* Sakura petals */}
      <div className="petals">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index}></span>
        ))}
      </div>

      {/* Hero content */}
      <div className="hero-content">
        <h1>
          Your Anime Journey,
          <br />
          Beautifully Remembered.
        </h1>
        <p>
          Keep track of every story you've loved, every character you've cherished, and every
          adventure you've completed.
        </p>
        <Link to="/about" className="hero-btn">
          Explore More
        </Link>
      </div>
    </section>
  );
}

export default Hero;
