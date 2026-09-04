import { BrowserRouter, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import './css/Global.css';
import AppRoutes from './routes/Routes';
import CursorTrail from './components/CursorTrail';
import API_URL from './config/api';
import AIAssistant from './components/AIAssistant';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          navigate('/login');
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <>
      <AppRoutes />
      <AIAssistant />
      <CursorTrail />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
