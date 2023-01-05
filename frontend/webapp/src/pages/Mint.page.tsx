import React, { useMemo, useState, useCallback } from 'react'
import Card from '../components/Card'
import { useParams } from 'react-router-dom'

import './Mint.scss'
import { useHashies } from '../context/HashiesProvider'
import ActionOrConnectButton from '../components/ActionOrConnectButton'
import { BigNumberish } from '@hashgraph/hethers'

enum State {
  INIT = 1,
  PROGRESS = 2,
  SUCCESS = 3,
  FAILURE = 4
}

type InitParameters = {
  handleSubmit: () => unknown
  eventId: BigNumberish
}

const Init = ({ handleSubmit }: InitParameters) => {
  return (
    <div className="flex flex-column align-items-center col-12">
      <div className="text-white text-lg">Click here to claim your token</div>
      <ActionOrConnectButton
        actionLabel="Mint Hashie!"
        className="submit mt-4"
        isLoading={false}
        action={handleSubmit}
        disabled={false}
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
  const { collectionId } = useParams()

  const { mint } = useHashies()

  const handleMint = useCallback(async () => {
    try {
      setState(State.PROGRESS)
      await mint(collectionId)
      setState(State.SUCCESS)
    } catch {
      setState(State.FAILURE)
    }
  }, [])

  const content = useMemo(() => {
    switch (state) {
      case State.INIT: {
        return <Init handleSubmit={handleMint} eventId={collectionId || ''} />
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
