import React, { ReactElement, useState } from 'react'

import { InputSwitch } from 'primereact/inputswitch'

const SwitchableField = ({
  children,
  title,
  subtitle,
  className = ''
}: {
  children: ReactElement | ReactElement[]
  title: string
  subtitle: string
  className?: string
}) => {
  const [checked, setChecked] = useState(false)
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
            setChecked(e.target.value)
          }}
        />
      </div>
      <>{checked && children}</>
    </div>
  )
}

export default SwitchableField
