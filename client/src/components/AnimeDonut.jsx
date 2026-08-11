import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../css/components/AnimeDonut.css';

const COLORS = [
  '#4ADE80', // Completed
  '#8B5CF6', // Plan
  '#FACC15', // On Hold
  '#EF4444' // Dropped
];

function AnimeDonut({ stats }) {
  const data = [
    {
      name: 'Completed',
      value: stats.completed
    },
    {
      name: 'Plan',
      value: stats.plan
    },
    {
      name: 'On Hold',
      value: stats.hold
    },
    {
      name: 'Dropped',
      value: stats.dropped
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
              innerRadius={95}
              outerRadius={125}
              paddingAngle={4}
              stroke="none"
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="chart-center">
          <h1>{stats.total}</h1>

          <span>Total Anime</span>
        </div>
      </div>
    </div>
  );
}
export default AnimeDonut;
