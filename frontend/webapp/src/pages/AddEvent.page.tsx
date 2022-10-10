import React, { useState } from 'react';
import {
  Button,
  Calendar,
  InputNumber,
  InputText,
  InputTextarea,
  RadioButton
} from 'primereact';
import Card from '../componeont/Card';
import Label from '../componeont/Label';

import './AddEvent.scss';
import SwitchableField from '../componeont/SwitchableField';
import { useNavigate } from 'react-router-dom';
import Star from '../assets/img-star.svg';
import People from '../assets/img-people.svg';
import Present from '../assets/img-present.svg';
import { useHeaderAccess } from '../context/HederaProvider';
import { useEffect } from 'react';
import {ContractExecuteTransaction, ContractFunctionParameters} from "@hashgraph/sdk";
import HashieConfig from "../settings.json";
import BigNumber from "bignumber.js";

export default () => {
  const [eventName, setEventName] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<number | undefined>();
  const [paymentOption, setPaymentOption] = useState<string>('Free');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const { isConnected, connect, signer } = useHeaderAccess();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(selectedImage);
  }, [selectedImage]);

  const handleConnect = async () => {
    setIsLoading(true);
    connect();
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const generateEventId = () => BigNumber('0x032f75b3ca02a393196a818328bd32e8') // TODO Use hash of name? Random number?

  const handleSubmit = async () => {
    setIsLoading(true);

    const eventId = generateEventId();
    const tx = await new ContractExecuteTransaction()
        .setContractId(HashieConfig.address)
        .setFunction(
            'createEvent',
            new ContractFunctionParameters()
                .addUint256(eventId)
                .addString(eventName)
                .addString('bar')
        )
        .setGas(900000)
        .freezeWithSigner(signer)

    const result = await tx.executeWithSigner(signer)
    // console.log(result)

    setIsLoading(false)

    navigate(`/confirmation/${eventId}`);
  };

  return (
    <div className="flex flex-column justify-content-center align-items-center h-full">
      <h1 className="text-2xl font-bold text-white">Create a new event</h1>
      <Card className="flex flex-column add-event">
        <Label className="">Event Name</Label>
        <InputText
            value={eventName}
            onChange={e => setEventName(e.target.value)}
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
          <img
            src={Star}
            onClick={() => setSelectedImage(0)}
            alt="star"
            className={`image${
              selectedImage === 0 && ' selected'
            } cursor-pointer`}
          />
          <img
            src={People}
            onClick={() => setSelectedImage(1)}
            alt="people"
            className={`image${
              selectedImage === 1 && ' selected'
            } cursor-pointer`}
          />
          <img
            src={Present}
            onClick={() => setSelectedImage(2)}
            alt="present"
            className={`image${
              selectedImage === 2 && ' selected'
            } cursor-pointer`}
          />
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
              ></Calendar>
            </div>
            <div className="flex flex-column flex-grow-1 ml-1">
              <Label className="">EndDate Date</Label>
              <Calendar
                dateFormat="dd/mm/yy"
                value={fromDate}
                onChange={(e) => setFromDate(e.value as Date)}
                showTime
              ></Calendar>
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
          />
        ) : (
          <Button
            label="Connect Wallet"
            className="submit mt-4"
            loading={isLoading}
            onClick={handleConnect}
          />
        )}
      </Card>
    </div>
  );
};
