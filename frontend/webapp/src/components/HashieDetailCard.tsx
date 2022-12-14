import React from 'react'
import { Image } from 'primereact'
import Star from '../assets/img-star.svg'
import Card from './Card'
import { useEffect, useState } from 'react'
import { useAurora } from '../context/AuroraProvider'
import { BigNumberish } from '@hashgraph/hethers'
import { ICollection } from '../context/ICollection'
import { HashieToken } from '../helpers/ipfs'

const HashiesDetailCard = ({ collectionId }: any) => {
  const { getCollectionById } = useAurora()

  const [image, setImage] = useState<string>()
  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [uri, setUri] = useState<string>()

  function webify(uri: string): string {
    return uri.startsWith('ipfs://')
      ? `https://ipfs.io/ipfs/${uri.slice(7)}`
      : uri
  }

  async function getHashieMetadata(collectionId: BigNumberish) {
    const collection = (await getCollectionById(collectionId)) as ICollection
    const uri = collection.uri

    const response = await fetch(uri) // TODO The assets stored on IPFS need to be pinned!
    const data: any = await response.json()
    const { image, name, description, url } = data

    setImage(webify(image))
    setName(name)
    setDescription(description)
    setUri(url)
  }

  useEffect(() => {
    getHashieMetadata(collectionId)
  }, [collectionId])

  return (
    <Card className="grid grid-nogutter col-3 m-1 h-20rem overflow-auto">
      {image ? (
        <Image
          src={image}
          alt="Event image"
          className="col-3 m-2"
          width="120"
          height="120"
          preview
        />
      ) : (
        <Image src={Star} alt="Placeholder image" className="col-3" preview />
      )}
      <div className="text-lg text-left text-white col-9 pl-4">
        <h2 className="mt-0">{name || 'Loading...'}</h2>
      </div>

      <div className={`col-${uri ? '6' : '12'} grid grid-nogutter`}>
        <div className="text-sm text-left col-12 mt-4">Description</div>
        <div className="text-sm text-left text-white col-12 mt-2">
          {description || 'Loading...'}
        </div>
      </div>
      {uri && (
        <div className="col-6 grid grid-nogutter">
          <div className="text-sm text-left col-12 mt-4">Event URL</div>
          <div className="text-sm text-left text-white col-12 mt-2">
            <a href={uri} target="_blank" rel="noreferrer">
              {uri}
            </a>
          </div>
        </div>
      )}
    </Card>
  )
}

export default HashiesDetailCard
