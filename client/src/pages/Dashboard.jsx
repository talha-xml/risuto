import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import DashboardHeader from '../components/DashboardHeader';
import Analytics from '../components/Analytics';
import RecentlyAdded from '../components/RecentlyAdded';
import AIAssistant from '../components/AIAssistant';
import API_URL from '../config/api';
import '../css/pages/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    incomplete: 0,
    completed: 0,
    plan: 0,
    hold: 0,
    dropped: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/anime/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <DashboardHeader />
        <Analytics stats={stats} />
        <RecentlyAdded />
        <AIAssistant />
      </main>
    </>
  );
}
export default Dashboard;
