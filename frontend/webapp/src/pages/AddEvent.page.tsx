import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { RadioButton } from 'primereact/radiobutton'
import Card from '../components/Card'
import Label from '../components/Label'
import SwitchableField from '../components/SwitchableField'
import { useHeaderAccess } from '../context/HederaProvider'
import {
  ContractExecuteTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'
import { storeNFT, HashieToken } from '../helpers/ipfs'

import './AddEvent.scss'
import { validate } from 'validate.js'

const constraints = {
  eventName: {
    presence: { allowEmpty: false }
  },
  description: {
    presence: { allowEmpty: false }
  },
  selectedImage: {
    presence: { allowEmpty: false }
  },
  url: { url: true }
}

const AddEvent = () => {
  const [eventName, setEventName] = useState<string>('')
  const [isTouched, setIsTouched] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string[] }>()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [paymentOption, setPaymentOption] = useState<string>('Free')
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [quantity, setQuantity] = useState<number | null>()
  const [secretCode, setSecretCode] = useState<string>('')
  const [url, setUrl] = useState<string | undefined>()
  const [description, setDescription] = useState('')
  const { isConnected, connect, signer } = useHeaderAccess()
  const [isLoading, setIsLoading] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)

  const fileUploadRef = useRef(null)

  const isValid = useMemo(() => {
    if (!isTouched) {
      return true
    }
    return (
      !errors?.eventName &&
      !errors?.description &&
      !errors?.url &&
      !errors?.selectedImage
    )
  }, [errors, isTouched])

  useEffect(() => {
    if (!isTouched) {
      setErrors({})
      return
    }
    const form = { eventName, description, url, selectedImage }

    const err = validate(form, constraints)

    setErrors(err)
  }, [description, eventName, selectedImage, url, isTouched])

  const handleConnect = async () => {
    connect()
  }

  const handleSubmit = async () => {
    setIsTouched(true)
    if (!signer) {
      throw new Error('No signer!')
    }
    if (!selectedImage) {
      throw new Error('No image!')
    }
    try {
      setIsLoading(true)
      const hashie = new HashieToken()
      hashie.name = eventName
      hashie.description = description
      hashie.image = selectedImage
      if (url) {
        hashie.url = url
      }
      hashie.timeLimitFrom = fromDate?.toISOString()
      hashie.timeLimitTo = toDate?.toISOString()
      hashie.createdAt = new Date().toISOString()
      if (quantity) {
        hashie.quantity = quantity
      }
      if (secretCode) {
        hashie.secretCode = secretCode
      }

      console.log('hashie: ', hashie)

      const t = await storeNFT(hashie)
      const metadataURL = `https://ipfs.io/ipfs/${t.ipnft}/metadata.json`
      console.log('metadataURL: ', metadataURL)

      const _eventId = t.ipnft
      console.log('_eventId:', _eventId)

      const tx = await new ContractExecuteTransaction()
        .setContractId(HashieConfig.address)
        .setFunction(
          'createCollection',
          new ContractFunctionParameters()
            .addString(_eventId)
            .addString(eventName)
            .addString(metadataURL)
        )
        .setGas(900000) // TODO Use a gas calculator
        .freezeWithSigner(signer)

      const result = await tx.executeWithSigner(signer)
      console.log('result:', result)
      setIsLoading(false)
      setEventId(_eventId)

      window.location.href = `${window.location.origin}/event/${_eventId}`
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectImage = async (files: FileList | null) => {
    if (files) {
      console.log(files[0])
      setSelectedImage(files[0])
    }
  }

  return (
    <div className="flex flex-column justify-content-center align-items-center h-full">
      <h1 className="text-2xl font-bold text-white">Create a new event</h1>
      <Card className="flex flex-column add-event">
        <Label className="">Event Name *</Label>
        <InputText
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <small className="p-error block text-xs text-left mb-4">
          {errors?.eventName}
        </small>
        <Label className="">Select on Image *</Label>
        <div className="flex flex-start gap-2 mb-2">
          <input
            type="file"
            ref={fileUploadRef}
            onChange={(e) => handleSelectImage(e.target.files)}
          />
        </div>
        <small className="p-error block text-xs text-left mb-4">
          {errors?.selectedImage}
        </small>
        <Label className="">Event Description *</Label>
        <InputTextarea
          rows={10}
          cols={30}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <small className="p-error block text-xs text-left mb-4">
          {errors?.description}
        </small>
        <Label className="">Event URL</Label>
        <InputText
          value={url}
          onChange={(e) =>
            setUrl(e.target.value.length === 0 ? undefined : e.target.value)
          }
        />{' '}
        <small className="p-error block text-xs text-left mb-4">
          {errors?.url}
        </small>
        <SwitchableField
          title="Limited quantity"
          className=""
          subtitle="You can set the maximum number of times the FLOAT can be minted."
        >
          <Label className="">Amount</Label>
          <InputNumber
            className="mb-4 w-50 align-self-start"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.value)
            }}
          />
        </SwitchableField>
        <SwitchableField
          title="Time limit"
          className=""
          subtitle="Can only be minted between a specific time interval."
        >
          <div className="flex">
            <div className="flex flex-column flex-grow-1 mr-1">
              <Label className="">Start Date</Label>
              <Calendar
                dateFormat="dd/mm/yy"
                value={fromDate}
                onChange={(e) => setFromDate(e.value as Date)}
                showTime
              />
            </div>
            <div className="flex flex-column flex-grow-1 ml-1">
              <Label className="">EndDate Date</Label>
              <Calendar
                dateFormat="dd/mm/yy"
                value={fromDate}
                onChange={(e) => setToDate(e.value as Date)}
                showTime
              />
            </div>
          </div>
        </SwitchableField>
        <SwitchableField
          title="Use Secret Code"
          subtitle="Your FLOAT can only be minted if people know the secret code."
        >
          <Label className="">Code</Label>
          <InputText
            className="mb-2"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
          />
        </SwitchableField>
        <div className="text-left text-sm flex-grow-1 text-white mb-2">
          Payment options
        </div>
        <div className="flex flex-column radio-area">
          <div className="flex align-items-center">
            <div className="flex-grow-1 mr-2">
              <div className="text-white text-sm text-left">Free</div>
              <div className="text-xs text-left">
                Your HASHIE is currently free.
              </div>
            </div>
            <RadioButton
              name="paymentOption"
              value="Free"
              onChange={(e) => setPaymentOption(e.value)}
              checked={paymentOption === 'Free'}
            />
          </div>
          <div className="flex align-items-center">
            <div className="flex-grow-1 mr-2">
              <div className="text-white text-sm text-left">Paid</div>
              <div className="text-xs text-left">
                This HASHIE costs HBAR to claim. Suitable for things like
                tickets.
              </div>
            </div>
            <RadioButton
              name="paymentOption"
              value="Paid"
              onChange={(e) => setPaymentOption(e.value)}
              checked={paymentOption === 'Paid'}
            />
          </div>
        </div>
        {isConnected ? (
          <Button
            label="Create event"
            className="submit mt-4"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={eventId !== null || !isValid}
          />
        ) : (
          <Button
            label="Connect Wallet"
            className="submit mt-4"
            loading={isLoading}
            onClick={handleConnect}
            disabled={eventId !== null}
          />
        )}
      </Card>
    </div>
  )
}

export default AddEvent
