import React, { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import HashieDetailCard from '../components/HashieDetailCard'
import { useAurora } from '../context/AuroraProvider'
import HashieCollectionDetailCard from '../components/HashieCollectionDetailCard'

const ListPage = () => {
  const { getOwnedTokens, getOwnedCollections, account } = useAurora()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [ownedTokens, setOwnedTokens] = useState<Array<BigNumber>>([])
  const [ownedCollections, setOwnedCollections] = useState<Array<BigNumber>>([])

  useEffect(() => {
    const doIt = async () => {
      setOwnedTokens(await getOwnedTokens())
      setOwnedCollections(await getOwnedCollections())
      setIsLoading(false)
    }
    setIsLoading(true)
    doIt()
  }, [account])

  return (
    <>
      <section className="w-12">
        <h1>Minted</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-wrap justify-content-center align-items-center">
            {ownedTokens.length ? (
              ownedTokens.map((tokenId, idx) => (
                <HashieDetailCard
                  key={`token-${idx}`}
                  collectionId={tokenId.toString()}
                />
              ))
            ) : (
              <h3>No hashies minted</h3>
            )}
          </div>
        )}
      </section>
      {ownedCollections?.length && (
        <section className="w-12">
          <h1>Collections</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="flex flex-wrap justify-content-center align-items-center">
              {ownedCollections.map((tokenId, idx) => (
                <HashieCollectionDetailCard
                  key={`collection-${idx}`}
                  collectionId={tokenId.toString()}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default ListPage
