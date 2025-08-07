import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const spinnerSize = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '200px' }}>
      <div className={`spinner-border text-primary ${spinnerSize[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2 text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;