import React from 'react';

const Button = ({
  variant = 'primary',
  size = 'md',
  block = false,
  active = false,
  className = '',
  children,
  ...props
}) => (
  <button
    {...props}
    className={`sm-button sm-button-${variant} sm-button-${size} ${block ? 'sm-button-block' : ''} ${active ? 'is-active' : ''} ${className}`.trim()}
  >
    {children}
  </button>
);

export default Button;