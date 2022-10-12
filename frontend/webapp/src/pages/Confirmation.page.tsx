import React, { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import Card from '../components/Card'
import Star from '../assets/img-star.svg'
import './Confirmation.scss'
import { useParams } from 'react-router-dom'
import { useHeaderAccess } from '../context/HederaProvider'
import {
  ContractExecuteTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'

const Confirmation = () => {
  const { code: collectionId } = useParams()
  const [loading, isLoading] = useState<boolean>(true)
  const [name, setName] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const { signer } = useHeaderAccess()

  useEffect(() => {
    if (!collectionId) return

    const _fetch = async () => {
      isLoading(true)
      const response = await fetch(
        `https://ipfs.io/ipfs/${collectionId}/metadata.json`
      )
      const { description, image, name } = await response.json()
      if (image.startsWith('ipfs://')) {
        const [imageCid, imageFileName] = image
          .replace(/^ipfs:\/\//, '')
          .split('/')
        setImage(`https://ipfs.io/ipfs/${imageCid}/${imageFileName}`)
      } else {
        setImage(image)
      }
      setDescription(description)
      setName(name)
      isLoading(false)
    }
    if (name === null && description === null && image === null) {
      _fetch()
    }
  }, [collectionId, name, description, image])

  const handleMint = async () => {
    if (!collectionId || !signer) {
      return
    }
    const accountId = signer?.getAccountId().toSolidityAddress()
    if (typeof accountId !== 'string') return

    console.log('CollectionID: ', collectionId)
    console.log('AccountID: ', signer?.getAccountId().toString(), accountId)

    const tx = await new ContractExecuteTransaction()
      .setContractId(HashieConfig.address)
      .setFunction(
        'mint',
        new ContractFunctionParameters()
          .addString(collectionId)
          .addAddress(accountId)
      )
      .setGas(9000000) // TODO Use a gas calculator
      .freezeWithSigner(signer)

    const result = await tx.executeWithSigner(signer)
    console.log(result)
  }

  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="w-7 grid grid-nogutter">
        {image ? (
          <img src={image} alt="Event image" className="col-3" />
        ) : (
          <img src={Star} alt="Placeholder image" className="col-3" />
        )}
        {!loading && (
          <div className="text-lg text-left text-white col-9 pl-4">{name}</div>
        )}
        {loading && (
          <div className="text-lg text-left text-white col-9 pl-4">
            <i
              className="pi pi-spin pi-spinner col-12"
              style={{ fontSize: '5em', color: '#6166DC' }}
            />
            <div className="col-12 text-sm text-white mt-4">Loading...</div>
          </div>
        )}
        <div className="tex-sm text-left col-12 mt-4">Status</div>
        <div className="tex-sm text-left text-white col-12 mt-2">Status</div>
        <div className="tex-sm text-left col-12 mt-4">Event description</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          {description}
        </div>
        {/* <div className="tex-sm text-left col-12 mt-4">Limited quantity</div>
        <div className="tex-sm text-left text-white col-12 mt-2">1000</div> */}
        {/* <div className="tex-sm text-left col-12 mt-4">Time limit</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          10/10/2022 — 12/10/2022
        </div> */}
        {/* <div className="tex-sm text-left col-12 mt-4">Cost</div>
        <div className="tex-sm text-left text-white col-12 mt-2">Free</div> */}
        <div className="tex-sm text-left col-12 mt-4">Claim URL</div>
        <div className="col-12 mb-4 flex flex-column align-items-center">
          <Button
            label="Mint Hashie!"
            className="submit mt-4"
            // onClick={() =>
            //   (window.location.href = `${window.location.origin}/mint/${collectionId}`)
            // }
            onClick={handleMint}
          />
        </div>
        <div className="col-12 text-xs">
          <p>Event id: {collectionId}</p>
          <p>Created on 6.06.2022, 04:43:19</p>
        </div>
      </Card>
    </div>
  )
}

export default Confirmation
