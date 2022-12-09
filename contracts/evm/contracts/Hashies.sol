// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ERC1155EnumerableByOwnerUpgradeable.sol";

struct HashiesCollection {
    address owner;
    string name;
    string uri;
    uint256 maxSupply;
    uint256 earliestMintTimestamp;
    uint256 latestMintTimestamp;
    uint256 requiredPayment;
}

contract Hashies is
Initializable, ERC1155Upgradeable, ERC1155BurnableUpgradeable, OwnableUpgradeable, ERC1155SupplyUpgradeable,
ERC1155EnumerableByOwnerUpgradeable {
    mapping(uint256 => HashiesCollection) public collections;
    uint256 public collectionsCount;

    event CollectionCreated(address owner, uint256 collectionId);
    event PaymentReceived(uint256 collectionId, address payee, uint256 amount);

    error OnlyOneAllowedPerAddress(address minter, uint256 collectionId);
    error UnknownCollection();
    error EmptyName();
    error MintLimitReached();
    error TimestampsOutOfOrder();
    error OutsideOfMintingTimeRange();
    error EndingTimestampTooEarly();
    error InsufficientPayment(uint256 expected, uint256 received);

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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC1155_init("");
        __ERC1155Burnable_init();
        __Ownable_init();
        __ERC1155Supply_init();
    }

    function createCollection(
        string memory name,
        string memory uri_,
        uint256 maxSupply,
        uint256 earliestMintTimestamp,
        uint256 latestMintTimestamp,
        uint256 requiredPayment
    ) external
    NameNotEmpty(name)
    NowIsBeforeLatestTimestamp(latestMintTimestamp)
    EarlyTimestampBeforeLatestTimestamp(earliestMintTimestamp, latestMintTimestamp)
    {
        uint256 collectionId = collectionsCount; // TODO collectionIds should not be predictable
        HashiesCollection memory collection;
        collection.owner = msg.sender;
        collection.name = name;
        collection.uri = uri_;
        collection.maxSupply = maxSupply;
        collection.earliestMintTimestamp = earliestMintTimestamp;
        collection.latestMintTimestamp = latestMintTimestamp;
        collection.requiredPayment = requiredPayment;

        collections[collectionId] = collection;
        collectionsCount += 1;

        emit CollectionCreated(msg.sender, collectionId);
    }

    function mint(uint256 collectionId) public payable
    OnlyOnePerAddress(collectionId)
    ExistingCollection(collectionId)
    SupplyAvailable(collectionId)
    AfterEarliestTime(collectionId)
    BeforeLatestTime(collectionId)
    HasSufficientPayment(collectionId)
    {
        // TODO Set up a ClaimableWallet for incoming payments instead of sending directly
        if (msg.value != 0) {
            address payable payee = payable(collections[collectionId].owner);
            payee.transfer(msg.value);
            emit PaymentReceived(collectionId, payee, msg.value);
        }
        _mint(msg.sender, collectionId, 1, '');
    }

    // The following override is required by OpenSea and probably other marketplaces
    function uri(uint256 collectionId) public view virtual override returns (string memory uri_) {
        uri_ = collections[collectionId].uri;
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    internal
    override(ERC1155Upgradeable, ERC1155SupplyUpgradeable, ERC1155EnumerableByOwnerUpgradeable)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
