import React, { useMemo, useState, useEffect } from 'react'
import Card from '../components/Card'
import { useParams } from 'react-router-dom'
import { useHeaderAccess } from '../context/HederaProvider'
import {
  ContractExecuteTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'

import './Mint.scss'

enum State {
  PROGRESS = 2,
  SUCCESS = 3,
  FAILURE = 4
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
  const [initiated, setInitiated] = useState<boolean>(false)
  const [state, setState] = useState<State>(State.FAILURE)
  const { code: collectionId } = useParams()
  const { signer } = useHeaderAccess()

  useEffect(() => {
    if (!collectionId || !signer) {
      setState(State.FAILURE)
      return
    }

    const _fetch = async () => {
      setInitiated(true)
      setState(State.PROGRESS)

      const accountId = signer?.getAccountId().toSolidityAddress()
      if (typeof accountId !== 'string') return

      const tx = await new ContractExecuteTransaction()
        .setContractId(HashieConfig.address)
        .setFunction(
          'mint',
          new ContractFunctionParameters()
            .addUint256(Number(collectionId))
            .addAddress(accountId)
        )
        .setGas(9000000) // TODO Use a gas calculator
        .freezeWithSigner(signer)

      const result = await tx.executeWithSigner(signer)
      console.log(result)

      setState(State.SUCCESS)
    }
    if (!initiated) {
      _fetch()
    }
  }, [initiated])

  const content = useMemo(() => {
    switch (state) {
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