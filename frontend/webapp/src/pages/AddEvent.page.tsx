import React, { useCallback, useState } from 'react';
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

export default () => {
  const [isConnected, setIsConnected] = useState(false);
  const [paymentOption, setPaymentOption] = useState<string>('Fee');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
    }, 2000);
  };
  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/confirmation/032f75b3ca02a393196a818328bd32e8');
    }, 3000);
  };

  return (
    <div className="flex flex-column justify-content-center align-items-center h-full">
      <h1 className="text-2xl font-bold text-white">Create a new event</h1>
      <Card className="flex flex-column add-event">
        <Label className="">Event Name</Label>
        <InputText className="mb-4" />
        <Label className="">Event URL</Label>
        <InputText className="mb-4" />
        <Label className="">Event Description</Label>
        <InputTextarea
          rows={5}
          cols={30}
          className="mb-4"
          value={description}
          onChange={(e) => setDescription(event.target.value)}
        />

        <Label className="">Select on Image</Label>
        <InputText className="mb-4" />
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
              <div className="text-white text-sm text-left">Fee</div>
              <div className="text-xs text-left">
                Your HASHIE is currently free.
              </div>
            </div>
            <RadioButton
              name="paymentOption"
              value="Fee"
              onChange={(e) => setPaymentOption(e.value)}
              checked={paymentOption === 'Fee'}
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
