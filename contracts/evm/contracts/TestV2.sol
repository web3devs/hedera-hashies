// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ERC1155EnumerableByOwnerUpgradeable.sol";
import "./Hashies.sol";


contract TestV2 is
Initializable,
ERC1155Upgradeable,
ERC1155BurnableUpgradeable,
OwnableUpgradeable,
ERC1155SupplyUpgradeable,
ERC1155EnumerableByOwnerUpgradeable
{
    mapping(uint256 => HashiesCollection) public collections;
    uint256 public collectionsCount;
    mapping(address => EnumerableSetUpgradeable.UintSet) private _collectionsByOwner;

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    internal
    override(ERC1155Upgradeable, ERC1155SupplyUpgradeable, ERC1155EnumerableByOwnerUpgradeable)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

}