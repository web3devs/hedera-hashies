import { InputSwitch } from 'primereact/inputswitch';
import React, { useState } from 'react';
import Label from './Label';

export default ({ children, title, subtitle, className = '' }) => {
  const [checked, setChecked] = useState(false);
  return (
    <div className={`${className} flex flex-column  mb-2`}>
      <div className="flex">
        <div className="flex-grow-1">
          <div className="text-left text-sm flex-grow-1 text-white">
            {title}
          </div>
          <div className="text-left text-xs">{subtitle}</div>
        </div>
        <InputSwitch
          className=""
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.value);
          }}
        />
      </div>
      <>{checked && children}</>
    </div>
  );
};
