const fs = require('fs');
const { AccountId,
    PrivateKey,
    Client,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountCreateTransaction,
    Hbar
} = require('@hashgraph/sdk');

// Setup your .env path
require('dotenv').config();

// ipfs URI
metadata = "ipfs://bafyreie3ichmqul4xa7e6xcy34tylbuq2vf3gnjf7c55trg3b6xyjr4bku/metadata.json";

const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Account creation function
async function accountCreator(pvKey, iBal) {
    const response = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(iBal))
        .setKey(pvKey.publicKey)
        .execute(client);
    const receipt = await response.getReceipt(client);
    return receipt.accountId;
}

const main = async () => {

    // Init Alice account
    const aliceKey = PrivateKey.generateED25519();
    const aliceId = await accountCreator(aliceKey, 100);

    const bytecode = fs.readFileSync('build/contracts_NFTCreator_sol_NFTCreator.bin');

    // Create contract
    const createContract = new ContractCreateFlow()
        .setGas(1500000) // Increase if revert
        .setBytecode(bytecode); // Contract bytecode
    const createContractTx = await createContract.execute(client);
    const createContractRx = await createContractTx.getReceipt(client);
    const contractId = createContractRx.contractId;

    console.log(`Contract created with ID: ${contractId} \n`);

    // Create NFT from precompile
    const createToken = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(8000000) // Increase if revert
        .setPayableAmount(20) // Increase if revert
        .setFunction("createNft",
            new ContractFunctionParameters()
                .addString("Fall Collection") // NFT name
                .addString("LEAF") // NFT symbol
                .addString("Just a memo") // NFT memo
                .addInt64(250) // NFT max supply
                .addUint32(7000000) // Expiration: Needs to be between 6999999 and 8000001
        );
    const createTokenTx = await createToken.execute(client);
    const createTokenRx = await createTokenTx.getRecord(client);
    const tokenIdSolidityAddr = createTokenRx.contractFunctionResult.getAddress(0);
    const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr);

    console.log(`Token created with ID: ${tokenId} \n`);

    // Mint NFT
    const mintToken = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction("mintNft",
            new ContractFunctionParameters()
                .addAddress(tokenIdSolidityAddr) // Token address
                .addBytesArray([Buffer.from(metadata)]) // Metadata
        );
    const mintTokenTx = await mintToken.execute(client);
    const mintTokenRx = await mintTokenTx.getRecord(client);
    const serial = mintTokenRx.contractFunctionResult.getInt64(0);

    console.log(`Minted NFT with serial: ${serial} \n`);

    // Transfer NFT to Alice
    const transferToken = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction("transferNft",
            new ContractFunctionParameters()
                .addAddress(tokenIdSolidityAddr) // Token address
                .addAddress(aliceId.toSolidityAddress()) // Token receiver (Alice)
                .addInt64(serial)) // NFT serial number
        .freezeWith(client) // freezing using client
        .sign(aliceKey); // Sign transaction with Alice
    const transferTokenTx = await transferToken.execute(client);
    const transferTokenRx = await transferTokenTx.getReceipt(client);

    console.log(`Transfer status: ${transferTokenRx.status} \n`);

}

main();