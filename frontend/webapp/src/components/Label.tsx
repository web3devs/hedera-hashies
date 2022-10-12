import React from 'react'

import './Label.scss'

const Label = ({
  children,
  className = '',
  white = false
}: {
  children: string
  className: string
  white?: boolean
}) => (
  <div className={`${className} label text-left ${white && 'text-white'}`}>
    {children}
  </div>
)

export default Label
