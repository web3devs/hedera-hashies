require("dotenv").config();
const fs = require('fs')
const {
    AccountId,
    Client,
    PrivateKey,
    ContractCreateFlow,
    ContractExecuteTransaction,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
} = require("@hashgraph/sdk");
const {hethers} = require("@hashgraph/hethers")

let abi

async function deployHashiesContract(client) {
    const bytecode = await fs.readFileSync("build/contracts_hashie_sol_Hashies.bin")

    // Create contract
    const response = await new ContractCreateFlow()
        .setGas(1_000_000) // Increase if revert
        .setBytecode(bytecode) // Contract bytecode
        .setInitialBalance(20)
        .execute(client)
    const record = await response.getRecord(client)
    console.log(`Contract created with ID: ${record.receipt.contractId} \n`);

    logEvents(record, 'HTSCollectionCreated')

    return record.receipt.contractId;
}

function createClient() {
    const client = Client.forTestnet();
    client
        .setOperator(
            AccountId.fromString(process.env.MY_ACCOUNT_ID),
            PrivateKey.fromString(process.env.MY_PRIVATE_KEY)
        )
    return client;
}

function loadAbi() {
    return new hethers.utils.Interface(
        fs.readFileSync('build/contracts_hashie_sol_Hashies.abi', 'utf8')
    );
}

function logEvents(record, eventName) {
    record.contractFunctionResult.logs.forEach(log => {
        // convert the log.data (uint8Array) to a string
        let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

        // get topics from log
        const logTopics = log.topics.map(topic => '0x'.concat(topic.toString('hex')))

        // decode the event data
        const event = abi.decodeEventLog(eventName, logStringHex, logTopics)
        console.log(`${eventName} event logged\n${JSON.stringify(event)}\n\n`)
    })
}

const main = async () => {
    const client = createClient();
    abi = loadAbi()
    const contractId = await deployHashiesContract(client);
}

main()
