const {Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, Transfer, TransferTransaction} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    const recipient = process.env.BOB_ID;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    const sendHbar = await new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.from(-1000))
        .addHbarTransfer(recipient, Hbar.from(1000))
        .execute(client)

    //Verify the transaction reached consensus
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    //Check the new account's balance
    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(recipient)
        .execute(client);

    console.log("The account balance after the transfer is: " +getNewBalance.hbars.toTinybars() +" tinybar.")
}

main();