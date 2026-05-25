import React from 'react';

const Modal = ({ title, subtitle, children, actions, onClose }) => (
  <div className="sm-modal-overlay" onClick={onClose} role="presentation">
    <div className="sm-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sm-modal-header">
        {title ? <h2 className="sm-modal-title">{title}</h2> : null}
        {subtitle ? <p className="sm-section-copy">{subtitle}</p> : null}
      </div>
      <div className="sm-modal-body">{children}</div>
      {actions ? <div className="sm-modal-actions">{actions}</div> : null}
    </div>
  </div>
);

export default Modal;