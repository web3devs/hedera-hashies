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
    mapping(uint256 => HashiesCollection) collections;
    uint256 collectionsCount = 0;

    event HTSCollectionAssociated(address htsCollectionId, address caller);
    event HTSCollectionCreated(address htsCollectionId, address caller);
    event HashiesNFTCreated(uint256 collectionId, address caller);

    event DebugParameters(uint256, string);
    event Debug(address, uint256);

    error HTSCollectionCreationFailed(int statusCode);
    error HTSCollectionNotInitialized();
    error ContractOwnerOnly(address contractOwner, address caller);
    error HashieAlreadyExistsWithThatId(uint256 id);
    error UnknownHashieId(uint256 id);

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

    modifier isUniqueEventId(uint256 id) {
        if (collections[id].owner != address(0))
            revert HashieAlreadyExistsWithThatId(id);
        _;
    }

    modifier isKnownEventId(uint256 id) {
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

    /// Retrieves non-fungible specific token info for a given NFT
    /// @param token The ID of the token as a solidity address
    function getHashieInfo(address token, int64 serialNumber) internal returns (int responseCode, IHederaTokenService.NonFungibleTokenInfo memory tokenInfo) {
        (bool success, bytes memory result) = precompileAddress.call(
            abi.encodeWithSelector(IHederaTokenService.getNonFungibleTokenInfo.selector, token, serialNumber));
        IHederaTokenService.NonFungibleTokenInfo memory defaultTokenInfo;
        (responseCode, tokenInfo) = success ? abi.decode(result, (int32, IHederaTokenService.NonFungibleTokenInfo)) : (HederaResponseCodes.UNKNOWN, defaultTokenInfo);
    }

    function createCollection(
        uint256 id,
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

    function mint(
        uint256 collectionId,
        address receiver
    ) external isHtsInitialized isKnownEventId(collectionId) returns (uint256 hashiesSerial, int64 nftSerial) {
        (hashiesSerial, nftSerial) = _mint(collectionId);
        _transfer(receiver, nftSerial);
    }

    function _mint(uint256 collectionId) private returns (uint256 hashiesSerial, int64 nftSerial) {
        HashiesCollection storage hashiesCollection = collections[collectionId];
        hashiesSerial = hashiesCollection.nextSerial;
        bytes[] memory metadataLink;
        metadataLink[0] = hashiesCollection.metadataLink;

        (int response, , int64[] memory nftSerials) = mintToken(htsCollectionId, 0, metadataLink);
        require(response != HederaResponseCodes.SUCCESS, "Failed to mint non-fungible token");
        nftSerial = nftSerials[0];
        nftSerialMap[nftSerial] = hashiesSerial;
        hashiesCollection.nftSerialMap.push(nftSerial);
        hashiesCollection.nextSerial += 1;
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
