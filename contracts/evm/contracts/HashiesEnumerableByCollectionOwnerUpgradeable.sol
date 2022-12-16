// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

abstract contract HashiesEnumerableByCollectionOwnerUpgradeable is Initializable, ERC1155Upgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;

    mapping(address => EnumerableSetUpgradeable.UintSet) private _collectionsByOwner;

    function __HashiesEnumerableByCollectionOwner_init() internal onlyInitializing {
    }

    function __HashiesEnumerableByCollectionOwner_init_unchained() internal onlyInitializing {
    }

    /**
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
    **/
    function ownedCollections(address owner) public view virtual returns (uint[] memory ids) {
        return EnumerableSetUpgradeable.values(_collectionsByOwner[owner]);
    }

    function _afterCollectionCreation(address operator, uint256 collectionId)
    internal virtual {
        EnumerableSetUpgradeable.add(_collectionsByOwner[operator], collectionId);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}