
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: '7 Days Ago', views: 2400, posts: 1 },
  { name: '6 Days Ago', views: 1398, posts: 2 },
  { name: '5 Days Ago', views: 9800, posts: 5 },
  { name: '4 Days Ago', views: 3908, posts: 1 },
  { name: '3 Days Ago', views: 4800, posts: 3 },
  { name: '2 Days Ago', views: 3800, posts: 2 },
  { name: 'Yesterday', views: 4300, posts: 4 },
  { name: 'Today', views: 5400, posts: 2 },
];

const AnalyticsChart: React.FC = () => {
  return (
    <div className="bg-light dark:bg-dark p-6 rounded-lg shadow-md h-96">
      <h3 className="text-lg font-semibold mb-4 text-dark-text dark:text-light-text">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.3)" />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(45, 55, 72, 0.8)',
              borderColor: 'rgba(74, 85, 104, 0.5)',
              color: '#f7fafc',
              borderRadius: '0.5rem',
            }}
            cursor={{ fill: 'rgba(74, 85, 104, 0.1)' }}
          />
          <Legend wrapperStyle={{fontSize: "14px"}} />
          <Line type="monotone" dataKey="views" stroke="#007bff" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="posts" stroke="#6c757d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
