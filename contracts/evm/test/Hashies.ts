import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { Status } from '@hashgraph/sdk'
import {executeAndGetEvent} from './helpers'

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
      const { hashies } = await loadFixture(deployFixture)

      const HashiesV2 = await ethers.getContractFactory("TestV2");
      const v2 = await upgrades.upgradeProxy(hashies.address, HashiesV2);

      // TODO check to make sure it worked
    })
  })

  describe('Collections', () => {
    const NAME = 'My really cool collection'
    const METADATA_URI = 'ipfs://MyCollection'

    it('should allow anyone to create a collection', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)

      const startCollectionsCount = await hashies.collectionsCount()
      const collectionId = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI)

      // Check the collection count
      const collectionsCount = await hashies.collectionsCount()
      expect(collectionsCount).to.be.gt(startCollectionsCount)

      // Check the collection entry
      const collection = await hashies.collections(startCollectionsCount)
      expect(collection.owner).to.equal(collectionOwner.address)
      expect(collection.name).to.equal(NAME)
      expect(collection.uri).to.equal(METADATA_URI)
    })
    it('should emit an event when a collection is created', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)
      await expect(
        await hashies.connect(collectionOwner)
          .createCollection(NAME, METADATA_URI)
      ).to.emit(hashies, 'CollectionCreated')
        .withArgs(collectionOwner.address, anyValue)

    })
    it('should return a uri for the collection', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)
      const collectionCreatedEvent = await executeAndGetEvent(
        await hashies.connect(collectionOwner)
          .createCollection(NAME, METADATA_URI),
        'CollectionCreated'
      )
      const collectionId = collectionCreatedEvent.collectionId
      expect(await hashies.uri(collectionId)).to.equal(METADATA_URI)
    })
    it('should reject empty collection names', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)
      await expect(
        hashies.connect(collectionOwner).createCollection('', METADATA_URI)
      ).to.be.revertedWithCustomError(hashies, 'EmptyName')
    })
  })

  describe('Minting', () => {
    const NAME = 'Check this one out'
    const METADATA_URI = 'ipfs://Wowza'

    let hashies, minter, collectionId

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      const { collectionOwner } = fixture
      hashies = fixture.hashies
      minter = fixture.minter
      collectionId = await hashies.collectionsCount()
      await hashies.connect(collectionOwner).createCollection(NAME, METADATA_URI)
    })
    it('should mint an NFT', async () => {
      // await expect(
      //   () => hashies.connect(minter).mint(collectionId)
      // ).to.changeTokenBalance(hashies, minter,1)
      expect(await hashies.balanceOf(minter.address, collectionId)).to.equal(0)
      await hashies.connect(minter).mint(collectionId)
      expect(await hashies.balanceOf(minter.address, collectionId)).to.equal(1)
    })
    it('should not allow mint duplicates', async () => {
      await hashies.connect(minter).mint(collectionId)
      await expect(hashies.connect(minter).mint(collectionId))
        .to.be.revertedWithCustomError(hashies, 'OnlyOneAllowedPerAddress')
        .withArgs(minter.address, collectionId)
    })
    it('should revert when minting a non-existant collection', async () => {
      await expect(hashies.connect(minter).mint(999))
        .to.be.revertedWithCustomError(hashies, 'UnknownCollection')
    })
  })
})