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
import Star from '../assets/img-star.svg'
import People from '../assets/img-people.svg'
import Present from '../assets/img-present.svg'

import './AddEvent.scss'
import { Dialog } from 'primereact/dialog'
import { useNavigate } from 'react-router-dom'
import { useHashies } from '../context/HashiesProvider'
import { Image, InputSwitch } from 'primereact'
import { number, object, string, mixed, boolean, date } from 'yup'
import ActionOrConnectButton from '../components/ActionOrConnectButton'

const schema = object({
  eventName: string().required('Provide event name'),
  description: string().required('Provide event description'),
  isCustomImage: boolean(),
  // selectedImage: mixed().when('isCustomImage',{
  //   is:true,
  //   then:(schema) => schema.nullable(true).required('Select an image')
  // }),
  selectedImage: mixed().nullable(true).required('Select an image'),
  isStartDateEnabled: boolean(),
  isEndDateEnabled: boolean(),
  isQuantityEnabled: boolean(),
  fromDate: date().when('isStartDateEnabled', {
    is: true,
    then: (schema) => {
      return schema.required('Provide a start date')
    }
  }),
  toDate: date().when('isEndDateEnabled', {
    is: true,
    then: (schema) => {
      return schema.required('Provide end date')
    }
  }),
  quantity: number().when('isQuantityEnabled', {
    is: true,
    then: (schema) => {
      return schema
        .typeError('Provide a number')
        .integer('Must be an integer')
        .moreThan(0, 'Must be greater than 0')
    }
  }),
  url: string().url('Must be a valid url'),
  paymentOption: string(),
  fee: number().when('paymentOption', {
    is: (val) => {
      return val === 'Paid'
    },
    then: (schema) => {
      return schema
        .typeError("Fee is required when 'Paid' is selected")
        .moreThan(0, 'Must be greater than 0')
        .required("Fee is required when 'Paid' is selected")
    }
  }),
  feeAddress: string().when('paymentOption', {
    is: (val) => {
      return val === 'Paid'
    },
    then: (schema) => {
      return schema.required('Recipient address is required')
    }
  })
})
const DEFAULT_FORM = {
  eventName: '',
  description: '',
  selectedImage: null,
  paymentOption: 'Free',
  isStartDateEnabled: false,
  fromDate: undefined,
  isEndDateEnabled: false,
  toDate: undefined,
  isQuantityEnabled: false,
  quantity: 0,
  isCodeEnabled: false,
  isSecredCodeEnabled: false,
  secretCode: '',
  url: '',
  isLimitedQuantityEnabled: false,
  fee: 0,
  feeAddress: ''
}
const svgToBase64 = (svg) => {
  const blob = new Blob(['svg'], {
    type: 'text/plain'
  })
  const file = new File([blob], 'file.svg', { type: 'image/svg+xml' })

  return file
}

