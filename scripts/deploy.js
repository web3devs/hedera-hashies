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

const HASHIE_BIN_FILE = "build/contracts_hashie_sol_Hashie.bin";
const HASHIE_ABI_FILE = 'build/contracts_hashie_sol_Hashie.abi';

const bytecode = fs.readFileSync(HASHIE_BIN_FILE)
const abi = new hethers.utils.Interface(fs.readFileSync(HASHIE_ABI_FILE, 'utf8'))

const client = Client
    .forTestnet()
    .setOperator(AccountId.fromString(process.env.MY_ACCOUNT_ID), PrivateKey.fromString(process.env.MY_PRIVATE_KEY))

async function deployHashiesContract() {
    // Create contract
    const response = await new ContractCreateFlow()
        .setGas(400_000)
        .setBytecode(bytecode)
        .setInitialBalance(20)
        .execute(client)
    const record = await response.getRecord(client)
    console.log(`Contract created with ID: ${record.receipt.contractId} \n`);

    logEvents(record, 'HTSCollectionCreated')

    return record.receipt.contractId;
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
    const contractId = await deployHashiesContract();
}

main()
