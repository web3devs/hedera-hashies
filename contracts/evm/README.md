# Hashies Contracts

## Deployments
The EVM version of the contract is deployed as an upgradable proxy where calls to the proxy are forwarded to the contract with the actual implementation. Use the proxy address to call the contract. The implementation address is provided for reference only.

### Aurora Testnet
- Proxy: [0x464e97B5E2598D2CCEb1d186B35ACe2363fD11cb](https://testnet.aurorascan.dev/address/0x464e97B5E2598D2CCEb1d186B35ACe2363fD11cb)
- Implementation: [0x2C0f80c4ec1C0b310d074Cd0557628364E783248](https://testnet.aurorascan.dev/address/0x2C0f80c4ec1C0b310d074Cd0557628364E783248)

### OOPS Also deployed to mainnet
Address: [0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0](https://aurorascan.dev/address/0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0)

## What is a Hashie?
Hashies are easy-to-issue NFTs to mark participation in an event, similar to POAPs on the Ethereum network. According to the [orignal POAP site](https://poap.xyz/):

> POAPs are digital mementos, minted in celebration of life's remarkable moments. Each POAP is a gift from an issuer to collectors, in celebration of a special shared memory. By minting these memories to the blockchain, collectors build a rich tapestry of tokenized experiences which unlock a world of possibilities.

Under the hood, Hashies are NFTs that are easily minted through a web3app. Hashies differ from "classic" NFTs in that each instance or "drop" has multiple copies of it minted. Each copy is identical to each other copy with the exception of the serial number.

## Use cases
TBD

## Hashies Parameters
All Hashies are minted from the same contract and are distributed in "drops". To set up a drop, an event planner provides the following information through a DAPP:

- name of the drop
- a description of the drop
- location of the event; city and country if it is a IRL event, or a URL for virtual events
- Claim dates (until minting is closed manually if not specified)
- Date of the event
- an small image
- maximum quantity that can be claimed (unlimited if not specified)
- a claim code (optional)
- A list of addresses that can claim (optional)
- whether the Hashie can be transfered and/or burned
- required payment (free if not specified)

Additionally, other qualifying conditions may be added in the future.

## Similar ecosystems
- [POAP](https://poap.xyz/) - The original POAP project (Gnosis/Ethereum)
- [FLOATS](https://floats.city/) - Flow Blockchain

## Resources
- [Create and mint NFTs on Hedera](https://docs.hedera.com/guides/getting-started/try-examples/create-and-transfer-your-first-nft)
- [React Boilerplate for Hedera](https://github.com/publu/hedera-reactjs-boilerplate)
- [HIP-17 Non-Fungible Tokens](https://hips.hedera.com/hip/hip-17)
- [HIP-412 NFT Token Metadata Schema](https://hips.hedera.com/hip/hip-412)

## Commentary
There are many integrations built around the POAP ecosystem.
- [GitPOAP](https://www.gitpoap.io/) -- Automatically award POAPs for open source contributions

## Unknown
- What are the maintenance requirements?
