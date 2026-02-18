import React from 'react';

const getColor = (prob: number) => {
  if (prob < 0.2) return '#EF4444';
  if (prob < 0.4) return '#F97316';
  if (prob < 0.6) return '#EAB308';
  if (prob < 0.8) return '#22C55E';
  return '#3B82F6';
};

export const ProbabilityBadge: React.FC<{ probability: number }> = ({ probability }) => {
  return (
    <span
      className="px-2 py-1 rounded-full text-white text-xs font-medium"
      style={{ backgroundColor: getColor(probability) }}
    >
      {Math.round(probability * 100)}%
    </span>
  );
};