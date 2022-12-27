import { Image } from 'primereact'
import Star from '../assets/img-star.svg'
import React, { useState } from 'react'
import { webifyUri } from '../helpers/ipfs'

type ImageProps = {
  imageUri: string | null
  className: string | null
}

const HashieImage = ({ imageUri, className }: ImageProps) => {
  const [usePlaceholderImage, setUsePlaceholderImage] = useState<boolean>(false)
  const onErrorImage = () => setUsePlaceholderImage(true)
  return (
    <Image
      src={imageUri && !usePlaceholderImage ? webifyUri(imageUri) : Star}
      alt="Event image"
      className={className || 'col-3 m-2'}
      width="120"
      height="120"
      style={{
        width: '120px',
        height: '120px'
      }}
      onError={onErrorImage}
      preview
    />
  )
}

export default HashieImage
