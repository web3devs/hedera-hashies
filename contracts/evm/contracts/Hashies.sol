// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

struct HashiesCollection {
    address owner;
    string name;
    bytes metadataLink;
    uint256 maxSupply;
    uint256 nextSerial;
    int64[] nftSerialMap;
}

contract Hashies is Initializable, ERC1155Upgradeable, ERC1155BurnableUpgradeable, OwnableUpgradeable, ERC1155SupplyUpgradeable {
    mapping(string => HashiesCollection) collections;
    uint256 collectionsCount;


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

//    function createCollection(
//        string memory id,
//        string memory name,
//        string memory metadataLink
//    ) external {
//        HashiesCollection memory collection;
//        collection.owner = msg.sender;
//        collection.name = name;
//        collection.metadataLink = bytes(metadataLink);
//
//        collections[id] = collection;
//        collectionsCount += 1;
//    }
//
//
//    function mint(string memory collectionId) public payable returns (uint256 hashiesSerial, int64 nftSerial) {
//        HashiesCollection storage hashiesCollection = collections[collectionId];
//        hashiesSerial = hashiesCollection.nextSerial;
//        bytes[] memory metadata = new bytes[](1);
//        metadata[0] = hashiesCollection.metadataLink;
//
//        (int response, , int64[] memory nftSerials) = mintToken(htsCollectionId, 0, metadata);
//        if (response != HederaResponseCodes.SUCCESS) {
//            revert HTSMintingFailed(collectionId, hashiesSerial, response);
//        }
//        nftSerial = nftSerials[0];
//        nftSerialMap[nftSerial] = hashiesSerial;
//        //        hashiesCollection.nftSerialMap.push(nftSerial); // TODO
//        hashiesCollection.nextSerial += 1;
//        emit HTSMintingSucceeded(collectionId, nftSerial);
//    }

//    function mint(address account, uint256 id, uint256 amount, bytes memory data)
//    public
//    onlyOwner
//    {
//        _mint(account, id, amount, data);
//    }

//    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
//    public
//    onlyOwner
//    {
//        _mintBatch(to, ids, amounts, data);
//    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    internal
    override(ERC1155Upgradeable, ERC1155SupplyUpgradeable)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
