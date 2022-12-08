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
}

contract Hashies is
Initializable, ERC1155Upgradeable, ERC1155BurnableUpgradeable, OwnableUpgradeable, ERC1155SupplyUpgradeable,
ERC1155EnumerableByOwnerUpgradeable {
    mapping(uint256 => HashiesCollection) public collections;
    uint256 public collectionsCount;

    event CollectionCreated(address owner, uint256 collectionId);

    error OnlyOneAllowedPerAddress(address minter, uint256 collectionId);
    error UnknownCollection();
    error EmptyName();
    error MintLimitReached();

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

    function createCollection(string memory name, string memory uri_, uint256 maxSupply) external
    NameNotEmpty(name)
    {
        uint256 collectionId = collectionsCount; // TODO collectionIds should not be predictable
        HashiesCollection memory collection;
        collection.owner = msg.sender;
        collection.name = name;
        collection.uri = uri_;
        collection.maxSupply = maxSupply;

        collections[collectionId] = collection;
        collectionsCount += 1;

        emit CollectionCreated(msg.sender, collectionId);
    }

    function mint(uint256 collectionId) public payable
    OnlyOnePerAddress(collectionId)
    ExistingCollection(collectionId)
    SupplyAvailable(collectionId)
    {
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
