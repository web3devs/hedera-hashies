pragma solidity ^0.8.17;

import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/HederaResponseCodes.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/HederaTokenService.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/ExpiryHelper.sol';
import '../node_modules/@hashgraph/smart-contracts/contracts/hts-precompile/KeyHelper.sol';

contract BugBytes is HederaTokenService, KeyHelper, ExpiryHelper {
    error CallFailed(string msg, int64 responseCode);

    address socialToken;

    constructor(string memory _name, string memory _symbol, uint32 _decimals) payable {

        IHederaTokenService.TokenKey memory mintKey = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = mintKey;

        IHederaTokenService.HederaToken memory token;
        token.name = _name;
        token.symbol = _symbol;
        token.treasury = address(this);
        token.tokenKeys = keys;
        token.expiry = createAutoRenewExpiry(address(this), 7000000);

        (bool success, bytes memory result) = precompileAddress.call{value : msg.value}(
            abi.encodeWithSelector(IHederaTokenService.createFungibleToken.selector, token, 0, _decimals)
        );

        (int64 responseCode, address _socialToken) = success ? abi.decode(result, (int64, address)) : (int64(-1), address(0));
        if (responseCode != 22) {
            revert CallFailed("Failed to create Social Token", responseCode);
        }
        socialToken = _socialToken;
    }
}