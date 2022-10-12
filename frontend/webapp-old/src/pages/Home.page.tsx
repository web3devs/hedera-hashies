import { Button } from 'primereact/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import InfoCard from '../componeont/home/InfoCard'
import './Home.scss'
export default () => {
  const navigate = useNavigate()
  return (
    <div className="home">
      <div className="text-6xl text-white mb-4 font-normal">
        Proof of attendance
      </div>
      <div className="text-6xl text-primary font-normal mt-4 mb-4">#hashie</div>
      <div className="text mb-4">
        Create events for your communities and prove that they were there.
      </div>
      <Button
        label="Create an Event"
        className="create-event mb-8"
        onClick={() => navigate('/add-event')}
      />
      <InfoCard />
    </div>
  )
}
