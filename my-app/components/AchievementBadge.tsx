import React from 'react';
import './AchievementBadge.css';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
  };
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
  return (
    <div className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
      <div className="badge-icon">{achievement.icon}</div>
      <div className="badge-info">
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        {!achievement.unlocked && achievement.progress !== undefined && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${achievement.progress}%` }}
            />
            <span>{achievement.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;