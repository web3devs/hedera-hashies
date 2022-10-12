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
    uint256 maxSupply;
    uint256 nextSerial;
    int64[] nftSerialMap;
}

contract Hashie is HederaTokenService, KeyHelper, ExpiryHelper, FeeHelper {
    using Bits for uint256;

    string constant NFT_TOKEN_NAME = "Hashie Participation Token";
    string constant NFT_SYMBOL = "HASHIE";

    address owner;

    address htsCollectionId; // The main non-fungible token where all hashies will live

    mapping(int64 => uint256) nftSerialMap; // Maps from a token serial number to a the serial number within the collection
    mapping(string => HashiesCollection) collections;
    uint256 collectionsCount = 0;

    event HTSCollectionAssociated(address htsCollectionId, address caller);
    event HTSCollectionCreated(address htsCollectionId, address caller);
    event HashiesNFTCreated(string collectionId, address caller);
    event HTSMintingSucceeded(string collectionId, int64 tokenId);
    event HTSTransferSucceeded(address destination, int64 tokenId);

    event DebugParameters(uint256, string);
    event Debug(address, uint256);

    error HTSCollectionCreationFailed(int statusCode);
    error HTSCollectionNotInitialized();
    error HTSMintingFailed(string collectionId, uint256 hashieSerialNumber, int statusCode);
    error HTSTransferFailed(address destination, int64 tokenId, int statusCode);
    error HTSAssociateCollectionFailed(address destination, int statusCode);
    error ContractOwnerOnly(address contractOwner, address caller);
    error HashieAlreadyExistsWithThatId(string id);
    error UnknownHashieId(string id);

    modifier onlyOwner() {
        if (owner != msg.sender)
            revert ContractOwnerOnly(owner, msg.sender);
        _;
    }

    modifier isHtsInitialized() {
        if (htsCollectionId == address(0))
            revert HTSCollectionNotInitialized();
        _;
    }

    modifier isUniqueEventId(string memory id) {
        if (collections[id].owner != address(0))
            revert HashieAlreadyExistsWithThatId(id);
        _;
    }

    modifier isKnownEventId(string memory id) {
        if (collections[id].owner == address(0))
            revert UnknownHashieId(id);
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
//        keyType = keyType.setBit(uint8(KeyType.KYC)); // TODO Do we need KYC?

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

    /// Retrieves non-fungible specific token info for a given NFT
    /// @param token The ID of the token as a solidity address
    function getHashieInfo(address token, int64 serialNumber) internal returns (int responseCode, IHederaTokenService.NonFungibleTokenInfo memory tokenInfo) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(IHederaTokenService.getNonFungibleTokenInfo.selector, token, serialNumber));
        IHederaTokenService.NonFungibleTokenInfo memory defaultTokenInfo;
        (responseCode, tokenInfo) = success ? abi.decode(result, (int32, IHederaTokenService.NonFungibleTokenInfo)) : (HederaResponseCodes.UNKNOWN, defaultTokenInfo);
    }

    function createCollection(
        string memory id,
        string memory name,
        string memory metadataLink
    )   external
        isHtsInitialized isUniqueEventId(id)
    {
        HashiesCollection memory collection;
        collection.owner = msg.sender;
        collection.name = name;
        collection.metadataLink = bytes(metadataLink);

        collections[id] = collection;
        collectionsCount += 1;
    }

    function getCollection(string memory _collectionId)
        external view isKnownEventId(_collectionId)
        returns (HashiesCollection memory _collection)
    {
        _collection = collections[_collectionId];
    }

    function mint(
        string memory collectionId,
        address receiver
    ) external payable isHtsInitialized isKnownEventId(collectionId) returns (uint256 hashiesSerial, int64 nftSerial) {
        (hashiesSerial, nftSerial) = _mint(collectionId);
        _transfer(receiver, nftSerial);
    }

    function _mint(string memory collectionId) private returns (uint256 hashiesSerial, int64 nftSerial) {
        HashiesCollection storage hashiesCollection = collections[collectionId];
        hashiesSerial = hashiesCollection.nextSerial;
        bytes[] memory metadata = new bytes[](1);
        metadata[0] = hashiesCollection.metadataLink;

        (int response, , int64[] memory nftSerials) = mintToken(htsCollectionId, 0, metadata);
        if (response != HederaResponseCodes.SUCCESS) {
            revert HTSMintingFailed(collectionId, hashiesSerial, response);
        }
        nftSerial = nftSerials[0];
        nftSerialMap[nftSerial] = hashiesSerial;
//        hashiesCollection.nftSerialMap.push(nftSerial); // TODO
        hashiesCollection.nextSerial += 1;
        emit HTSMintingSucceeded(collectionId, nftSerial);
    }

    function _transfer(
        address receiver,
        int64 serial
    ) private {
        int associateResponse = associateToken(receiver, htsCollectionId);
        if (associateResponse != HederaResponseCodes.SUCCESS) {
            revert HTSAssociateCollectionFailed(receiver, associateResponse);
        }
        int response = transferNFT(htsCollectionId, address(this), receiver, serial);
        if (response != HederaResponseCodes.SUCCESS) {
            revert HTSTransferFailed(receiver, serial, response);
        }
        emit HTSTransferSucceeded(receiver, serial);
    }
}
