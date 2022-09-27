const {
    Client,
    CustomRoyaltyFee,
    TokenCreateTransaction,
    AccountId,
    PrivateKey,
    CustomFixedFee, Hbar, TokenType, TokenSupplyType, TokenInfoQuery, TokenMintTransaction, TokenBurnTransaction,
    AccountUpdateTransaction, TokenAssociateTransaction, AccountBalanceQuery, AccountInfoQuery, TransferTransaction
} = require("@hashgraph/sdk");
require("dotenv").config();

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID); //
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
const aliceId = AccountId.fromString(process.env.ALICE_ID);
const aliceKey = PrivateKey.fromString(process.env.ALICE_PVKEY);
const bobId = AccountId.fromString(process.env.BOB_ID);
const bobKey = PrivateKey.fromString(process.env.BOB_PVKEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate(); // Minting and burning
const adminKey = PrivateKey.generate(); // Deployer
const pauseKey = PrivateKey.generate();
const freezeKey = PrivateKey.generate();
const wipeKey = PrivateKey.generate();

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
        .setFeeCollectorAccountId(treasuryId)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("Fall Collection")
        .setTokenSymbol("LEAF")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(CID.length)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminKey)
        .setSupplyKey(supplyKey)
        .setPauseKey(pauseKey)
        .setFreezeKey(freezeKey)
        .setWipeKey(wipeKey)
        .setMaxTransactionFee(Hbar.from(100))
        .freezeWith(client)
        .sign(treasuryKey);

    let nftCreateTxSign = await nftCreate.sign(adminKey);
    let nftCreateSubmit = await nftCreateTxSign.execute(client);
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

    // Burn the last one
    let tokenBurnTx = await new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setSerials([CID.length])
        .freezeWith(client)
        .sign(supplyKey)
    let tokenBurnSubmit = await tokenBurnTx.execute(client)
    let tokenBurnRx = await tokenBurnSubmit.getReceipt(client)
    console.log(`Burned NFT ${tokenId} with serial ${CID.length}: ${tokenBurnRx.status}\n`)

    var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    console.log(`Current NFT supply: ${tokenInfo.totalSupply}`);

    // AUTO ASSOCIATION
    let associationTx = await new AccountUpdateTransaction()
        .setAccountId(aliceId)
        .setMaxAutomaticTokenAssociations(100)
        .setMaxTransactionFee(Hbar.from(10))
        .freezeWith(client)
        .sign(aliceKey)
    let associationTxSubmit = await associationTx.execute(client)
    let associationRx = await associationTxSubmit.getReceipt(client)
    console.log(`Alice NFT auto-association: ${associationRx.status}`)

    // Manual Association
    let associateBobTx = await new TokenAssociateTransaction()
        .setAccountId(bobId)
        .setTokenIds([tokenId])
        .setMaxTransactionFee(Hbar.from(10))
        .freezeWith(client)
        .sign(bobKey)
    let associateBobTxSubmit = await associateBobTx.execute(client)
    let associateBobRx = await associateBobTxSubmit.getReceipt(client)
    console.log(`Bob NFT Manual Association: ${associateBobRx.status}`)

    // Get starting balance
    let treasuryBalance = await getBalances(treasuryId, tokenId)
    let aliceBalance = await getBalances(aliceId, tokenId)
    let bobBalance = await getBalances(bobId, tokenId)

    console.log(`Starting balances:`)
    console.log(`- Treasury: ${treasuryBalance[0]} NFTs and ${treasuryBalance[1]}`)
    console.log(`- Alice: ${aliceBalance[0]} NFTs and ${aliceBalance[1]}`)
    console.log(`- Bob: ${bobBalance[0]} NFTs and ${bobBalance[1]}`)

    // Transfer an NFT to Alices
    let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, treasuryId, aliceId)
        .freezeWith(client)
        .sign(treasuryKey)
    let tokenTransferSubmit = await tokenTransferTx.execute(client)
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client)
    console.log(`NFT transfer: treasury -> alice: ${tokenTransferRx.status}`)

    tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, aliceId, bobId)
        .addHbarTransfer(aliceId, Hbar.from(10))
        .addHbarTransfer(bobId, Hbar.from(-10))
        .freezeWith(client)
        .sign(aliceKey)

    let tokenTransferTx2 = await tokenTransferTx.sign(bobKey)
    tokenTransferSubmit = await tokenTransferTx2.execute(client)
    tokenTransferRx = await tokenTransferSubmit.getReceipt(client)
    console.log(`NFT transfer: alice -> bob: ${tokenTransferRx.status}`)


    // Get ending balance
    treasuryBalance = await getBalances(treasuryId, tokenId)
    aliceBalance = await getBalances(aliceId, tokenId)
    bobBalance = await getBalances(bobId, tokenId)

    console.log(`Ending balances:`)
    console.log(`- Treasury: ${treasuryBalance[0]} NFTs and ${treasuryBalance[1]}`)
    console.log(`- Alice: ${aliceBalance[0]} NFTs and ${aliceBalance[1]}`)
    console.log(`- Bob: ${bobBalance[0]} NFTs and ${bobBalance[1]}`)

}

// TOKEN MINTER FUNCTION ==========================================
async function tokenMinterFcn(tokenId, CID) {
    mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(CID)])
        .freezeWith(client);
    let mintTxSign = await mintTx.sign(supplyKey);
    let mintTxSubmit = await mintTxSign.execute(client);
    let mintRx = await mintTxSubmit.getReceipt(client);
    return mintRx;
}

async function getBalances(id, tokenId) {
    let balanceCheckTx = await new AccountBalanceQuery()
        .setAccountId(id)
        .execute(client)
    return [balanceCheckTx.tokens._map.get(tokenId.toString()), balanceCheckTx.hbars]
}

main();

