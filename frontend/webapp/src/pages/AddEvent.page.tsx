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

export default () => {
  const [claimable, setClaimable] = useState(false);
  const [paymentOption, setPaymentOption] = useState<string>('Fee');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  return (
    <div className="flex flex-column justify-content-center align-items-center h-full">
      <h1 className="text-2xl font-bold text-white">Create a new event</h1>
      <Card classNames="flex flex-column add-event">
        <Label className="">Event Name</Label>
        <InputText className="mb-4" />
        <Label className="">Event URL</Label>
        <InputText className="mb-4" />
        <Label className="">Event Description</Label>
        <InputTextarea rows={5} className="mb-4" />

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
          className=""
          subtitle="Your FLOAT can only be minted if people know the secret code."
        >
          <Label className="">Code</Label>
          <InputTextarea rows={5} className="mb-8" />
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

        <Button label="Connect Wallet" className="submit mt-4" />
      </Card>
    </div>
  );
};
