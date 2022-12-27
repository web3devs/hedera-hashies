import { Button } from 'primereact/button'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHashies } from '../context/HashiesProvider'
import { chainList } from '../contracts/metamask'
import './Home.scss'

const Home = () => {
  const navigate = useNavigate()
  const { handleConnect, account, getChainConfig } = useHashies()

  const [chain, setChain] = useState()

  useEffect(() => {
    setChain(getChainConfig())
  })

  const loadChainFactory = (chain: string) => () => {
    window.location.hostname = `${chain}.${window.location.hostname}`
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
      {!chain && (
        <>
          <h3>Which chain do you want to connect to?</h3>
          <div className="flex flex-column">
            {chainList.map((chainName, idx) => (
              <Button
                key={`cb${idx}`}
                className="create-event capitalize align-self-center justify-content-center mb-4"
                onClick={loadChainFactory(chainName)}
              >
                {chainName}
              </Button>
            ))}
          </div>
        </>
      )}
      {chain && account && (
        <Button
          label="Create an Event"
          className="create-event mb-8"
          onClick={() => navigate('/add-event')}
        />
      )}
      {chain && !account && (
        <Button
          label="Connect Wallet"
          className="create-event mb-8"
          onClick={handleConnect}
        />
      )}
    </div>
  )
}

export default Home
