import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { RadioButton } from 'primereact/radiobutton'
import Card from '../components/Card'
import Label from '../components/Label'
import SwitchableField from '../components/SwitchableField'
import { storeNFT, HashieToken } from '../helpers/ipfs'

import './AddEvent.scss'
import { validate } from 'validate.js'
import { Dialog } from 'primereact/dialog'
import { useNavigate } from 'react-router-dom'
import { useAurora } from '../context/AuroraProvider'
import { Image } from 'primereact'

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
  const navigate = useNavigate()
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
  const { createCollection, account, handleConnect } = useAurora()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const [collectionId, setCollectionId] = useState<string | null>()

  const fileUploadRef = useRef<HTMLInputElement>(null)

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

  const resetForm = () => {
    setEventId(null)
    setEventName('')
    setIsTouched(false)
    setDescription('')
    setSelectedImage(null)
    setPaymentOption('Free')
    setFromDate(undefined)
    setToDate(undefined)
    setUrl('')
    setSecretCode('')
    setQuantity(null)
  }

  useEffect(() => {
    if (!isTouched) {
      setErrors({})
      return
    }
    const form = { eventName, description, url, selectedImage }

    const err = validate(form, constraints)

    setErrors(err)
  }, [description, eventName, selectedImage, url, isTouched])

  const handleSubmit = useCallback(async () => {
    setIsTouched(true)
    if (!selectedImage) {
      throw new Error('No image!')
    }
    if (!isValid) {
      return
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

      const collectionId = await createCollection(eventName, metadataURL)
      setEventId(_eventId)
      setCollectionId(collectionId)
      setShowConfirmation(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [isValid, selectedImage])

  const handleSelectImage = async (files: FileList | null) => {
    if (files) {
      console.log(files[0])
      setSelectedImage(files[0])
    } else {
      setSelectedImage(null)
    }
  }

  const imageData = useMemo(() => {
    if (!selectedImage) {
      return null
    }
    return URL.createObjectURL(selectedImage)
  }, [selectedImage])

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
        <div className="flex gap-2 mb-2 align-items-center">
          {imageData && (
            <Image
              src={imageData}
              className="justify-self-start"
              alt="image-previev"
              width="64"
              height="64"
            />
          )}
          {selectedImage && (
            <span className="text-xs justify-self-start ml-2">
              {selectedImage.name}
            </span>
          )}

          {selectedImage && (
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-outlined mr-4"
              aria-label="Cancel"
              onClick={() => {
                handleSelectImage(null)
              }}
            />
          )}
          <Button
            onClick={() => {
              fileUploadRef?.current?.click()
            }}
            className="p-button-outlined justify-self-start"
          >
            Select an Image
          </Button>
          <input
            type="file"
            ref={fileUploadRef}
            onChange={(e) => handleSelectImage(e.target.files)}
            style={{ display: 'none' }}
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
                dateFormat="mm/dd/yy"
                value={fromDate}
                onChange={(e) => setFromDate(e.value as Date)}
                showTime={false}
              />
            </div>
            <div className="flex flex-column flex-grow-1 ml-1">
              <Label className="">End Date</Label>
              <Calendar
                dateFormat="mm/dd/yy"
                showTime={false}
                value={toDate}
                onChange={(e) => setToDate(e.value as Date)}
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
        {account ? (
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
      <Dialog
        visible={showConfirmation}
        showHeader={false}
        modal={true}
        closable={false}
        style={{ width: '30rem' }}
        onHide={() => setShowConfirmation(false)}
      >
        <div className="flex flex-column justify-content-center align-items-center p-4">
          <div className="text-2xl text-center mb-4">
            Success, Event created
          </div>
          <div className="check-wrapper mb-4">
            <i
              className="pi pi-check"
              style={{ fontSize: '2em', color: '#6166DC' }}
            ></i>
          </div>
          <div className="flex gap-4">
            <Button
              label="Create another event"
              className="p-button-outlined"
              onClick={() => {
                resetForm()
                setShowConfirmation(false)
              }}
            />
            <Button
              label="Go to claim page"
              onClick={() => {
                navigate('/event/' + eventId + '/' + collectionId)
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default AddEvent
