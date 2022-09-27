/***
 * Instructions for use:
 * - install dependencies: `yarn`
 * - create a .env file with your account:
 * ```
 *   MY_ACCOUNT_ID = "0.0.xxxxxxx"
 *   MY_PRIVATE_KEY = "..."
 * ```
 * - Run this program: `node quick-mint.js`
 */

const {
    Client,
    CustomRoyaltyFee,
    TokenCreateTransaction,
    AccountId,
    PrivateKey,
    CustomFixedFee,
    Hbar,
    TokenType,
    TokenSupplyType,
    TokenInfoQuery,
    TokenMintTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

// Configure accounts and client, and generate needed keys
const myId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(myId, myPrivateKey);

const CID = [
    "QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
    "QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
    "QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
    "Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5",
    "QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw",
];

async function main() {
    let nftCustomFee = await new CustomRoyaltyFee()
        .setNumerator(5)
        .setDenominator(10)
        .setFeeCollectorAccountId(myId)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

    let nftCreateTx = await new TokenCreateTransaction()
        .setTokenName("Test Collection")
        .setTokenSymbol("TEST")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(myId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(CID.length)
        .setCustomFees([nftCustomFee])
        .setAdminKey(myPrivateKey)
        .setSupplyKey(myPrivateKey)
        .setPauseKey(myPrivateKey)
        .setFreezeKey(myPrivateKey)
        .setWipeKey(myPrivateKey)
        .setMaxTransactionFee(Hbar.from(100))
        .freezeWith(client)
        .sign(myPrivateKey);

    // let nftCreateTxSign = await nftCreate.sign(myPrivateKey);
    let nftCreateSubmit = await nftCreateTx.execute(client);
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let tokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with Token ID: ${tokenId} \n`);

    // TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT
    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    console.table(tokenInfo.customFees[0]);

    // MINT NEW BATCH OF NFTs
    nftLeaf = [];
    for (var i = 0; i < CID.length; i++) {
        nftLeaf[i] = await tokenMinterFcn(tokenId, CID[i]);
        console.log(`Created NFT ${tokenId} with serial: ${nftLeaf[i].serials[0].low}`);
    }

    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    console.log(`Current NFT supply: ${tokenInfo.totalSupply}`);
    //
    // // Manual Association
    // let associateTx = await new TokenAssociateTransaction()
    //     .setAccountId(myId)
    //     .setTokenIds([tokenId])
    //     .setMaxTransactionFee(Hbar.from(10))
    //     .freezeWith(client)
    //     .sign(bobKey)
    // let associateTxSubmit = await associateTx.execute(client)
    // let associateRx = await associateTxSubmit.getReceipt(client)
    // console.log(`NFT Association set up: ${associateRx.status}`)
    //

}

// TOKEN MINTER FUNCTION ==========================================
async function tokenMinterFcn(tokenId, CID) {
    mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(CID)])
        .freezeWith(client);
    let mintTxSign = await mintTx.sign(myPrivateKey);
    let mintTxSubmit = await mintTxSign.execute(client);
    let mintRx = await mintTxSubmit.getReceipt(client);
    return mintRx;
}


main();

