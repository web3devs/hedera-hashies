import React, { useState } from 'react';
import { Button, InputNumber, InputSwitch, InputText } from 'primereact';
import Card from '../componeont/Card';
import Label from '../componeont/Label';

import './AddEvent.scss';

export default () => {
  const [claimable1, setClaimable1] = useState(false);
  const [claimable2, setClaimable2] = useState(false);
  return (
    <Card classNames="flex flex-column add-event">
      <Label className="">Event Name</Label>
      <InputText className="mb-4" />
      <Label className="">Event URL</Label>
      <InputText className="mb-4" />
      <Label className="">Event Description</Label>
      <InputText className="mb-4" />
      <div className="text-white text-left text-base mb-4">Configuration</div>
      <div className="grid grid-nogutter">
        <div className="text-left text-sm col-11">
          <span className="text-white">Claimable</span>{' '}
          <span className="text-300">(can be changed later)</span>
        </div>
        <InputSwitch
          className="mb-2"
          checked={claimable1}
          onChange={(e) => {
            setClaimable1(e.target.value);
          }}
        />
      </div>

      <div className="text-left text-xs mb-4">
        Users can mint their own FLOAT based on the parameters defined below.
      </div>
      <Label className="">Amount</Label>
      <InputNumber className="mb-4" />
      <div className="grid grid-nogutter">
        <div className="col-11">
          <div className="text-left text-sm">
            <span className="text-white">Claimable</span>
          </div>
          <div className="text-left text-xs mb-4">
            Users can mint their own FLOAT based on the parameters defined
            below.
          </div>
        </div>

        <InputSwitch
          className="mb-2"
          checked={claimable2}
          onChange={(e) => {
            setClaimable2(e.target.value);
          }}
        />
      </div>

      <Button label="Connect Wallet" className="submit" />
    </Card>
  );
};
