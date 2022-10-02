// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/HederaResponseCodes.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/HederaTokenService.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/ExpiryHelper.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/KeyHelper.sol';

contract NFTCreator is HederaTokenService, KeyHelper, ExpiryHelper {
    event LogResponseCode(int responseCode);

    function createNft(
        string memory name,
        string memory symbol,
        string memory memo,
        int64 maxSupply,
        uint32 autoRenewPeriod
    ) external payable returns (address){

        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        // Set this contract as supply
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = memo;
        token.treasury = address(this);
        token.tokenSupplyType = true; // set supply to FINITE
        token.maxSupply = maxSupply;
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod); // Contract automatically renew by himself

        (int responseCode, address createdToken) = createNonFungibleToken(token); // <--- responseCode is UNKNOWN

        if(responseCode != HederaResponseCodes.SUCCESS){
            revert("Failed to create non-fungible token");
//            emit LogResponseCode(responseCode);
        }
        return createdToken;
    }

    function mintNft(
        address token,
        bytes[] memory metadata
    ) external returns(int64){

        (int response, , int64[] memory serial) = mintToken(token, 0, metadata);

        if(response != HederaResponseCodes.SUCCESS){
            revert("Failed to mint non-fungible token");
        }

        return serial[0];
    }

    function transferNft(
        address token,
        address receiver,
        int64 serial
    ) external returns(int){

        associateToken(receiver, token);
        int response = transferNFT(token, address(this), receiver, serial);

        if(response != HederaResponseCodes.SUCCESS){
            revert("Failed to transfer non-fungible token");
        }

        return response;
    }

}