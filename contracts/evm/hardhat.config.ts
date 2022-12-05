require('dotenv').config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades"

const AURORA_PRIVATE_KEY = process.env.AURORA_PRIVATE_KEY;
const AURORA_API_KEY = process.env.AURORA_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    aurora: {
      url: `https://mainnet.aurora.dev/${AURORA_API_KEY}`,
      accounts: [`0x${AURORA_PRIVATE_KEY}`],
      chainId: 1313161554,
      gasPrice: 120 * 1000000000
    },
    testnet_aurora: {
      url: 'https://testnet.aurora.dev',
      accounts: [`0x${AURORA_PRIVATE_KEY}`],
      chainId: 1313161555,
      gasPrice: 120 * 1000000000
    },
    local_aurora: {
      url: 'http://localhost:8545',
      accounts: [`0x${AURORA_PRIVATE_KEY}`],
      chainId: 31337,
      gasPrice: 120 * 1000000000
    },
  }

};

export default config;
