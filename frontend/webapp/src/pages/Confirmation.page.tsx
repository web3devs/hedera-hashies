import { Button } from 'primereact/button'
import React, { useEffect } from 'react'

import Card from '../componeont/Card'
import Star from '../assets/img-star.svg'
import './Confirmation.scss'
import { useHeaderAccess } from '../context/HederaProvider'
import {
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'
import { useParams } from 'react-router-dom'
import BigNumber from 'bignumber.js'

const Confirmation = () => {
  const { isConnected, connect, signer } = useHeaderAccess()
  const { code: collectionId } = useParams()

  console.log(collectionId)

  useEffect(() => {
    if (!collectionId) return
    if (!signer) return

    const fetch = async () => {
      const tx = new ContractCallQuery()
        // const tx = await new ContractExecuteTransaction()
        .setContractId(HashieConfig.address)
        .setGas(100000)
        .setQueryPayment(new Hbar(10))
        .setFunction(
          'simpleGet'
          // new ContractFunctionParameters().addUint256(
          //   new BigNumber('0x' + collectionId)
          // )
        )
      // .freezeWithSigner(signer)

      // const txBytes = tx.toBytes()
      // const txResponse = hashconnect?.sendTransaction(hashconnect?.hcData.topic, tx.)
      const txResponse = await tx.executeWithSigner(signer) // TODO why is txResonse null?
      // const receipt = await txResponse.getReceipt(signer)

      console.log('>>>>>', txResponse)
    }
    fetch()
  }, [signer])

  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="w-7 grid grid-nogutter">
        <img src={Star} alt="event" className="col-3" />
        <div className="text-lg text-left text-white col-9 pl-4">
          Matrix World AMA: Jacob Tucker | Emerald City
        </div>
        <div className="tex-sm text-left col-12 mt-4">Status</div>
        <div className="tex-sm text-left text-white col-12 mt-2">Status</div>
        <div className="tex-sm text-left col-12 mt-4">Event description</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          This Hashie is a reward for coming and participating in our AMA. Thank
          you for taking out the time to come to our event. Please feel free to
          display your new Hashie anywhere you like.
        </div>
        <div className="tex-sm text-left col-12 mt-4">Limited quantity</div>
        <div className="tex-sm text-left text-white col-12 mt-2">1000</div>
        <div className="tex-sm text-left col-12 mt-4">Time limit</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          10/10/2022 — 12/10/2022
        </div>
        <div className="tex-sm text-left col-12 mt-4">Secret code</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          &#123;CODE&#125;
        </div>
        <div className="tex-sm text-left col-12 mt-4">Cost</div>
        <div className="tex-sm text-left text-white col-12 mt-2">Free</div>
        <div className="tex-sm text-left col-12 mt-4">Claim URL</div>
        <div className="col-12 mb-4 flex align-items-center">
          <a href="https://hashies.net/mint/123456">
            https://hashies.net/mint/123456
          </a>
          <Button icon="pi pi-copy" className="p-button-text" />
        </div>
        <div className="col-12 text-xs">
          <span>Event #252847127</span>
          <span>Created on 6.06.2022, 04:43:19</span>
        </div>
      </Card>
    </div>
  )
}

export default Confirmation
