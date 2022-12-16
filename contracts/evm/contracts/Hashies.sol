// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ERC1155EnumerableByOwnerUpgradeable.sol";
import "./HashiesEnumerableByCollectionOwnerUpgradeable.sol";

//import "hardhat/console.sol";

    struct HashiesCollection {
        address owner;
        string name;
        string uri;
        uint256 maxSupply;
        uint256 earliestMintTimestamp;
        uint256 latestMintTimestamp;
        uint256 requiredPayment;
        uint256 flags;
    }

contract Hashies is
Initializable, ERC1155Upgradeable, ERC1155BurnableUpgradeable, OwnableUpgradeable, ERC1155SupplyUpgradeable,
ERC1155EnumerableByOwnerUpgradeable, HashiesEnumerableByCollectionOwnerUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;
    mapping(uint256 => HashiesCollection) public collections;
    uint256 public collectionsCount;

    uint256 internal constant TRANSFERABLE_FLAG_BIT = 0;
    uint256 internal constant BURNABLE_FLAG_BIT = 1;
    uint256 internal constant SECRET_WORD_TOKEN_REQUIRED_BIT = 2;
    uint256 internal constant MINTING_DISABLED_BIT = 3;

    event CollectionCreated(address owner, uint256 collectionId);
    event PaymentReceived(uint256 collectionId, address payee, uint256 amount);
    event MintingPaused(uint256 collectionId);
    event MintingResumed(uint256 collectionId);

    error OnlyOneAllowedPerAddress(address minter, uint256 collectionId);
    error UnknownCollection();
    error EmptyName();
    error MintLimitReached();
    error TimestampsOutOfOrder();
    error OutsideOfMintingTimeRange();
    error EndingTimestampTooEarly();
    error InsufficientPayment(uint256 expected, uint256 received);
    error NotTransferable();
    error NotSupported();
    error MintingDisabled();
    error MintingActive();
    error OnlyCollectionOwner();
    error NotBurnable();

    modifier OnlyOnePerAddress(uint256 collectionId) {
        if (balanceOf(msg.sender, collectionId) != 0) {
            revert OnlyOneAllowedPerAddress(msg.sender, collectionId);
        }
        _;
    }

    modifier ExistingCollection(uint256 collectionId) {
        if (bytes(collections[collectionId].name).length == 0) {
            revert UnknownCollection();
        }
        _;
    }

    modifier NameNotEmpty(string memory st) {
        if (bytes(st).length == 0) {
            revert EmptyName();
        }
        _;
    }

    modifier SupplyAvailable(uint256 collectionId) {
        uint256 maxSupply = collections[collectionId].maxSupply;
        if (maxSupply != 0 && totalSupply(collectionId) >= maxSupply) {
            revert MintLimitReached();
        }
        _;
    }

    modifier NowIsBeforeLatestTimestamp(uint256 latest) {
        if (latest != 0 && latest < block.timestamp) {
            revert EndingTimestampTooEarly();
        }
        _;
    }

    modifier EarlyTimestampBeforeLatestTimestamp(uint256 earliest, uint256 latest) {
        if (earliest != 0 && latest != 0 && earliest > latest) {
            revert TimestampsOutOfOrder();
        }
        _;
    }

    modifier AfterEarliestTime(uint256 collectionId) {
        uint256 timestamp = collections[collectionId].earliestMintTimestamp;
        if (timestamp != 0 && timestamp > block.timestamp) {
            revert OutsideOfMintingTimeRange();
        }
        _;
    }

    modifier BeforeLatestTime(uint256 collectionId) {
        uint256 timestamp = collections[collectionId].latestMintTimestamp;
        if (timestamp != 0 && timestamp < block.timestamp) {
            revert OutsideOfMintingTimeRange();
        }
        _;
    }

    modifier HasSufficientPayment(uint collectionId) {
        uint256 requiredPayment = collections[collectionId].requiredPayment;
        if (requiredPayment != 0 && msg.value < requiredPayment) {
            revert InsufficientPayment(requiredPayment, msg.value);
        }
        _;
    }

    modifier IsTransferable(uint256 collectionId) {
        bool isTransferable = (collections[collectionId].flags & (1 << TRANSFERABLE_FLAG_BIT)) != 0;
        if (!isTransferable) {
            revert NotTransferable();
        }
        _;
    }

    modifier MintingIsEnabled(uint256 collectionId) {
        bool isDisabled = (collections[collectionId].flags & (1 << MINTING_DISABLED_BIT)) != 0;
        if (isDisabled) {
            revert MintingDisabled();
        }
        _;
    }

    modifier MintingIsPaused(uint256 collectionId) {
        bool isDisabled = (collections[collectionId].flags & (1 << MINTING_DISABLED_BIT)) != 0;
        if (!isDisabled) {
            revert MintingActive();
        }
        _;
    }

    modifier CollectionIsBurnable(uint256 collectionId) {
        bool isBurnable = (collections[collectionId].flags & (1 << BURNABLE_FLAG_BIT)) != 0;
        if (!isBurnable) {
            revert NotBurnable();
        }
        _;
    }

    modifier CollectionOwner(uint256 collectionId) {
        bool isCollectionOwner = collections[collectionId].owner == msg.sender;
        if (!isCollectionOwner) {
            revert OnlyCollectionOwner();
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC1155_init("");
        __ERC1155Burnable_init();
        __Ownable_init();
        __ERC1155Supply_init();
        __ERC1155EnumerableByOwner_init();
        __HashiesEnumerableByCollectionOwner_init();
    }

    function createCollection(
        string memory name,
        string memory uri_,
        uint256 maxSupply,
        uint256 earliestMintTimestamp,
        uint256 latestMintTimestamp,
        uint256 requiredPayment,
        uint256 flags
    ) public
    NameNotEmpty(name)
    NowIsBeforeLatestTimestamp(latestMintTimestamp)
    EarlyTimestampBeforeLatestTimestamp(earliestMintTimestamp, latestMintTimestamp)
    {
        uint256 collectionId = collectionsCount;
        // TODO collectionIds should not be predictable
        HashiesCollection memory collection;
        collection.owner = msg.sender;
        collection.name = name;
        collection.uri = uri_;
        collection.maxSupply = maxSupply;
        collection.earliestMintTimestamp = earliestMintTimestamp;
        collection.latestMintTimestamp = latestMintTimestamp;
        collection.requiredPayment = requiredPayment;
        collection.flags = flags;

        collections[collectionId] = collection;
        collectionsCount += 1;

        _afterCollectionCreation(msg.sender, collectionId);

        emit CollectionCreated(msg.sender, collectionId);
    }

    function pauseMinting(uint256 collectionId) external
    ExistingCollection(collectionId)
    CollectionOwner(collectionId)
    MintingIsEnabled(collectionId)
    {
        collections[collectionId].flags = collections[collectionId].flags | (1 << MINTING_DISABLED_BIT);
        emit MintingPaused(collectionId);
    }

    function resumeMinting(uint256 collectionId) external
    ExistingCollection(collectionId)
    CollectionOwner(collectionId)
    MintingIsPaused(collectionId)
    {
        collections[collectionId].flags = collections[collectionId].flags ^ (1 << MINTING_DISABLED_BIT);
        emit MintingResumed(collectionId);
    }

    function mint(uint256 collectionId) public payable
    OnlyOnePerAddress(collectionId)
    ExistingCollection(collectionId)
    SupplyAvailable(collectionId)
    AfterEarliestTime(collectionId)
    BeforeLatestTime(collectionId)
    HasSufficientPayment(collectionId)
    MintingIsEnabled(collectionId)
    {
        // TODO Set up a ClaimableWallet for incoming payments instead of sending directly
        if (msg.value != 0) {
            address payable payee = payable(collections[collectionId].owner);
            payee.transfer(msg.value);
            emit PaymentReceived(collectionId, payee, msg.value);
        }
        _mint(msg.sender, collectionId, 1, '');
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256,
        bytes memory data
    ) public virtual override
    IsTransferable(id)
    {
        super.safeTransferFrom(from, to, id, 1, data);
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override
    {
        revert NotSupported();
    }

    function burn(address account, uint256 collectionId, uint256)
    public virtual override(ERC1155BurnableUpgradeable)
    ExistingCollection(collectionId)
    CollectionIsBurnable(collectionId)
    {
        super.burn(account, collectionId, 1);
    }

    function burnBatch(address, uint256[] memory, uint256[] memory)
    public virtual override(ERC1155BurnableUpgradeable)
    {
        revert NotSupported();
    }

    // The following override is required by OpenSea and probably other marketplaces
    function uri(uint256 collectionId) public view virtual override returns (string memory uri_) {
        uri_ = collections[collectionId].uri;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
    internal
    override(ERC1155Upgradeable, ERC1155SupplyUpgradeable, ERC1155EnumerableByOwnerUpgradeable)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function _afterCollectionCreation(address operator, uint256 collectionId)
    internal override(HashiesEnumerableByCollectionOwnerUpgradeable)
    {
        super._afterCollectionCreation(operator, collectionId);
    }
}
