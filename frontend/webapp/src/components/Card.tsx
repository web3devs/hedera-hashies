import React from 'react'
import './Card.scss'

const Card = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string | undefined
}) => {
  return <div className={`${className} card`}>{children}</div>
}

export default Card
