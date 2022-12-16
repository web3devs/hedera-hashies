import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { executeAndGetEvent } from './helpers'

// Bit locations
const TRANSFERABLE_FLAG_BIT = 0;
const BURNABLE_FLAG_BIT = 1;
const SECRET_WORD_TOKEN_REQUIRED_BIT = 2;
const MINTING_DISABLED_BIT = 3;

function getCollectionId(collectionRx: any) {
  const event = collectionRx.events.findIndex(ev => ev.event === 'CollectionCreated')
  const collectionId = collectionRx.events[event].args[1]
  return collectionId
}

describe('Hashies', function() {
  async function deployFixture() {
    const [
      owner,
      collectionOwner, collectionOwner2,
      minter, minter2,
      transferee,
      mallory
    ] = await ethers.getSigners()

    const Hashies = await ethers.getContractFactory('Hashies')
    const hashies = await upgrades.deployProxy(Hashies, [])

    return {
      hashies, owner, collectionOwner, collectionOwner2,
      minter, minter2, transferee, mallory
    }
  }

  function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time * 1000));
  }

  describe('Deployment', function() {
    it('Should set the right owner', async function() {
      const { hashies, owner } = await loadFixture(deployFixture)
      expect(await hashies.owner()).to.equal(owner.address)
    })
    it('Should be upgradable', async function() {
      const { hashies } = await loadFixture(deployFixture)

      const HashiesV2 = await ethers.getContractFactory('TestV2')
      const v2 = await upgrades.upgradeProxy(hashies.address, HashiesV2)

      // TODO check to make sure it worked
    })
  })
  describe('Collections', () => {
    const NAME = 'My really cool collection'
    const METADATA_URI = 'ipfs://MyCollection'

    it('should allow anyone to create a collection', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)

      const startCollectionsCount = await hashies.collectionsCount()
      await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0)

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
          .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0)
      ).to.emit(hashies, 'CollectionCreated')
        .withArgs(collectionOwner.address, anyValue)

    })
    it('should return a uri for the collection', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)
      const collectionCreatedEvent = await executeAndGetEvent(
        await hashies.connect(collectionOwner)
          .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0),
        'CollectionCreated'
      )
      const collectionId = collectionCreatedEvent.collectionId
      expect(await hashies.uri(collectionId)).to.equal(METADATA_URI)
    })
    it('should reject empty collection names', async () => {
      const { hashies, collectionOwner } = await loadFixture(deployFixture)
      await expect(
        hashies.connect(collectionOwner)
          .createCollection('', METADATA_URI, 0, 0, 0, 0, 0)
      ).to.be.revertedWithCustomError(hashies, 'EmptyName')
    })
  })
  describe('Minting', () => {
    const NAME = 'Check this one out'
    const METADATA_URI = 'ipfs://Wowza'

    let hashies, minter, collectionId, collectionOwner

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      collectionOwner = fixture.collectionOwner
      hashies = fixture.hashies
      minter = fixture.minter
      collectionId = await hashies.collectionsCount()
      await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0)
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
    describe('pausing', () => {
      it('should emit when a collection is paused', async () => {
        await expect(hashies.connect(collectionOwner).pauseMinting(collectionId))
          .to.emit(hashies, 'MintingPaused')
          .withArgs(collectionId)
      })
      it('should revert after minting has been paused', async () => {
        await hashies.connect(collectionOwner).pauseMinting(collectionId)
        await expect(hashies.connect(minter).mint(collectionId))
          .to.be.revertedWithCustomError(hashies, 'MintingDisabled')
      })
      it('should revert when paused by non-owner', async () => {
        await expect(hashies.connect(minter).pauseMinting(collectionId))
          .to.be.revertedWithCustomError(hashies, 'OnlyCollectionOwner')
      })
      it('should revert when already paused', async () => {
        await hashies.connect(collectionOwner).pauseMinting(collectionId)
        await expect(hashies.connect(collectionOwner).pauseMinting(collectionId))
          .to.be.revertedWithCustomError(hashies, 'MintingDisabled')
      })
      it('should revert when an unknown collection is paused', async () => {
        await expect(hashies.connect(collectionOwner).pauseMinting(999))
          .to.be.revertedWithCustomError(hashies, 'UnknownCollection')
      })
    })
    describe('resuming', () => {
      beforeEach(async () => {
        await hashies.connect(collectionOwner).pauseMinting(collectionId)
      })
      it('should emit when a collection is resumed', async () => {
        await expect(hashies.connect(collectionOwner).resumeMinting(collectionId))
          .to.emit(hashies, 'MintingResumed')
          .withArgs(collectionId)
      })
      it('should succeed when minting is resumed', async () => {
        await hashies.connect(collectionOwner).resumeMinting(collectionId)
        await hashies.connect(minter).mint(collectionId)
      })
      it('should revert when resumed by non-owner', async () => {
        await expect(hashies.connect(minter).resumeMinting(collectionId))
          .to.be.revertedWithCustomError(hashies, 'OnlyCollectionOwner')
      })
      it('should revert when not paused', async () => {
        await hashies.connect(collectionOwner).resumeMinting(collectionId)
        await expect(hashies.connect(collectionOwner).resumeMinting(collectionId))
          .to.be.revertedWithCustomError(hashies, 'MintingActive')
      })
      it('should revert when an unknown collection is resumed', async () => {
        await expect(hashies.connect(collectionOwner).resumeMinting(999))
          .to.be.revertedWithCustomError(hashies, 'UnknownCollection')
      })
    })
    describe('with secret word', () => {
      it('should mint when a secret word token is supplied')
      it('should revert when no secret word token is supplied')
    })
  })
  describe('Minting payment', () => {
    const NAME = 'Check this one out'
    const METADATA_URI = 'ipfs://Wowza'

    let hashies, minter, collectionOwner, collectionId

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      hashies = fixture.hashies
      collectionOwner = fixture.collectionOwner
      minter = fixture.minter
      collectionId = await hashies.collectionsCount()
      await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 1000, 0)
    })
    it('should a mint a token when sufficient payment is sent', async () => {
      await expect(
        () => hashies.connect(minter).mint(collectionId, {value: 1000})
      )
        .to.changeEtherBalances(
          [minter.address, collectionOwner.address],
        [-1000, 1000])
    })
    it('should emit a PaymentReceived event', async () => {
      await expect(hashies.connect(minter).mint(collectionId, {value: 1000}))
        .to.emit(hashies, 'PaymentReceived')
        .withArgs(collectionId, collectionOwner.address, 1000)
    })
    it('should reject a mint request with no payment', async () => {
      await expect(hashies.connect(minter).mint(collectionId))
        .to.revertedWithCustomError(hashies, 'InsufficientPayment')
        .withArgs(1_000, 0)
    })
    it('should reject a mint request with a payment that is too low', async () => {
      await expect(hashies.connect(minter).mint(collectionId, {value: 500}))
        .to.revertedWithCustomError(hashies, 'InsufficientPayment')
        .withArgs(1_000, 500)
    })
  })
  describe('Burning', () => {
    const NAME = "Burn baby burn"
    const METADATA_URI = "Disco Inferno"
    let collectionOwner, hashies, minter
    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      collectionOwner = fixture.collectionOwner
      hashies = fixture.hashies
      minter = fixture.minter
    })
    it('should allow burning of burnable hashies', async () => {
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 1 << BURNABLE_FLAG_BIT)
      const collectionId = getCollectionId(await tx.wait())
      await hashies.connect(minter).mint(collectionId)
      await expect(hashies.connect(minter).burn(minter.address, collectionId, 1))
        .to.emit(hashies, 'TransferSingle')
        .withArgs(
          minter.address, minter.address,
          ethers.constants.AddressZero, collectionId, 1
        )
    })
    it('should revert burning of non-burnable hashies', async () => {
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0)
      const collectionId = getCollectionId(await tx.wait())
      await hashies.connect(minter).mint(collectionId)
      await expect(hashies.connect(minter).burn(minter.address, collectionId, 1))
        .to.be.revertedWithCustomError(hashies, 'NotBurnable')
    })
    it('should revert burning of hashies owned by other users', async () => {
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 1 << BURNABLE_FLAG_BIT)
      const collectionId = getCollectionId(await tx.wait())
      await hashies.connect(minter).mint(collectionId)
      await expect(hashies.connect(collectionOwner).burn(minter.address, collectionId, 1))
        .to.be.revertedWith('ERC1155: caller is not token owner or approved')
    })
    it('should revert burning of hashies from unknown collections', async () => {
      await expect(hashies.connect(collectionOwner).burn(minter.address, 0, 1))
        .to.be.revertedWithCustomError(hashies, "UnknownCollection")
    })
    it('should revert when user doesn\'t have the hashie', async () => {
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 1 << BURNABLE_FLAG_BIT)
      const collectionId = getCollectionId(await tx.wait())
      await expect(hashies.connect(minter).burn(minter.address, collectionId, 1))
        .to.be.revertedWith('ERC1155: burn amount exceeds totalSupply')
    })
  })
  describe('Supply limit', () => {
    const NAME = 'Check this one out'
    const METADATA_URI = 'ipfs://Wowza'

    let hashies, minter, minter2, collectionOwner

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      collectionOwner = fixture.collectionOwner
      hashies = fixture.hashies
      minter = fixture.minter
      minter2 = fixture.minter2
    })
    it('should allow unlimited minting when maxSupply is zero', async () => {
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0)
      const collectionId = getCollectionId(await tx.wait())
      await hashies.connect(minter).mint(collectionId)
      await hashies.connect(minter2).mint(collectionId)
    })
    it('should limit minting when maxSupply is not zero', async () => {
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 1, 0, 0, 0, 0)
      const collectionId = getCollectionId(await tx.wait())
      await hashies.connect(minter).mint(collectionId)
      await expect(hashies.connect(minter2).mint(collectionId)).to.be
        .revertedWithCustomError(hashies, 'MintLimitReached')
    })
  })
  describe('Time limits', () => {
    const NAME = 'Check this one out'
    const METADATA_URI = 'ipfs://Wowza'

    let hashies, minter, collectionOwner

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      collectionOwner = fixture.collectionOwner
      hashies = fixture.hashies
      minter = fixture.minter
    })
    it('should reject collection creation with timestamps out of order', async () => {
      const now = Math.floor(new Date().getTime() / 1000)
      await expect(hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, now + 3600, now + 600, 0, 0))
        .to.revertedWithCustomError(hashies, 'TimestampsOutOfOrder')
    })
    it('should reject contract creation when the end time is before now', async () => {
      const now = Math.floor(new Date().getTime() / 1000)
      await expect(hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, now - 3600, 0, 0))
        .to.revertedWithCustomError(hashies, 'EndingTimestampTooEarly')
    })
    it('should allow minting when within the time limit', async () => {
      const now = Math.floor(new Date().getTime() / 1000)
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, now - 3600, now + 3600, 0, 0)
      const collectionId = getCollectionId(await tx.wait())
      await hashies.connect(minter).mint(collectionId)
    })
    it('should reject minting when before the start time', async () => {
      const now = Math.floor(new Date().getTime() / 1000)
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, now + 3600, 0, 0, 0)
      const collectionId = getCollectionId(await tx.wait())
      await expect(hashies.connect(minter).mint(collectionId)).to
        .revertedWithCustomError(hashies, 'OutsideOfMintingTimeRange')
    })
    it('should reject minting when after the end time', async () => {
      const now = Math.floor(new Date().getTime() / 1000)
      const tx = await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, now + 2, 0, 0)
      await sleep(4)
      const collectionId = getCollectionId(await tx.wait())
      await expect(hashies.connect(minter).mint(collectionId)).to
        .revertedWithCustomError(hashies, 'OutsideOfMintingTimeRange')
    })
  })
  describe('Transfer', () => {
    const NAME = 'Check this one out'
    const METADATA_URI = 'ipfs://Wowza'

    let hashies, minter, collectionId, transferee, collectionOwner

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      collectionOwner = fixture.collectionOwner
      hashies = fixture.hashies
      minter = fixture.minter
      transferee = fixture.transferee
      collectionId = await hashies.collectionsCount()
    })
    it('should allow a transferable token to be transferred', async () => {
      await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 1<<TRANSFERABLE_FLAG_BIT)
      await hashies.connect(minter).mint(collectionId)
      await expect(
        await hashies.connect(minter)
          .safeTransferFrom(minter.address, transferee.address, collectionId, 1, '0x')
      )
        .to.emit(hashies, 'TransferSingle')
        .withArgs(minter.address, minter.address, transferee.address, collectionId, 1)
    })
    it('should revert the transfer of a non-transferable token', async () => {
      await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 0)
      await hashies.connect(minter).mint(collectionId)
      await expect(
        hashies.connect(minter)
          .safeTransferFrom(minter.address, transferee.address, collectionId, 1, '0x')
      )
        .to.be.revertedWithCustomError(hashies, 'NotTransferable')
    })
    it('should revert unsupported batch transfers', async () => {
      await hashies.connect(collectionOwner)
        .createCollection(NAME, METADATA_URI, 0, 0, 0, 0, 1<<TRANSFERABLE_FLAG_BIT)
      await hashies.connect(minter).mint(collectionId)
      await expect(
        hashies.connect(minter)
          .safeBatchTransferFrom(minter.address, transferee.address, [collectionId], [1], '0x')
      )
        .to.be.revertedWithCustomError(hashies, 'NotSupported')
    })

  })
  describe('Enumerable By Owner', () => {
    const NAME1 = 'Oye cómo va'
    const METADATA_URI1 = 'ipfs://MiRitmo'
    const NAME2 = 'Bueno pa\' gozar'
    const METADATA_URI2 = 'ipfs://Mulata'

    let hashies, minter, transferee,
      collection1Id, collection2Id, collection3Id,
      collectionOwner, collectionOwner2

    beforeEach(async () => {
      const fixture = await loadFixture(deployFixture)
      collectionOwner = fixture.collectionOwner
      collectionOwner2 = fixture.collectionOwner2
      hashies = fixture.hashies
      minter = fixture.minter
      transferee = fixture.transferee
      const tx1 = await hashies.connect(collectionOwner)
        .createCollection(NAME1, METADATA_URI1, 0, 0, 0, 0, 0)
      collection1Id = getCollectionId(await tx1.wait())
      const tx2 = await hashies.connect(collectionOwner2)
        .createCollection(NAME2, METADATA_URI2, 0, 0, 0, 0, 0)
      collection2Id = getCollectionId(await tx2.wait())
      const tx3 = await hashies.connect(collectionOwner2)
        .createCollection(NAME2, METADATA_URI2, 0, 0, 0, 0, 0)
      collection3Id = getCollectionId(await tx3.wait())
    })
    describe("ownedTokens", () => {
      it('should return empty array when user has no hashies', async () => {
        expect(await hashies.ownedTokens(minter.address)).to.eql([])
      })
      it('should return an array containing the id of the hashie owned by a user', async () => {
        await hashies.connect(minter).mint(collection1Id)
        expect(await hashies.ownedTokens(minter.address)).to.eql([collection1Id])
      })
      it('should return an array containing the id of all hashies owned by a user', async () => {
        await hashies.connect(minter).mint(collection1Id)
        await hashies.connect(minter).mint(collection2Id)
        expect(await hashies.ownedTokens(minter.address)).to.eql([collection1Id, collection2Id])
      })
    })
    describe("ownedCollections", () => {
      it('should return empty array when user owns no collections', async () => {
        expect(await hashies.ownedCollections(minter.address)).to.eql([])
      })
      it('should return an array of the collection owned by a user', async () => {
        expect(await hashies.ownedCollections(collectionOwner.address))
          .to.eql([collection1Id])
      })
      it('should return an array of all collections owned by a user', async () => {
        expect(await hashies.ownedCollections(collectionOwner2.address))
          .to.eql([collection2Id, collection3Id])
      })
    })
  })
})
