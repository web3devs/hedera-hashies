# Hedera POAP
Hedera POAP is a project to implement POAP NFTs on the Hedera Network.

## What is a POAP?
According to the [orignal POAP site](https://poap.xyz/): 

> POAPs are digital mementos, minted in celebration of life's remarkable moments. Each POAP is a gift from an issuer to
> collectors, in celebration of a special shared memory. By minting these memories to the blockchain, collectors build a
> rich tapestry of tokenized experiences which unlock a world of possibilities.

Under the hood, POAPs are NFTs that are easily minted through a web3app. POAPs differ from "classic" NFTs in that each
instance or "drop" has multiple copies of it minted. Each copy is identical to each other copy with the exception of the
serial number.

## POAP Parameters
All POAPs are usually minted from the same contract and are distributed in "drops". To set up a drop, an event planner
provides the following information through a DAPP:

- name of the drop
- a description of the drop
- location of the event; city and country if it is a IRL event, or a URL for virtual events
- The dates that a POAP can be claimed (until minting is closed manually if not specified)
- date of the event
- an small image
- maximum quantity of POAPs in the drop (unlimited if not specified)
- a claim code that must be used to claim a POAP from a drop (optional)
- A list of addresses that can claim a POAP (optional)
- whether a POAP is transferable
- required assets (optional)
- required payment (free if not specified)

## Existing POAP Platforms
- [POAP](https://poap.xyz/) - The original POAP project (Gnosis/Ethereum)
- [FLOATS](https://floats.city/) - Flow Blockchain

## Resources
- [Create and mint NFTs on Hedera](https://docs.hedera.com/guides/getting-started/try-examples/create-and-transfer-your-first-nft)
- [React Boilerplate for Hedera](https://github.com/publu/hedera-reactjs-boilerplate)
- [HIP-17 Non-Fungible Tokens](https://hips.hedera.com/hip/hip-17)
- [HIP-412 NFT Token Metadata Schema](https://hips.hedera.com/hip/hip-412)

## Unknown
- Building and deploying Hedera contracts
- What are the maintenance requirements?
- Do we need to run a node to manage POAP minting? 