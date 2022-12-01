import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { Status } from '@hashgraph/sdk'
import UpdateFileHashDoesNotMatchPrepared = Status.UpdateFileHashDoesNotMatchPrepared

describe('Hashies', function() {
  async function deployFixture() {
    const [owner, collectionOwner, minter, mallory] = await ethers.getSigners()

    const Hashies = await ethers.getContractFactory('Hashies')
    const hashies = await upgrades.deployProxy(Hashies, [])

    return { hashies, owner, collectionOwner, minter, mallory }
  }

  describe('Deployment', function() {
    it('Should set the right owner', async function() {
      const { hashies, owner } = await loadFixture(deployFixture)
      expect(await hashies.owner()).to.equal(owner.address)
    })
    it('Should be upgradable', async function() {
      const { hashies, owner } = await loadFixture(deployFixture)

      const HashiesV2 = await ethers.getContractFactory("TestV2");
      const v2 = await upgrades.upgradeProxy(hashies.address, HashiesV2);

    })
  })
})