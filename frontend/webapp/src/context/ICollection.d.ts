import { BigNumber } from 'ethers'

interface ICollection {
  owner: string;
  name: string;
  uri: string;
  maxSupply: BigNumber;
  earliestMintTimestamp: BigNumber;
  latestMintTimestamp: BigNumber;
  requiredPayment: BigNumber;
  flags: BigNumber;
}