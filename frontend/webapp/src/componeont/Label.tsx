import React from 'react';

import './Label.scss';

export default ({ children, className }) => (
  <div className={`${className} label text-left`}>{children}</div>
);
