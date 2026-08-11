import '../css/pages/About.css';
import {
  FaBookOpen,
  FaBullseye,
  FaCode,
  FaHeart,
  FaLeaf,
  FaCss3Alt,
  FaNodeJs,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaCompass,
  FaPauseCircle,
  FaTag,
  FaPlus
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { SiReact, SiExpress, SiMongodb } from 'react-icons/si';
import { PiFlowerLotusBold } from 'react-icons/pi';

function About() {
  return (
    <>
      <Navbar />
      <section className="about-page">
        <div className="about-container">
          {/* Header */}

          <span className="about-japanese">リスト • Risuto</span>
          <h1>About Risuto</h1>
          <p className="about-subtitle">
            Every anime tells a story. Risuto exists so you never lose yours.
          </p>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>

          {/* Story */}

          <section className="about-section">
            <h2>
              <FaBookOpen className="section-icon" />
              My Story
            </h2>
            <p>
              Like many anime fans, I often found myself forgetting where I stopped watching, which
              anime I planned to watch next, or whether I had already completed a series months ago.
            </p>
            <p>
              Although there are many anime tracking websites available, I wanted something cleaner,
              faster, and more enjoyable to use. I wanted an application that focused on simplicity
              while still feeling modern and premium.
            </p>
            <p>
              Risuto started as a personal project for myself, but while building it I realized that
              many anime fans probably experience the same problem. That's when it became more than
              just another project.
            </p>
          </section>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>

          {/* Mission */}

          <section className="about-section">
            <h2>
              <FaBullseye className="section-icon" />
              My Mission
            </h2>
            <p>
              My mission is simple: build a beautiful anime tracker that makes organizing your anime
              library enjoyable instead of feeling like a chore.
            </p>
            <p>
              Whether you watch one anime every few months or follow every seasonal release, Risuto
              should become a place where every memory, every favorite character, and every
              completed journey can stay organized forever.
            </p>
          </section>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>

          {/* Why Risuto */}

          <section className="about-section">
            <h2>
              <FaLeaf className="section-icon" />
              Why "Risuto"?
            </h2>
            <p>"Risuto" (リスト) is the Japanese pronunciation of the English word "List."</p>
            <p>
              Since this application is all about creating and managing your personal anime list,
              the name felt simple, memorable, and closely connected to Japanese culture while
              remaining easy for everyone to remember.
            </p>
          </section>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>
          <section className="about-section">
            <h2>
              <FaCompass className="section-icon" />
              What You Can Do
            </h2>
            <p>
              Risuto is more than just another anime tracker. It is your personal anime library
              where every series, movie, and memorable journey can be organized exactly the way you
              want.
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <FaBook className="feature-icon" />
                <h3>Build Your Library</h3>
                <p>
                  Create your own collection of anime and keep everything organized in one place.
                </p>
              </div>
              <div className="feature-card">
                <FaCheckCircle className="feature-icon" />
                <h3>Track Progress</h3>
                <p>Mark anime as Watched, Watching, Plan to Watch, or On Hold.</p>
              </div>
              <div className="feature-card">
                <FaTag className="feature-icon" />
                <h3>Priority System</h3>
                <p>Organize your watchlist with High, Normal, or Low priority.</p>
              </div>
            </div>
          </section>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>
          <section className="about-section">
            <h2>
              <FaClock className="section-icon" />
              Your Anime Journey
            </h2>
            <p>
              Every anime you add becomes part of your own journey. Risuto helps you remember where
              you left off, what comes next, and the stories that stayed with you.
            </p>
            <div className="timeline">
              <div className="timeline-item">
                <FaPlus />
                <span>Add Anime</span>
              </div>
              <div className="timeline-item">
                <FaClock />
                <span>Start Watching</span>
              </div>
              <div className="timeline-item">
                <FaPauseCircle />
                <span>Continue Later</span>
              </div>
              <div className="timeline-item">
                <FaCheckCircle />
                <span>Complete Journey</span>
              </div>
            </div>
          </section>
          {/* Quote */}

          <section className="quote-section">
            <h3>物語は終わっても、思い出は残る。</h3>
            <span>Monogatari wa owatte mo, omoide wa nokoru.</span>
            <p>Even when the story ends, the memories remain.</p>
          </section>

          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>

          {/* Crafted With */}

          <section className="about-section">
            <h2>
              <FaCode className="section-icon" />
              Crafted With
            </h2>
            <div className="tech-grid">
              <div className="tech-card">
                <SiReact />
                <span>React</span>
              </div>
              <div className="tech-card">
                <FaNodeJs />
                <span>Node.js</span>
              </div>
              <div className="tech-card">
                <SiExpress />
                <span>Express</span>
              </div>
              <div className="tech-card">
                <SiMongodb />
                <span>MongoDB</span>
              </div>
              <div className="tech-card">
                <FaCss3Alt />
                <span>CSS3</span>
              </div>
            </div>
          </section>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>

          {/* Creator */}

          <section className="creator-section">
            <h2>
              <FaHeart className="section-icon" />
              From the Creator
            </h2>
            <p>Thank you for taking the time to visit Risuto.</p>
            <p>
              This project started as a simple idea to solve a personal problem, but it has
              gradually become a place where I can improve my Full Stack Development skills while
              building something meaningful for fellow anime fans.
            </p>
            <p>I hope you enjoy exploring Risuto as much as I enjoy creating it.</p>
          </section>
          <div className="section-divider">
            <PiFlowerLotusBold />
          </div>

          {/* Footer */}

          <footer className="about-footer">
            <h2>
              Every anime tells a story.
              <br />
              Risuto helps you remember yours.
            </h2>
            <p>Created with passion by</p>
            <h3>Muhammad Talha Faizan</h3>
            <span>Full Stack Developer • Anime Enthusiast</span>
          </footer>
        </div>
      </section>
    </>
  );
}

export default About;
