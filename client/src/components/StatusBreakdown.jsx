import '../css/components/StatusBreakdown.css';

function StatusBreakdown({ stats }) {
  const total = stats.total || 0;

  const statuses = [
    {
      label: 'Completed',
      value: stats.completed || 0,
      color: '#4ADE80',
      position: 'completed'
    },
    {
      label: 'Watching',
      value: stats.watching || 0,
      color: '#38BDF8',
      position: 'watching'
    },
    {
      label: 'Incomplete',
      value: stats.incomplete || 0,
      color: '#FB923C',
      position: 'incomplete'
    },
    {
      label: 'Plan to Watch',
      value: stats.plan || 0,
      color: '#8B5CF6',
      position: 'plan'
    },
    {
      label: 'On Hold',
      value: stats.hold || 0,
      color: '#FACC15',
      position: 'hold'
    },
    {
      label: 'Dropped',
      value: stats.dropped || 0,
      color: '#EF4444',
      position: 'dropped'
    }
  ];

  return (
    <div className="status-card">
      <h2>Anime Breakdown</h2>

      <div className="status-radial">
        {statuses.map((status) => {
          const percentage = total === 0 ? 0 : Math.round((status.value / total) * 100);

          return (
            <div
              className={`status-node ${status.position}`}
              key={status.label}
              style={{ '--status-color': status.color }}
            >
              <div className="status-node-label">
                <span className="status-dot" />
                <span>{status.label}</span>
              </div>

              <div className="status-node-value">
                {status.value}
                <small>{percentage}%</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusBreakdown;
