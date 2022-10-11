import React from 'react'

import './InfoCard.scss'

const InfoCard = () => {
  return (
    <div className="info-card flex p-4">
      <div className="flex-grow-1 flex flex-column mb-4">
        <div>Events created</div>
        <div className="mt-4 text-white text-6xl">6425</div>
      </div>
      <div className="flex-grow-1 flex flex-column">
        <div>Events created</div>
        <div className="mt-4 text-white text-6xl">6425</div>
      </div>
    </div>
  )
}

export default InfoCard
