// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;

import "./imports/KeyHelper.sol";

contract NFTCreator is KeyHelper {
    error LogResponseCode(int32 responseCode, address tokenAddress);
    event TokenCreated(address createdToken, address creator);

    //  copied from HederaResponseCodes
    int32 internal constant UNKNOWN = 21; // The responding node has submitted the transaction to the network. Its final status is still unknown.
    int32 internal constant SUCCESS = 22; // The transaction succeeded
    // end copied code

    function createNft() external payable {
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        // Set this contract as supply
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.HederaToken memory token;
        token.name = "Foo";
        token.symbol = "$FOO";
        token.treasury = address(this);
        token.tokenSupplyType = false; // set supply to infinite
        token.tokenKeys = keys;
        token.freezeDefault = false;

        // Copied from HederaTokenService
        address precompileAddress = address(0x167);
        // createNonFungibleToken()
        bytes memory encoded = abi.encodeWithSelector(IHederaTokenService.createNonFungibleToken.selector, token);
        (bool success, bytes memory result) = precompileAddress.call{value: msg.value}(encoded);
        (int32 responseCode, address tokenAddress) = success ? abi.decode(result, (int32, address)) : (UNKNOWN, address(0));
        // End copied code

        if(responseCode != SUCCESS){
            revert LogResponseCode(responseCode, tokenAddress);
        }
        emit TokenCreated(tokenAddress, msg.sender);
    }
}
