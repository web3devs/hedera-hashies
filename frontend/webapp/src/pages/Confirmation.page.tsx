import { Button } from 'primereact/button'
import React, { useEffect } from 'react'

import Card from '../componeont/Card'
import Star from '../assets/img-star.svg'
import './Confirmation.scss'
import { useHeaderAccess } from '../context/HederaProvider'
import { MessageTypes } from 'hashconnect'
import {
  Client,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'
import { useParams } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { hethers } from '@hashgraph/hethers'

const Confirmation = () => {
  const { isConnected, connect, signer, hashConnect } = useHeaderAccess()
  const { code: collectionId } = useParams()

  useEffect(() => {
    if (!collectionId) return
    if (!signer) return
    if (!hashConnect) return

    const fetch = async () => {
      // This code is modelled after https://github.com/hashgraph/hedera-sdk-js/blob/main/examples/create-stateful-contract.js#L89
      const tx = new ContractCallQuery()
        .setContractId(HashieConfig.address)
        .setGas(100000)
        .setQueryPayment(new Hbar(10))
        .setFunction(
          'simpleGet'
          // 'getCollection',
          // new ContractFunctionParameters().addUint256(
          //   new BigNumber('0x' + collectionId)
          // )
        )
        .setMaxQueryPayment(new Hbar(0.00000001))

      console.log('hc: ', hashConnect)

      const bts: Uint8Array = await tx.toBytes()

      const topic = hashConnect?.hcData.topic ? hashConnect?.hcData.topic : ''
      const transaction: MessageTypes.Transaction = {
        topic: topic,
        byteArray: bts,
        metadata: {
          accountToSign: hashConnect?.hcData.pairingData[0].accountIds[0]
            ? hashConnect?.hcData.pairingData[0].accountIds[0]
            : '',
          returnTransaction: false,
          hideNft: false
        }
      }

      const r = await hashConnect.sendTransaction(topic, transaction)

      console.log('txResponse: ', r.receipt)
    }
    fetch()
  }, [signer, collectionId])

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
