import React, { useMemo, useRef } from 'react'
import Card from './Card'
import { useEffect, useState } from 'react'
import {
  BURNABLE_FLAG_BIT,
  MINTING_DISABLED_BIT,
  SECRET_WORD_TOKEN_REQUIRED_BIT,
  TRANSFERABLE_FLAG_BIT,
  useAurora
} from '../context/AuroraProvider'
import { BigNumberish } from '@hashgraph/hethers'
import { ICollection } from '../context/ICollection'
import { webifyUri } from '../helpers/ipfs'
import { ethers, BigNumber } from 'ethers'
import HashieImage from './HashieImage'
import { Button } from 'primereact/button'
import { Toast } from 'primereact'

const HashiesDetailCard = ({ collectionId }: any) => {
  const { getCollectionById } = useAurora()

  const toast = useRef<Toast>(null)

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [eventUrl, setEventUrl] = useState<string>()
  const [maxSupply, setMaxSupply] = useState<BigNumber>()
  const [earliestMintTimestamp, setEarliestMintTimestamp] = useState<number>()
  const [latestMintTimestamp, setLatestMintTimestamp] = useState<number>()
  const [requiredPayment, setRequiredPayment] = useState<BigNumber>()
  const [transferable, setTransferable] = useState<boolean>()
  const [burnable, setBurnable] = useState<boolean>()
  const [disabled, setDisabled] = useState<boolean>()
  const [cid, setCid] = useState<string>('')
  const [secretWordTokenRequired, setSecretWordTokenRequired] =
    useState<boolean>()

  async function getHashieMetadata(collectionId: BigNumberish) {
    const collection = (await getCollectionById(collectionId)) as ICollection
    setCid(collection.uri.split('/')[4])
    const uri = webifyUri(collection.uri)
    setMaxSupply(collection.maxSupply)
    setEarliestMintTimestamp(collection.earliestMintTimestamp.toNumber() * 1000)
    setLatestMintTimestamp(collection.latestMintTimestamp.toNumber() * 1000)
    setRequiredPayment(collection.requiredPayment)
    setTransferable((collection.flags.toNumber() & TRANSFERABLE_FLAG_BIT) !== 0)
    setBurnable((collection.flags.toNumber() & BURNABLE_FLAG_BIT) !== 0)
    setDisabled((collection.flags.toNumber() & MINTING_DISABLED_BIT) !== 0)
    setSecretWordTokenRequired(
      (collection.flags.toNumber() & SECRET_WORD_TOKEN_REQUIRED_BIT) !== 0
    )

    const response = await fetch(uri) // TODO The assets stored on IPFS need to be pinned!
    const data: any = await response.json()
    const { image, name, description, url } = data

    setImageUri(image)
    setName(name)
    setDescription(description)
    setEventUrl(url)
  }

  const mintingUrl = useMemo(() => {
    return `${window.location.origin}/event/${cid}/${collectionId}`
  }, [collectionId, cid])

  useEffect(() => {
    getHashieMetadata(collectionId)
  }, [collectionId])

  return (
    <Card className="grid grid-nogutter col-4 m-1">
      <>
        <HashieImage imageUri={imageUri} className="col-3 m-2" />
        <div className="text-lg text-left text-white col-9 pl-4">
          <h2 className="mt-0">{name || 'Loading...'}</h2>
        </div>
        <div className={`col-${eventUrl ? '6' : '12'} grid grid-nogutter`}>
          <div className="text-sm text-left col-12 mt-4">Description</div>
          <div className="text-sm text-left text-white col-12 mt-2">
            {description || 'Loading...'}
          </div>
        </div>
        {eventUrl && (
          <div className="col-6 grid grid-nogutter">
            <div className="text-sm text-left col-12 mt-4">Event URL</div>
            <div className="text-sm text-left text-white col-12 mt-2">
              <a href={eventUrl} target="_blank" rel="noreferrer">
                {eventUrl}
              </a>
            </div>
          </div>
        )}
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Max Supply</div>
          <div className="text-sm text-left text-white col-12 mt-2">
            {maxSupply?.isZero() ? 'unlimited' : maxSupply?.toString()}
          </div>
        </div>
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Required payment</div>
          <div className="text-sm text-left text-white col-12 mt-2">
            {!requiredPayment?.isZero()
              ? `${ethers.constants.EtherSymbol}${requiredPayment?.toString()}`
              : 'none'}
          </div>
        </div>
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">
            Earliest allowed mint
          </div>
          <div className="text-sm text-left text-white col-12 mt-2">
            {earliestMintTimestamp
              ? new Date(earliestMintTimestamp).toLocaleString()
              : 'unlimited'}
          </div>
        </div>
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">
            Latest allowed mint
          </div>
          <div className="text-sm text-left text-white col-12 mt-2">
            {latestMintTimestamp
              ? new Date(latestMintTimestamp).toLocaleString()
              : 'unlimited'}
          </div>
        </div>
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Burnable</div>
          <div className="text-sm text-left col-12 mt-2">
            {burnable ? (
              <i className="pi pi-check text-green-500"></i>
            ) : (
              <i className="pi pi-times text-red-500"></i>
            )}
          </div>
        </div>
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Transferable</div>
          <div className="text-sm text-left col-12 mt-2">
            {transferable ? (
              <i className="pi pi-check text-green-500"></i>
            ) : (
              <i className="pi pi-times text-red-500"></i>
            )}
          </div>
        </div>
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Disabled</div>
          <div className="text-sm text-left col-12 mt-2">
            {disabled ? (
              <i className="pi pi-check text-green-500"></i>
            ) : (
              <i className="pi pi-times text-red-500"></i>
            )}
          </div>
        </div>
        <div className="col-12 grid grid-nogutter">
          <a className="text-sm text-left col-12 mt-4" href={mintingUrl}>
            Mint
          </a>
          <Button
            icon="pi pi-copy"
            className="p-button-text"
            onClick={() => {
              navigator.clipboard.writeText(mintingUrl)
              toast?.current?.show({
                severity: 'info',
                summary: 'URL copied to clipboard'
              })
            }}
          />
        </div>
      </>
    </Card>
  )
}

export default HashiesDetailCard
