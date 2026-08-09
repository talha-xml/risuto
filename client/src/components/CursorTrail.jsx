import { useEffect, useRef } from 'react';
import '../css/components/CursorTrail.css';

function CursorTrail() {
  const cursor = useRef(null);

  useEffect(() => {
    function move(e) {
      if (cursor.current) {
        cursor.current.style.left = `${e.clientX}px`;
        cursor.current.style.top = `${e.clientY}px`;
      }
    }

    window.addEventListener('mousemove', move);

    return () => {
      window.removeEventListener('mousemove', move);
    };
  }, []);

  return (
    <div ref={cursor} className="cursor-trail">
      <div className="cursor-core"></div>
    </div>
  );
}

export default CursorTrail;
