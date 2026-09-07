import AnimeDonut from './AnimeDonut';
import StatusBreakdown from './StatusBreakdown';
import RecentlyAdded from './RecentlyAdded';
import '../css/components/Analytics.css';

function Analytics({ stats }) {
  return (
    <section className="analytics">
      <div className="collection-card">
        <AnimeDonut stats={stats} />
        <StatusBreakdown stats={stats} />
      </div>
      <RecentlyAdded />
    </section>
  );
}
export default Analytics;
