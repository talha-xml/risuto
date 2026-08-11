import AnimeDonut from './AnimeDonut';
import StatusBreakdown from './StatusBreakdown';
import '../css/components/Analytics.css';

function Analytics({ stats }) {
  return (
    <section className="analytics">
      <AnimeDonut stats={stats} />
      <StatusBreakdown stats={stats} />
    </section>
  );
}

export default Analytics;
