import React from 'react';

import './Label.scss';

export default ({ children, className = '', white = false }) => (
  <div className={`${className} label text-left ${white && 'text-white'}`}>
    {children}
  </div>
);
