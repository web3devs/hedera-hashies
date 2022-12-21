import React, { useRef } from 'react'
import { Image } from 'primereact'
import Star from '../assets/img-star.svg'
import Card from './Card'
import { useEffect, useState } from 'react'
import { useAurora } from '../context/AuroraProvider'
import { BigNumberish } from '@hashgraph/hethers'
import { ICollection } from '../context/ICollection'
import { webifyUri } from '../helpers/ipfs'
import HashieImage from './HashieImage'

const HashiesDetailCard = ({ collectionId }: any) => {
  const { getCollectionById } = useAurora()

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [eventUrl, setEventUrl] = useState<string>()

  const i = useRef()

  async function getHashieMetadata(collectionId: BigNumberish) {
    const collection = (await getCollectionById(collectionId)) as ICollection
    const uri = webifyUri(collection.uri)

    const response = await fetch(uri) // TODO The assets stored on IPFS need to be pinned!
    const data: any = await response.json()
    const { image, name, description, url } = data

    setImageUri(image)
    setName(name)
    setDescription(description)
    setEventUrl(url)
  }

  useEffect(() => {
    getHashieMetadata(collectionId)
  }, [collectionId])

  return (
    <Card className="grid grid-nogutter col-4 m-1 h-20rem overflow-auto">
      <HashieImage imageUri={imageUri} className="col-3 m-2" />
      <div className="text-lg text-left text-white col-9 pl-4">
        <h2 className="mt-0">{name || 'Loading...'}</h2>
      </div>

      <div className={`col-${eventUrl ? '6' : '12'} grid grid-nogutter`}>
        <div className="text-sm text-left col-12 mt-4">Description</div>
        <div className="text-sm text-left text-white col-12 mt-2">
          {description || 'Loading...'}
        </div>
      </div>
      {eventUrl && (
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Event URL</div>
          <div className="text-sm text-left text-white col-12 mt-2">
            <a href={eventUrl} target="_blank" rel="noreferrer">
              {eventUrl}
            </a>
          </div>
        </div>
      )}
    </Card>
  )
}

export default HashiesDetailCard
