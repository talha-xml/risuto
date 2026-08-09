import { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

import '../css/components/CustomDropdown.css';

function CustomDropdown({ label, icon, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <label>
        {icon}
        {label}
      </label>

      <button className="dropdown-button" onClick={() => setOpen(!open)}>
        <span>{value}</span>

        <FaChevronDown className={open ? 'rotate' : ''} />
      </button>

      {open && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <button
              key={option}
              className="dropdown-item"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
