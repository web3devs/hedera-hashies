import React, { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import Card from '../components/Card'
import Star from '../assets/img-star.svg'
import { ProgressSpinner } from 'primereact/progressspinner'
import './Confirmation.scss'
import { useParams } from 'react-router-dom'

const Confirmation = () => {
  const { code: collectionId } = useParams()
  const [loading, isLoading] = useState<boolean>(true)
  const [name, setName] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  useEffect(() => {
    if (!collectionId) return

    const _fetch = async () => {
      isLoading(true)
      const response = await fetch(
        `https://ipfs.io/ipfs/${collectionId}/metadata.json`
      )
      const { description, image, name } = await response.json()
      if (image.startsWith('ipfs://')) {
        const [imageCid, imageFileName] = image
          .replace(/^ipfs:\/\//, '')
          .split('/')
        setImage(`https://ipfs.io/ipfs/${imageCid}/${imageFileName}`)
      } else {
        setImage(image)
      }
      setDescription(description)
      setName(name)
      isLoading(false)
    }
    if (name === null && description === null && image === null) {
      _fetch()
    }
  }, [collectionId, name, description, image])

  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="w-7 grid grid-nogutter">
        {image ? (
          <img src={image} alt="Event image" className="col-3" />
        ) : (
          <img src={Star} alt="Placeholder image" className="col-3" />
        )}
        <div className="text-lg text-left text-white col-9 pl-4">
          {name}
          {loading && <ProgressSpinner />}
        </div>
        <div className="tex-sm text-left col-12 mt-4">Status</div>
        <div className="tex-sm text-left text-white col-12 mt-2">Status</div>
        <div className="tex-sm text-left col-12 mt-4">Event description</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          {description}
        </div>
        {/* <div className="tex-sm text-left col-12 mt-4">Limited quantity</div>
        <div className="tex-sm text-left text-white col-12 mt-2">1000</div> */}
        {/* <div className="tex-sm text-left col-12 mt-4">Time limit</div>
        <div className="tex-sm text-left text-white col-12 mt-2">
          10/10/2022 — 12/10/2022
        </div> */}
        {/* <div className="tex-sm text-left col-12 mt-4">Cost</div>
        <div className="tex-sm text-left text-white col-12 mt-2">Free</div> */}
        <div className="tex-sm text-left col-12 mt-4">Claim URL</div>
        <div className="col-12 mb-4 flex align-items-center">
          <a href={`${window.location.origin}/mint/${collectionId}`}>
            {window.location.origin}/mint/{collectionId}
          </a>
          <Button icon="pi pi-copy" className="p-button-text" />
        </div>
        <div className="col-12 text-xs">
          <p>Event id: {collectionId}</p>
          <p>Created on 6.06.2022, 04:43:19</p>
        </div>
      </Card>
    </div>
  )
}

export default Confirmation
