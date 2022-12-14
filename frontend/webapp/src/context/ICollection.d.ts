import { BigNumberish } from 'ethers'

interface ICollection {
  owner: string;
  name: string;
  uri: string;
  maxSupply: BigNumberish;
  earliestMintTimestamp: BigNumberish;
  latestMintTimestamp: BigNumberish;
  requiredPayment: BigNumberish;
  // uint256 flags;
}