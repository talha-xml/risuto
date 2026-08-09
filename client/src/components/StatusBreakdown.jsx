import '../css/components/StatusBreakdown.css';

function StatusBreakdown({ stats }) {
  const total = stats.total || 0;

  const statuses = [
    {
      label: 'Completed',
      value: stats.completed,
      color: '#4ADE80'
    },
    {
      label: 'Watching',
      value: stats.watching,
      color: '#38BDF8'
    },
    {
      label: 'Incomplete',
      value: stats.incomplete,
      color: '#FB923C'
    },
    {
      label: 'Plan to Watch',
      value: stats.plan,
      color: '#8B5CF6'
    },
    {
      label: 'On Hold',
      value: stats.hold,
      color: '#FACC15'
    },
    {
      label: 'Dropped',
      value: stats.dropped,
      color: '#EF4444'
    }
  ];

  return (
    <div className="status-card">
      <h2>Anime Breakdown</h2>

      {statuses.map((status) => {
        const percentage = total === 0 ? 0 : Math.round((status.value / total) * 100);

        return (
          <div className="status-item" key={status.label}>
            <div className="status-header">
              <span>{status.label}</span>

              <span>{status.value}</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${percentage}%`,
                  background: status.color
                }}
              />
            </div>

            <small>{percentage}% of your collection</small>
          </div>
        );
      })}
    </div>
  );
}

export default StatusBreakdown;
