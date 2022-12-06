import React, { useMemo, useState, useCallback } from 'react'
import Card from '../components/Card'
import { useParams } from 'react-router-dom'
import { useHeaderAccess } from '../context/HederaProvider'

import './Mint.scss'
import { Button } from 'primereact'
import { useAurora } from '../context/AuroraProvider'

enum State {
  INIT = 1,
  PROGRESS = 2,
  SUCCESS = 3,
  FAILURE = 4
}

const Init = ({ handleSubmit }: { handleSubmit: () => unknown }) => {
  return (
    <div className="flex flex-column align-items-center col-12">
      <div className="text-white text-lg">Click here to claim your token</div>
      <Button
        label="Mint Hashie!"
        className="submit mt-4"
        onClick={handleSubmit}
      />
    </div>
  )
}

const Error = () => {
  return (
    <>
      <div className="col-12 flex justify-content-center mb-4">
        <div className="error-wrapper">!</div>
      </div>
      <div className="text-center text-2xl text-white col-12 mb-2">Failure</div>
      <div className="text-center text-sm col-12">
        There was an error while minting token
      </div>
    </>
  )
}

const Success = () => {
  return (
    <>
      <div className="col-12 flex justify-content-center mb-4">
        <div className="check-wrapper">
          <i
            className="pi pi-check"
            style={{ fontSize: '2em', color: '#6166DC' }}
          ></i>
        </div>
      </div>
      <div className="text-center text-2xl text-white col-12 mb-2">Success</div>{' '}
      <div className="text-center text-sm col-12">
        You have been granted a new token - check your wallet
      </div>
    </>
  )
}

const Progress = () => {
  return (
    <>
      <i
        className="pi pi-spin pi-spinner col-12"
        style={{ fontSize: '5em', color: '#6166DC' }}
      />
      <div className="col-12 text-sm text-white mt-4">Minting token</div>
    </>
  )
}

const Mint = () => {
  const [state, setState] = useState<State>(State.INIT)
  const { code, collectionId } = useParams()
  const { signer } = useHeaderAccess()

  const { mint } = useAurora()

  const handleMint = useCallback(async () => {
    try {
      if (!signer) {
        console.error('no signer')
        return
      }
      setState(State.PROGRESS)
      await mint(collectionId)
      setState(State.SUCCESS)
    } catch {
      setState(State.FAILURE)
    }
  }, [signer])

  const content = useMemo(() => {
    switch (state) {
      case State.INIT: {
        return <Init handleSubmit={handleMint} />
      }
      case State.PROGRESS: {
        return <Progress />
      }
      case State.SUCCESS: {
        return <Success />
      }
      case State.FAILURE: {
        return <Error />
      }
    }
  }, [state])
  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="w-7 grid grid-nogutter">{content}</Card>
    </div>
  )
}

export default Mint
