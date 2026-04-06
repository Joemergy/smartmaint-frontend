import React from 'react';

const resolveVariant = (tone) => {
  switch (tone) {
    case 'success':
      return 'sm-badge-success';
    case 'warning':
      return 'sm-badge-warning';
    case 'danger':
      return 'sm-badge-danger';
    default:
      return 'sm-badge-info';
  }
};

const Badge = ({ tone = 'info', className = '', children }) => (
  <span className={`sm-badge ${resolveVariant(tone)} ${className}`.trim()}>{children}</span>
);

export default Badge;