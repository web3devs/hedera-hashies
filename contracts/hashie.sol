// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import './imports/IHederaTokenService.sol';
import './imports/HederaTokenService.sol';
import './imports/KeyHelper.sol';
import './imports/ExpiryHelper.sol';
import "./imports/FeeHelper.sol";

struct HashiesCollection {
    address owner;
    string name;
    bytes metadataLink;
    uint256 totalSupply;
}

contract Hashie is HederaTokenService, KeyHelper, ExpiryHelper, FeeHelper {
    using Bits for uint256;

    string constant NFT_TOKEN_NAME = "Hashie Participation Token";
    string constant NFT_SYMBOL = "HASHIE";

    address owner;

    address htsCollectionId; // The main non-fungible token where all hashies will live

    mapping(int64 => uint256) collectionSerialMap; // Maps from a token serial number to a the serial number within the collection
    mapping(uint256 => HashiesCollection) collections;
    uint256 totalHashieCollections = 0;

    event HTSCollectionAssociated(address htsCollectionId, address caller);
    event HTSCollectionCreated(address htsCollectionId, address caller);
    event HashiesNFTCreated(uint256 collectionId, address caller);

    error HTSCollectionCreationFailed(int statusCode);

    modifier onlyOwner() {
        require(owner == msg.sender, "owner only");
        _;
    }

    modifier isHtsInitialized() {
        require(htsCollectionId != address(0), "HST token not initialized");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        initialize();
    }

    function initialize() internal {
        // Set all of the keys to this contract so that access control can be managed here
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        uint256 keyType;
        keyType = keyType.setBit(uint8(KeyType.SUPPLY));
        keyType = keyType.setBit(uint8(KeyType.ADMIN));
        keyType = keyType.setBit(uint8(KeyType.WIPE));
        keyType = keyType.setBit(uint8(KeyType.PAUSE));
//        keyType = keyType.setBit(uint8(KeyType.FEE)); // TODO Does it make sense to charge a small fee?
        keyType = keyType.setBit(uint8(KeyType.FREEZE));
        keyType = keyType.setBit(uint8(KeyType.KYC));

        keys[0] = IHederaTokenService.TokenKey(
            keyType,
            getKeyValueType(KeyValueType.CONTRACT_ID, address(this))
        );

        IHederaTokenService.HederaToken memory token;
        token.name = NFT_TOKEN_NAME;
        token.symbol = NFT_SYMBOL;
        token.treasury = address(this);
        token.memo = 'Set up the HTS NFT that will be used for all Hashies';
        token.tokenSupplyType = false; // set supply to infinite
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), defaultAutoRenewPeriod);

        (int responseCode, address tokenAddress) = createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert HTSCollectionCreationFailed(responseCode);
        }
        emit HTSCollectionCreated(tokenAddress, msg.sender);
        htsCollectionId = tokenAddress;
    }

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

        (int response, , int64[] memory nftSerials) = mintToken(htsCollectionId, 0, metadataLink);
        require(response != HederaResponseCodes.SUCCESS, "Failed to mint non-fungible token");
        nftSerial = nftSerials[0];
        collectionSerialMap[nftSerial] = hashiesSerial;
        hashiesCollection.totalSupply += 1;
    }

    function _transfer(
        address receiver,
        int64 serial
    ) private returns (int response) {
        associateToken(receiver, htsCollectionId);
        response = transferNFT(htsCollectionId, address(this), receiver, serial);
        require(response != HederaResponseCodes.SUCCESS, "Transfer failed");
    }
}
