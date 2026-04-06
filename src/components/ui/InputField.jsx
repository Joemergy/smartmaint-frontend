import React from 'react';

const InputField = ({
  as = 'input',
  label,
  hint,
  error,
  id,
  className = '',
  children,
  ...props
}) => {
  const Component = as;

  return (
    <div className={`sm-input-shell ${className}`.trim()}>
      {label && <label htmlFor={id} className="sm-input-label">{label}</label>}
      <Component id={id} className="sm-input-control" {...props}>
        {children}
      </Component>
      {error ? <span className="sm-input-error">{error}</span> : hint ? <span className="sm-input-hint">{hint}</span> : null}
    </div>
  );
};

export default InputField;