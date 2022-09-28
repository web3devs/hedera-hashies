import React from 'react';
import './Card.scss';

export default ({ children, classNames }) => {
  return <div className={`${classNames} card`}>{children}</div>;
};
