pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";


abstract contract ERC1155EnumerableByOwnerUpgradeable is Initializable, ERC1155Upgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;

    mapping(address => EnumerableSetUpgradeable.UintSet) private _tokensByOwner;

    function __ERC1155EnumerableByOwner_init() internal onlyInitializing {
    }

    function __ERC1155EnumerableByOwner_init_unchained() internal onlyInitializing {
    }

    /**
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
    **/
    function ownedTokens(address owner) public view virtual returns (uint[] memory ids) {
        return EnumerableSetUpgradeable.values(_tokensByOwner[owner]);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; ++i) {
            if (from != address(0) && balanceOf(from, ids[i]) <= amounts[i]) {
                EnumerableSetUpgradeable.remove(_tokensByOwner[from], ids[i]);
            }
            if (to != address(0)) {
                EnumerableSetUpgradeable.add(_tokensByOwner[to], ids[i]);
            }
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}