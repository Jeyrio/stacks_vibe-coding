import React from 'react';
import './PerformanceChart.css';

interface PerformanceChartProps {
  data: any;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  // Simple chart implementation
  // In production, use recharts or chart.js
  
  const mockData = [
    { date: 'Mon', profit: 12 },
    { date: 'Tue', profit: -5 },
    { date: 'Wed', profit: 18 },
    { date: 'Thu', profit: 8 },
    { date: 'Fri', profit: -3 },
    { date: 'Sat', profit: 25 },
    { date: 'Sun', profit: 15 },
  ];

  const maxValue = Math.max(...mockData.map((d) => Math.abs(d.profit)));

  return (
    <div className="performance-chart">
      <h3>7-Day Performance</h3>
      <div className="chart-container">
        {mockData.map((item, index) => (
          <div key={index} className="chart-bar">
            <div
              className={`bar ${item.profit >= 0 ? 'positive' : 'negative'}`}
              style={{
                height: `${(Math.abs(item.profit) / maxValue) * 100}%`,
              }}
            />
            <span className="bar-label">{item.date}</span>
            <span className="bar-value">
              {item.profit >= 0 ? '+' : ''}
              {item.profit} STX
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceChart;