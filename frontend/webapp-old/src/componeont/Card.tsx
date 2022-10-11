import React from 'react';
import './Card.scss';

export default ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string | undefined;
}) => {
  return <div className={`${className} card`}>{children}</div>;
};
