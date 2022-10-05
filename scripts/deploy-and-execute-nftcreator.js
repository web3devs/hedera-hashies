const fs = require("fs");
const {
    AccountId,
    PrivateKey,
    Client,
    ContractCreateFlow,
    ContractExecuteTransaction,
} = require('@hashgraph/sdk');
require('dotenv').config();

function createClient() {
    const client = Client.forTestnet();
    client
        .setOperator(
            AccountId.fromString(process.env.MY_ACCOUNT_ID),
            PrivateKey.fromString(process.env.MY_PRIVATE_KEY)
        )
    return client;
}

async function main() {
    const client = createClient()

    const bytecode = await fs.readFileSync("./build/contracts_NFTCreator_sol_NFTCreator.bin")

    // Create contract
    const createContract = new ContractCreateFlow()
        .setGas(1500000) // Increase if revert
        .setBytecode(bytecode); // Contract bytecode
    const createContractTx = await createContract.execute(client);
    const createContractRx = await createContractTx.getReceipt(client);
    const contractId = createContractRx.contractId;

    console.log(`Contract created with ID: ${contractId} \n`);

    // Call create token
    const tx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_0000) // Increase if revert
        .setPayableAmount(20) // Increase if revert
        .setFunction("createNft");
    const receipt = await tx.execute(client);
    const record = await receipt.getRecord(client);

    const tokenIdSolidityAddr = record.contractFunctionResult.getAddress(0);
    const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr);

    console.log(`Token created with ID: ${tokenId} \n`);

    // 0x0000000000000000000000000000000000000000000000000000000002e447440000000000000000000000000000000000000000000000000000000002e01f33
}

main()
