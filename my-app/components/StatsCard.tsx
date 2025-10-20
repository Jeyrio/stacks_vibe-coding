import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h4>{title}</h4>
        <p className="stats-value">{value}</p>
        {trend && <span className="stats-trend">{trend}</span>}
      </div>
    </div>
  );
};

export default StatsCard;