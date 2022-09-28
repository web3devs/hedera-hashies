import React from 'react';

import './InfoCard.scss';

export default () => {
  return (
    <div className="info-card grid grid-nogutter p-4">
      <div className="col-6 flex flex-column">
        <div>Events created</div>
        <div className="mt-4 text-white text-6xl">6425</div>
      </div>
      <div className="col-6 flex flex-column">
        <div>Events created</div>
        <div className="mt-4 text-white text-6xl">6425</div>
      </div>
    </div>
  );
};