const AddEvent = () => {
  const navigate = useNavigate()
  const [isTouched, setIsTouched] = useState(false)
  const [errors, setErrors] = useState()
  const { createCollection } = useHashies()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [eventId, setEventId] = useState(null)
  const [collectionId, setCollectionId] = useState()
  const [selectedImage, setSelectedImage] = useState(0)

  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const fileUploadRef = useRef(null)

  const isValid = useMemo(() => {
    if (!isTouched) {
      return true
    }
    return (
      !errors?.eventName &&
      !errors?.description &&
      !errors?.url &&
      !errors?.selectedImage &&
      !errors?.fee
    )
  }, [errors, isTouched])

  const resetForm = () => {
    setForm({ ...DEFAULT_FORM })
  }

  useEffect(() => {
    if (!isTouched) {
      setErrors({})
      return
    }
    try {
      const e = schema.validateSync(form, { abortEarly: false })
      setErrors({})
    } catch (error) {
      const errors = {}
      error.inner.forEach(({ path, message }) => {
        errors[path] = message
      })
      setErrors(errors)
    }
  }, [form, isTouched])

  const handleSubmit = useCallback(async () => {
    if (!isTouched) {
      try {
        schema.validateSync(form, { abortEarly: false })
      } catch {
        setIsTouched(true)
        return
      }
    }

    if (!isValid) {
      throw new Error('Not valid!')
    }

    try {
      setIsLoading(true)
      const hashie = new HashieToken()

      hashie.name = form.eventName
      hashie.description = form.description
      hashie.image = form.selectedImage
      if (form.url) {
        hashie.url = form.url
      }
      hashie.timeLimitFrom = form?.fromDate?.toISOString()
      hashie.timeLimitTo = form?.toDate?.toISOString()
      hashie.createdAt = new Date().toISOString()

      if (form.isQuantityEnabled) {
        hashie.quantity = form.quantity
      }
      if (form.secretCode) {
        hashie.secretCode = form.secretCode
      }
      if (form.paymentOption === 'Paid' && form.fee) {
        hashie.fee = form.fee
      }

      console.log(form.selectedImage instanceof Blob)
      const t = await storeNFT(hashie)
      const metadataURL = `https://ipfs.io/ipfs/${t.ipnft}/metadata.json`
      console.log('metadataURL: ', metadataURL)

      const _eventId = t.ipnft
      console.log('_eventId:', _eventId)
      const collectionId = await createCollection(
        form.eventName,
        metadataURL,
        form.isQuantityEnabled ? form.quantity : 0,
        form.fromDate ? Math.floor(form.fromDate.getTime() / 1000) : 0,
        form.toDate ? Math.floor(form.toDate.getTime() / 1000) : 0,
        form.paymentOption === 'Paid' ? form.fee : 0
      )
      setEventId(_eventId)
      setCollectionId(collectionId)
      setShowConfirmation(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [isValid, form])

  const handleSelectImage = async (files) => {
    if (files) {
      console.log(files[0])
      setFormField('selectedImage', files[0])
    } else {
      setFormField('selectedImage', null)
    }
  }

  const setFormField = useCallback((key, value) => {
    setForm((prev) => {
      return { ...prev, [key]: value }
    })
  })
  const imageData = useMemo(() => {
    // if (!form.selectedImage) {
    return null
    // }
    // return URL.createObjectURL(form.selectedImage)
  }, [form.selectedImage])
  const [isCustomImage, setIsCustomImage] = useState(true)
  return (
    <div className="flex flex-column justify-content-center align-items-center h-full">
      <h1 className="text-2xl font-bold text-white">Create a new event</h1>
      <Card className="flex flex-column add-event">
        <Label className="">Event Name *</Label>
        <InputText
          value={form.eventName || ''}
          onChange={(e) => setFormField('eventName', e.target.value)}
        />
        <small className="p-error block text-xs text-left mb-4">
          {errors?.eventName}
        </small>
        <Label className="">Select on Image *</Label>
        <div className="flex flex-row mb-2">
          <InputSwitch
            checked={isCustomImage}
            className="mr-2"
            onChange={(e) => setIsCustomImage(e.value)}
          />
          <span>Select custom image</span>
        </div>
        {!isCustomImage && (
          <div className="flex">
            <img
              src={Star}
              onClick={() => {
                setSelectedImage(0)
                setFormField('selectedImage', svgToBase64(Star))
              }}
              alt="star"
              className={`image${
                selectedImage === 0 && ' selected'
              } cursor-pointer`}
            />
            <img
              src={People}
              onClick={() => {
                setSelectedImage(1)
                setFormField('selectedImage', svgToBase64(People))
              }}
              alt="people"
              className={`image${
                selectedImage === 1 && ' selected'
              } cursor-pointer`}
            />
            <img
              src={Present}
              onClick={() => {
                setSelectedImage(2)
                setFormField('selectedImage', svgToBase64(Present))
              }}
              alt="present"
              className={`image${
                selectedImage === 2 && ' selected'
              } cursor-pointer`}
            />
          </div>
        )}
        {isCustomImage && (
          <>
            <div className="flex gap-2 align-items-center">
              {imageData && (
                <Image
                  src={imageData}
                  className="justify-self-start"
                  alt="image-previev"
                  width="64"
                  height="64"
                />
              )}
              {form.selectedImage && (
                <span className="text-xs justify-self-start ml-2">
                  {form.selectedImage.name}
                </span>
              )}

              {form.selectedImage && (
                <Button
                  icon="pi pi-times"
                  className="p-button-rounded p-button-outlined mr-4"
                  aria-label="Cancel"
                  onClick={() => {
                    handleSelectImage(null)
                  }}
                />
              )}
              {!form.selectedImage && (
                <Button
                  onClick={() => {
                    fileUploadRef?.current?.click()
                  }}
                  className="p-button-outlined justify-self-start"
                >
                  Select an Image
                </Button>
              )}
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
          </>
        )}
        <Label className="">Event Description *</Label>
        <InputTextarea
          rows={10}
          cols={30}
          value={form.description || ''}
          onChange={(e) => setFormField('description', e.target.value)}
        />
        <small className="p-error block text-xs text-left mb-4">
          {errors?.description}
        </small>
        <Label className="">Event URL</Label>
        <InputText
          value={form.url || ''}
          onChange={(e) =>
            setFormField(
              'url',
              e.target.value.length === 0 ? undefined : e.target.value
            )
          }
        />
        <small className="p-error block text-xs text-left mb-4">
          {errors?.url}
        </small>
        <SwitchableField
          title="Limited quantity"
          className=""
          toggle={(val) => {
            setFormField('isQuantityEnabled', val)
          }}
          subtitle="You can set the maximum number of times the FLOAT can be minted."
        >
          <Label className="">Amount</Label>
          <InputNumber
            className="w-50 align-self-start"
            value={form.quantity || 0}
            onChange={(e) => {
              setFormField('quantity', e.value || 0)
            }}
          />
          <small className="p-error block text-xs text-left mb-4">
            {errors?.quantity}
          </small>
        </SwitchableField>
        <SwitchableField
          title="Start date"
          className=""
          toggle={(val) => {
            setFormField('isStartDateEnabled', val)
          }}
          subtitle="Can only be minted between a from a specific timedate."
        >
          <div className="flex flex-column flex-grow-1 mr-1">
            <Label className="">Start Date</Label>
            <Calendar
              dateFormat="mm/dd/yy"
              value={form.fromDate}
              onChange={(e) => setFormField('fromDate', e.value)}
              showTime={true}
            />
            <small className="p-error block text-xs text-left">
              {errors?.fromDate}
            </small>
          </div>
        </SwitchableField>
        <SwitchableField
          title="End date"
          className=""
          toggle={(val) => {
            setFormField('isEndDateEnabled', val)
          }}
          subtitle="Can only be minted between a to a specific timedate."
        >
          <div className="flex flex-column flex-grow-1 ml-1">
            <Label className="">End Date</Label>
            <Calendar
              dateFormat="mm/dd/yy"
              showTime={true}
              value={form.toDate}
              onChange={(e) => setFormField('toDate', e.value)}
            />
            <small className="p-error block text-xs text-left">
              {errors?.toDate}
            </small>
          </div>
        </SwitchableField>
        {!process.env.REACT_APP_DISABLE_SECRET_CODE && (
          <SwitchableField
            title="Use Secret Code"
            subtitle="Your FLOAT can only be minted if people know the secret code."
            toggle={(val) => {
              setFormField('isSecretCodeEnabled', val)
            }}
          >
            <Label className="">Code</Label>
            <InputText
              className="mb-2"
              value={form.secretCode || 0}
              onChange={(e) => setFormField('secretCode', e.target.value)}
            />
          </SwitchableField>
        )}

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
              onChange={(e) => setFormField('paymentOption', e.value)}
              checked={form.paymentOption === 'Free'}
            />
          </div>
          <div className="flex align-items-center">
            <div className="flex-grow-1 mr-2">
              <div className="text-white text-sm text-left">Paid</div>
              <div className="text-xs text-left">
                This HASHIE costs tokens to claim. Suitable for things like
                tickets.
              </div>
            </div>
            <RadioButton
              name="paymentOption"
              value="Paid"
              onChange={(e) => setFormField('paymentOption', e.value)}
              checked={form.paymentOption === 'Paid'}
            />
          </div>
          {form.paymentOption === 'Paid' && (
            <>
              <InputNumber
                className="w-50 align-self-start w-full fee-input"
                value={form.fee || 0}
                onChange={(e) => {
                  setFormField('fee', e.value)
                }}
              />
              <small className="p-error block text-xs text-left mb-4">
                {errors?.fee}
              </small>
              <div className="text-xs text-left">Recipient address</div>
              <InputText
                className="w-50 align-self-start w-full fee-address-input"
                value={form.feeAddress || ''}
                onChange={(e) => {
                  setFormField('feeAddress', e.target.value || '')
                }}
              />
              <small className="p-error block text-xs text-left mb-4">
                {errors?.feeAddress}
              </small>
            </>
          )}
        </div>
        <ActionOrConnectButton
          actionLabel="Create event"
          className="submit mt-4"
          isLoading={isLoading}
          action={handleSubmit}
          eventId={eventId}
          isValid={!isValid}
        />
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
