const {Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    //Create new keys
    const privateKey = await PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;

    //Create a new account with 1,000 tinybar starting balance
    const newAccount = await new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(Hbar.from(10))
        .setAccountMemo()
        .execute(client);

    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const accountId = getReceipt.accountId.toString();

    console.log(JSON.stringify({
        accountId,
        publicKey: publicKey.toString(),
        privateKey: privateKey.toString(),
    }, undefined, 2));

    //Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);

    console.log("The new account balance is: " + accountBalance.hbars.toString() + "bar.");

}

main();