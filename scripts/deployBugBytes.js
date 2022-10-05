const {Client, AccountId, PrivateKey, ContractCreateFlow} = require("@hashgraph/sdk");
const fs = require("fs");
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

async function deployContract(client) {
    const bytecode = await fs.readFileSync("build/contracts_hashie_sol_Hashies.bin")

    // Create contract
    const createContractTx = await new ContractCreateFlow()
        .setGas(15_000_000) // Increase if revert
        .setBytecode(bytecode) // Contract bytecode
        .setAdminKey(client.operatorPublicKey)
        .setInitialBalance(30)
        // .setAutoRenewAccountId(client.operatorPublicKey)
        // .setAutoRenewPeriod(90n * 24n * 60n * 60n)
        .execute(client)
    const createContractRx = await createContractTx.getReceipt(client);

    console.log(`Contract created with ID: ${createContractRx.contractId} \n`);
    logEvents(await createContractTx.getRecord(client), await loadAbi(), "HTSCollectionCreationFailed")

    return createContractRx.contractId;
}


// var contract = (await client.CreateContractAsync(new CreateContractParams
// {
//     File = file,
//         Administrator = publicKey,
//         Gas = 15000000,
//         InitialBalance = 30_00_000_000,
//         RenewPeriod = TimeSpan.FromDays(90),
//         Arguments = new object[] { name, symbol, decimals, collateralToken }
// })).Contract;

const main = async () => {
    const client = createClient();
    const contractId = await deployContract(client);
    // const contractId = AccountId.fromString('0.0.48476935')
    // const hstTokenId = await createHTSCollection(client, contractId)
    // const htsTokenId = AccountId.fromString('0.0.48476936')
    // const tokenId = await initializeHashiesContract(client, contractId);


}

main()
