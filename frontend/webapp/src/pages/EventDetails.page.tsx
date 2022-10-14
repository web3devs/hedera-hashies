import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import Card from '../components/Card'
import Star from '../assets/img-star.svg'
import './EventDetails.scss'
import { useParams } from 'react-router-dom'
import { useHeaderAccess } from '../context/HederaProvider'
import { useHeaderAPI } from '../context/HederaAPIProvider'
import {
  ContractExecuteTransaction,
  ContractFunctionParameters
  // Hbar
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'
import { InputText, Toast } from 'primereact'

const EventDetails = () => {
  const { code: collectionId } = useParams()
  const toast = useRef<Toast>(null)
  const [loading, isLoading] = useState<boolean>(true)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [createdAt, setCreatedAt] = useState(new Date())
  const [mintedNum, setMintedNum] = useState(0)
  const [secretCode, setSecretCode] = useState<string | null>(null)
  const [inputSecretCode, setInputSecretCode] = useState<string>('')
  const [limit, setLimit] = useState(100)
  const [url, setURL] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const { signer } = useHeaderAccess()
  const { nfts, getMintedTokens, hasToken } = useHeaderAPI()

  const blockMint = useMemo(() => {
    if (collectionId && signer) {
      const now = new Date().getTime()
      const isAfterDeadline = !!endDate && now > (endDate?.getTime() || 0)
      const isBeforeStart = !!fromDate && now < (fromDate?.getTime() || 0)
      const isSecretNotValid = secretCode
        ? secretCode !== inputSecretCode
        : false
      const hasNFT = hasToken(collectionId, signer?.getAccountId().toString())

      const isOverLimit = limit && mintedNum >= limit
      return (
        isOverLimit ||
        isAfterDeadline ||
        isBeforeStart ||
        isSecretNotValid ||
        hasNFT
      )
    }
    return true
  }, [
    limit,
    mintedNum,
    fromDate,
    endDate,
    secretCode,
    inputSecretCode,
    nfts,
    collectionId,
    signer
  ])

  useEffect(() => {
    const _fetch = async () => {
      isLoading(true)
      if (!collectionId) {
        isLoading(false)
        return
      }

      const response = await fetch(
        `https://ipfs.io/ipfs/${collectionId}/metadata.json`
      )
      const data = await response.json()
      console.log(data)
      console.log(window.location.origin)
      const {
        description,
        image,
        name,
        timeLimitFrom,
        timeLimitTo,
        quantity,
        createdAt,
        secretCode,
        url
      } = data
      if (image.startsWith('ipfs://')) {
        const [, , imageCid, imageFileName] = image.split('/')
        setImage(`https://ipfs.io/ipfs/${imageCid}/${imageFileName}`)
      } else {
        setImage(image)
      }
      setDescription(description)
      setName(name)
      setURL(url)
      setCreatedAt(new Date(createdAt))
      setFromDate(timeLimitFrom && new Date(timeLimitFrom))
      setEndDate(timeLimitTo && new Date(timeLimitTo))
      setLimit(quantity)
      setSecretCode(secretCode)

      isLoading(false)
    }
    if (
      name === null &&
      description === null &&
      image === null &&
      collectionId
    ) {
      _fetch()
    }
  }, [collectionId, name, description, image])

  useEffect(() => {
    if (collectionId) {
      const tokensMinted = getMintedTokens(collectionId)
      setMintedNum(tokensMinted)
    }
  }, [collectionId, nfts])

  const handleMint = async () => {
    if (!collectionId || !signer) {
      return
    }
    const accountId = signer?.getAccountId().toSolidityAddress()
    if (typeof accountId !== 'string') return

    console.log('CollectionID: ', collectionId)
    console.log('AccountID: ', signer?.getAccountId().toString(), accountId)

    try {
      const tx = await new ContractExecuteTransaction()
        .setContractId(HashieConfig.address)
        .setFunction(
          'mint',
          new ContractFunctionParameters()
            .addString(collectionId)
            .addAddress(accountId)
        )
        .setGas(10000000) // TODO Use a gas calculator
        .freezeWithSigner(signer)

      const result = await tx.executeWithSigner(signer)
      console.log('result:', result)
      if (result) {
        const record = result.getRecordWithSigner(signer)
        console.log('record:', record)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const eventDetailsUrl = useMemo(() => {
    return `https://hashie.net/event/${collectionId}`
  }, [collectionId])

  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="w-7 grid grid-nogutter">
        {!loading ? (
          <>
            {image ? (
              <img src={image} alt="Event image" className="col-3" />
            ) : (
              <img src={Star} alt="Placeholder image" className="col-3" />
            )}
            <div className="text-lg text-left text-white col-9 pl-4">
              <h2 className="mt-0">{name}</h2>
            </div>

            <div className={`col-${url ? '6' : '12'} grid grid-nogutter`}>
              <div className="text-sm text-left col-12 mt-4">Description</div>
              <div className="text-sm text-left text-white col-12 mt-2">
                {description}
              </div>
            </div>
            {url && (
              <div className="col-6 grid grid-nogutter">
                <div className="text-sm text-left col-12 mt-4">Event URL</div>
                <div className="text-sm text-left text-white col-12 mt-2">
                  <a href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                </div>
              </div>
            )}
            {(!!fromDate || !!endDate) && (
              <div className="col-12 grid grid-nogutter mt-4">
                {!!fromDate && (
                  <div className="flex flex-column col-6">
                    <div className="text-sm text-left">Start date</div>
                    <div className="text-sm text-left text-white mt-2">
                      {fromDate.toLocaleString()}
                    </div>
                  </div>
                )}

                {!!endDate && (
                  <div className="flex flex-column col-6">
                    <div className="text-sm text-left">End date</div>
                    <div className="text-sm text-left text-white mt-2">
                      {endDate.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="col-12 grid grid-nogutter mt-4">
              <div className="flex flex-column col-6">
                <div className="text-sm text-left">Tokens minted</div>
                <div className="text-sm text-left text-white mt-2">
                  {mintedNum}
                </div>
              </div>
              <div className="flex flex-column col-6">
                <div className="text-sm text-left">Minting limit</div>
                <div className="text-sm text-left text-white mt-2">
                  {limit || 'unlimited'}
                </div>
              </div>
            </div>
            {secretCode && (
              <>
                <div className="text-sm text-left col-12 mt-4">Secret code</div>
                <InputText
                  value={inputSecretCode}
                  onChange={(e) => setInputSecretCode(e.target.value)}
                  className="mb-4 col-12 pr-4 pl-4"
                />
              </>
            )}
            <div className="col-12 mb-4 flex flex-column align-items-center">
              <Button
                label="Mint Hashie!"
                className="submit mt-4 pr-4 pl-4"
                onClick={handleMint}
                disabled={blockMint}
              />
            </div>
            <div className="col-12 text-xs">
              <div className="flex justify-content-center align-items-center">
                <span>Event id: {collectionId}</span>
                <Button
                  icon="pi pi-copy"
                  className="p-button-text"
                  onClick={() => {
                    navigator.clipboard.writeText(eventDetailsUrl)
                    toast?.current?.show({
                      severity: 'info',
                      summary: 'URL copied to clipboard'
                    })
                  }}
                />
              </div>
              <p>Created on {createdAt?.toLocaleString()}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-column justify-content-center align-items-center col-12">
              <i
                className="pi pi-spin pi-spinner col-12"
                style={{ fontSize: '5em', color: '#6166DC' }}
              />
              <div className="col-12 text-lg text-white mt-4">Loading...</div>
            </div>
          </>
        )}
      </Card>
      <Toast ref={toast} position="top-center" />
    </div>
  )
}

export default EventDetails
