// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/HederaResponseCodes.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/HederaTokenService.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/ExpiryHelper.sol';

struct HashiesCollection {
    address owner;
    string name;
    bytes metadataLink;
    uint256 totalSupply;
}

contract Hashies is KeyHelper, ExpiryHelper {
    string constant NFT_TOKEN_NAME = "Hashies Participation Token";
    string constant NFT_SYMBOL = "HASHIES";
    uint32 constant AUTO_RENEW_EXPIRY = 90 * 24 * 60 * 60; // 90 days

    address owner;

    address htsCollectionId; // The main non-fungible token where all hashies will live

    mapping(int64 => uint256) collectionSerialMap; // Maps from a token serial number to a the serial number within the collection
    mapping(uint256 => HashiesCollection) collections;
    uint256 totalHashieCollections = 0;

    event HTSCollectionAssociated(address htsCollectionId, address caller);
    event HashiesCollectionCreated();

    modifier onlyOwner() {
        require(owner == msg.sender, "owner only");
        _;
    }

    modifier isHtsInitialized() {
        require(htsCollectionId != address(0), "HST token not initialized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setHTSCollectionId(address _htsCollectionId) external onlyOwner {
        require(_htsCollectionId != address(0), "");
        htsCollectionId = _htsCollectionId;
        emit HTSCollectionAssociated(_htsCollectionId, msg.sender);
    }

//    function initialize() external {
//        require(owner == msg.sender, "owner only");
//
//        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
//        keys[0] = createSingleKey(HederaTokenService.SUPPLY_KEY_TYPE, CONTRACT_ID_KEY, address(this)); // Does this work?
//
//        IHederaTokenService.HederaToken memory newNft;
//        newNft.name = "#ies";
//        newNft.symbol = "$#IES";
//        newNft.treasury = address(this);
//        newNft.memo = 'Set up the HTS NFT that will be used for all Hashies';
//        newNft.tokenSupplyType = true;
//        newNft.maxSupply = 500;
//        newNft.freezeDefault = false;
//        newNft.tokenKeys = keys;
//        newNft.expiry = createAutoRenewExpiry(address(msg.sender), AUTO_RENEW_EXPIRY);
//
//        (int responseCode, address createdToken) = HederaTokenService.createNonFungibleToken(newNft);
//
////        require(responseCode == HederaResponseCodes.SUCCESS, "Failed to create Hashies NFT");
//
//        nftCollectionAddress = createdToken;
//        emit HashiesNFTCreated(createdToken, msg.sender, responseCode);
//    }

    function createNewHashie(
        string memory collectionName,
        string memory metadataLink
    ) external payable isHtsInitialized returns (uint256 collectionId) {
        collectionId = totalHashieCollections;
        HashiesCollection memory collection;
        collection.owner = msg.sender;
        collection.name = collectionName;
        collection.metadataLink = bytes(metadataLink);

        collections[collectionId] = collection;
        totalHashieCollections += 1;
    }

    function mintAndTransfer(
        uint256 collectionId,
        address receiver
    ) external isHtsInitialized returns (uint256 hashiesSerial, int64 nftSerial) {
        (hashiesSerial, nftSerial) = _mint(collectionId);
        _transfer(receiver, nftSerial);
    }

    function _mint(uint256 collectionId) private returns (uint256 hashiesSerial, int64 nftSerial) {
        HashiesCollection memory hashiesCollection = collections[collectionId];
        hashiesSerial = hashiesCollection.totalSupply;
        bytes[] memory metadataLink;
        metadataLink[0] = hashiesCollection.metadataLink;

        (int response, , int64[] memory nftSerials) =
            HederaTokenService.mintToken(htsCollectionId, 0, metadataLink);
        require(response != HederaResponseCodes.SUCCESS, "Failed to mint non-fungible token");
        nftSerial = nftSerials[0];
        collectionSerialMap[nftSerial] = hashiesSerial;
        hashiesCollection.totalSupply += 1;
    }

    function _transfer(
        address receiver,
        int64 serial
    ) private returns (int response) {
        HederaTokenService.associateToken(receiver, htsCollectionId);
        response = HederaTokenService.transferNFT(htsCollectionId, address(this), receiver, serial);
        require(response != HederaResponseCodes.SUCCESS, "Transfer failed");
    }
}
