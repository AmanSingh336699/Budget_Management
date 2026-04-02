import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-shimmer rounded-md ${className}`}
      aria-busy="true"
      aria-label="Loading..."
      {...props}
    />
  );
};

export default Skeleton;
