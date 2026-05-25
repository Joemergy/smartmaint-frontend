import React from 'react';

const Card = ({
  as: Component = 'div',
  variant = '',
  padding = '',
  className = '',
  children,
  ...props
}) => (
  <Component {...props} className={`sm-card ${variant ? `sm-card-${variant}` : ''} ${padding ? `sm-card-padding-${padding}` : ''} ${className}`.trim()}>
    {children}
  </Component>
);

export default Card;