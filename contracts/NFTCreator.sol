// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;

import "./imports/HederaTokenService.sol";
import "./imports/KeyHelper.sol";
import "./imports/ExpiryHelper.sol";

contract NFTCreator is HederaTokenService, KeyHelper, ExpiryHelper {
    error LogResponseCode(int responseCode, address tokenAddress);
    event TokenCreated(address createdToken, address creator);

    function createNft() external payable returns(address tokenId) {
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.HederaToken memory token;
        token.name = "Foo";
        token.symbol = "$FOO";
        token.treasury = address(this);
        token.tokenSupplyType = false; // set supply to infinite
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), defaultAutoRenewPeriod);

        (int responseCode, address tokenAddress) = createNonFungibleToken(token);
//        // Copied from HederaTokenService
//        address precompileAddress = address(0x167);
//        // createNonFungibleToken()
//        bytes memory encoded = abi.encodeWithSelector(IHederaTokenService.createNonFungibleToken.selector, token);
//        (bool success, bytes memory result) = precompileAddress.call{value: msg.value}(encoded);
//        (int32 responseCode, address tokenAddress) = success ? abi.decode(result, (int32, address)) : (UNKNOWN, address(0));
//        // End copied code

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert LogResponseCode(responseCode, tokenAddress);
        }
        emit TokenCreated(tokenAddress, msg.sender);

        tokenId = tokenAddress;
    }
}
