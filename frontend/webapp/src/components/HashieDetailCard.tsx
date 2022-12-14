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

  async function getHashieMetadata(collectionId: BigNumberish) {
    const collection = (await getCollectionById(collectionId)) as ICollection
    console.log(collection)
    const uri = collection.uri

    const response = await fetch(uri) // TODO The assets stored on IPFS need to be pinned!
    const data: HashieToken = await response.json()
    const { image, name, description, url } = data

    console.log(data)

    setImage(image.name)
    setName(name)
    setDescription(description)
    setUri(url)
  }

  useEffect(() => {
    getHashieMetadata(collectionId)
  }, [collectionId])

  return (
    <div className="flex justify-content-center align-items-center">
      <Card className="grid grid-nogutter xl:xl:w-4 lg:w-6 md:w-7 sm:w-full">
        {image ? (
          <Image
            src={image}
            alt="Event image"
            className="col-3"
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

        {/*<div className="col-12 grid grid-nogutter mt-4">*/}
        {/*  <div className="flex flex-column col-6">*/}
        {/*    <div className="text-sm text-left">Tokens minted</div>*/}
        {/*    <div className="text-sm text-left text-white mt-2">*/}
        {/*      {mintedNum}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </Card>
    </div>
  )
}

export default HashiesDetailCard
