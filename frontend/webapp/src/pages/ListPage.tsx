import React, { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import HashieDetailCard from '../components/HashieDetailCard'
import { useAurora } from '../context/AuroraProvider'

const ListPage = () => {
  const { getOwnedTokens, account } = useAurora()
  const [ownedTokens, setOwnedTokens] = useState<Array<BigNumber>>([])
  console.log('>>>>>>>>', ownedTokens)

  useEffect(() => {
    const doIt = async () => {
      const ot = await getOwnedTokens()
      console.log('account:', account)
      console.log('ot:', ot)
      setOwnedTokens(ot)
    }
    doIt()
  }, [account])

  return (
    <>
      {ownedTokens.map((tokenId, idx) => (
        <HashieDetailCard key={idx} collectionId={tokenId.toString()} />
      ))}
    </>
  )
}

export default ListPage
