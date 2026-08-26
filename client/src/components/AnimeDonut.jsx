import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import '../css/components/AnimeDonut.css';

const COLORS = [
  '#4ADE80', // Completed
  '#38BDF8', // Watching
  '#FB923C', // Incomplete
  '#8B5CF6', // Plan to Watch
  '#FACC15', // On Hold
  '#EF4444' // Dropped
];

function AnimeDonut({ stats }) {
  const data = [
    {
      name: 'Completed',
      value: stats.completed || 0
    },
    {
      name: 'Watching',
      value: stats.watching || 0
    },
    {
      name: 'Incomplete',
      value: stats.incomplete || 0
    },
    {
      name: 'Plan to Watch',
      value: stats.plan || 0
    },
    {
      name: 'On Hold',
      value: stats.hold || 0
    },
    {
      name: 'Dropped',
      value: stats.dropped || 0
    }
  ];

  return (
    <div className="donut-card">
      <h2>Your Collection</h2>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={90}
              outerRadius={135}
              paddingAngle={4}
              stroke="none"
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="chart-center">
          <h1>{stats.total || 0}</h1>
          <span>Total Anime</span>
        </div>
      </div>
    </div>
  );
}

export default AnimeDonut;
