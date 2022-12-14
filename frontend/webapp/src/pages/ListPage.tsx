import React, { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import HashieDetailCard from '../components/HashieDetailCard'
import { useAurora } from '../context/AuroraProvider'

const ListPage = () => {
  const { getOwnedTokens, account } = useAurora()
  const [ownedTokens, setOwnedTokens] = useState<Array<BigNumber>>([])

  useEffect(() => {
    const doIt = async () => {
      const ot = await getOwnedTokens()
      setOwnedTokens(ot)
    }
    doIt()
  }, [account])

  return (
    <>
      <section className="w-12">
        <h1>Minted</h1>
        <div className="flex flex-wrap justify-content-center align-items-center">
          {ownedTokens.map((tokenId, idx) => (
            <HashieDetailCard key={idx} collectionId={tokenId.toString()} />
          ))}
        </div>
      </section>
      <section className="w-12">
        <h1>Collections Created</h1>
      </section>
    </>
  )
}

export default ListPage
