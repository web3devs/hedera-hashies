require("dotenv").config();
const fs = require('fs')
const {AccountId, Client, PrivateKey, ContractCreateFlow, ContractCreateTransaction, EthereumTransaction,
    ContractExecuteTransaction
} = require("@hashgraph/sdk");
const {hethers} = require("@hashgraph/hethers")

let contractId

const accountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const privateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
let abi

const main = async () => {
    const client = Client.forTestnet();
    client.setOperator(accountId, privateKey);

    abi = new hethers.utils.Interface(
        fs.readFileSync('build/contracts_hashie_sol_Hashies.abi', 'utf8')
    );

    if (!contractId) {
        const bytecode = await fs.readFileSync("build/contracts_hashie_sol_Hashies.bin")

        console.log('Bytcode length:', bytecode.length)

        // Create contract
        const createContractTx = await new ContractCreateFlow()
            .setGas(1500000) // Increase if revert
            .setBytecode(bytecode) // Contract bytecode
            .execute(client)
        const createContractRx = await createContractTx.getReceipt(client);
        contractId = createContractRx.contractId;

        console.log(`Contract created with ID: ${contractId} \n`);
    }
    const initializeParameters = abi.encodeFunctionData("initialize", []);

    const initializeContractTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(initializeParameters)
        .setGas(1000000)
        .execute(client);

    const intializeContractRecord = await initializeContractTx.getRecord(client)
    intializeContractRecord.contractFunctionResult.logs.forEach(log => {
        // convert the log.data (uint8Array) to a string
        let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

        // get topics from log
        let logTopics = [];
        log.topics.forEach(topic => {
            logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
        });

        // decode the event data
        const event = abi.decodeEventLog("HashiesNFTCreated", logStringHex, logTopics.slice(1))
        console.log(event)
    })

    console.log('Transaction id:', (await initializeContractTx.getReceiptQuery()).transactionId.toString());


}

main()
