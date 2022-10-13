import { Button } from 'primereact/button'
import React from 'react'
import { useNavigate } from 'react-router-dom'
// import InfoCard from '../components/home/InfoCard'
import { useHeaderAccess } from '../context/HederaProvider'

import './Home.scss'
const Home = () => {
  const navigate = useNavigate()
  const { isConnected, connect } = useHeaderAccess()

  const handleConnect = async () => {
    connect()
  }

  return (
    <div className="home">
      <div className="text-6xl text-white mb-4 font-normal">
        Proof of attendance
      </div>
      <div className="text-6xl text-primary font-normal mt-4 mb-4">#hashie</div>
      <div className="text mb-4">
        Create events for your communities and prove that they were there.
      </div>
      {isConnected ? (
        <Button
          label="Create an Event"
          className="create-event mb-8"
          onClick={() => navigate('/add-event')}
        />
      ) : (
        <Button
          label="Connect Wallet"
          className="create-event mb-8"
          onClick={handleConnect}
        />
      )}
      {/* <InfoCard /> */}
    </div>
  )
}

export default Home
