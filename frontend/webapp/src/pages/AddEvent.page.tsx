import React, { useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { RadioButton } from 'primereact/radiobutton'
import Card from '../componeont/Card'
import Label from '../componeont/Label'
import SwitchableField from '../componeont/SwitchableField'
import { useHeaderAccess } from '../context/HederaProvider'
import {
  ContractExecuteTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk'
import HashieConfig from '../settings.json'
import BigNumber from 'bignumber.js'
import { hashMessage } from '@hashgraph/hethers/lib.esm/utils'
import { storeNFT } from '../helpers/ipfs'

import './AddEvent.scss'

const AddEvent = () => {
  const [eventName, setEventName] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [paymentOption, setPaymentOption] = useState<string>('Free')
  const [fromDate, setFromDate] = useState<Date>(new Date())
  const [description, setDescription] = useState('')
  const { isConnected, connect, signer } = useHeaderAccess()
  const [isLoading, setIsLoading] = useState(false)
  const [eventId, setEventId] = useState<BigNumber | null>(null)

  const fileUploadRef = useRef(null)

  const handleConnect = async () => {
    setIsLoading(true)
    connect()
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const generateEventId = () =>
    BigNumber(hashMessage(signer?.getAccountId() + eventName))

  const handleSubmit = async () => {
    if (!signer) {
      throw new Error('No signer!')
    }
    if (!selectedImage) {
      throw new Error('No image!')
    }
    try {
      setIsLoading(true)

      const t = await storeNFT(selectedImage, 'Lorem', 'Ipsum')
      const metadataURL = `https://ipfs.io/ipfs/${t.ipnft}/metadata.json`
      console.log('metadataURL: ', metadataURL)

      const _eventId = generateEventId()

      // TODO Put the rest of the settings into JSON and store it to IPFS
      const tx = await new ContractExecuteTransaction()
        .setContractId(HashieConfig.address)
        .setFunction(
          'createCollection',
          new ContractFunctionParameters()
            .addUint256(_eventId)
            .addString(eventName)
            .addString(metadataURL)
        )
        .setGas(900000) // TODO Use a gas calculator
        .freezeWithSigner(signer)

      const result = await tx.executeWithSigner(signer)
      console.log(result)
      setIsLoading(false)
      setEventId(_eventId)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectImage = async (e: any) => {
    console.log(e.target.files[0])
    setSelectedImage(e.target.files[0])
  }

  return (
    <div className="flex flex-column justify-content-center align-items-center h-full">
      <h1 className="text-2xl font-bold text-white">Create a new event</h1>
      <Card className="flex flex-column add-event">
        <Label className="">Event Name</Label>
        <InputText
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="mb-4"
        />
        <Label className="">Event URL</Label>
        <InputText className="mb-4" />
        <Label className="">Event Description</Label>
        <InputTextarea
          rows={10}
          cols={30}
          className="mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Label className="">Select on Image</Label>
        <div className="flex flex-start gap-2 mb-2">
          <input type="file" ref={fileUploadRef} onChange={handleSelectImage} />
        </div>
        <SwitchableField
          title="Limited quantity"
          className=""
          subtitle="You can set the maximum number of times the FLOAT can be minted."
        >
          <Label className="">Amount</Label>
          <InputNumber className="mb-4 w-50 align-self-start" />
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
                onChange={(e) => setFromDate(e.value as Date)}
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
          <InputText className="mb-2" />
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
            disabled={eventId !== null}
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
        {eventId !== null && (
          <div className="flex flex-start gap-2 mb-2">
            <a href={`/confirmation/${eventId.toString(16)}`}>
              Go to the minting page
            </a>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AddEvent
