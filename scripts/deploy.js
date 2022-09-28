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
const {hethers, Contract} = require("@hashgraph/hethers")

async function deployHashiesContract(client) {
    const bytecode = await fs.readFileSync("build/contracts_hashie_sol_Hashies.bin")

    // Create contract
    const createContractTx = await new ContractCreateFlow()
        .setGas(1500000) // Increase if revert
        .setBytecode(bytecode) // Contract bytecode
        .execute(client)
    const createContractRx = await createContractTx.getReceipt(client);

    console.log(`Contract created with ID: ${createContractRx.contractId} \n`);

    return createContractRx.contractId;
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

async function createHstCollection(hashiesContractAddress, client) {
    const nftCreateTx = await new TokenCreateTransaction()
        .setTokenName("Hashies")
        .setTokenSymbol("HASHIES")
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Infinite)
        .setInitialSupply(0)
        .setTreasuryAccountId(hashiesContractAddress)
        .setSupplyKey(hashiesContractAddress) // Will this work?
        .execute(client)
    const nftCreateRx = await nftCreateTx.getReceipt(client);
    const tokenId = nftCreateRx.tokenId;

    console.log(`Created HST collection with Token ID: ${tokenId} \n`);

    return tokenId;
}

function loadAbi() {
    return new hethers.utils.Interface(
        fs.readFileSync('build/contracts_hashie_sol_Hashies.abi', 'utf8')
    );
}

function logEvents(record, abi, eventName) {
    record.contractFunctionResult.logs.forEach(log => {
        // convert the log.data (uint8Array) to a string
        let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

        // get topics from log
        let logTopics = [];
        log.topics.forEach(topic => {
            logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
        });

        // decode the event data
        const event = abi.decodeEventLog(eventName, logStringHex, logTopics.slice(1))
        console.log(event)
    })
}

async function initializeHashiesContract(client, contractId, hstTokenId) {
    let abi = loadAbi();

    const setHstCollectionParameters = abi.encodeFunctionData(
        "setHstCollectionAddress",
        [hstTokenId.toSolidityAddress()]
    );

    const initializeContractTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(setHstCollectionParameters)
        .setGas(1000000)
        .execute(client);
    logEvents(await initializeContractTx.getRecord(client), abi, "HashiesNFTCreated");
    return initializeContractTx;
}

const main = async () => {
    const client = createClient();
    const contractId = await deployHashiesContract(client);
    const hstTokenId = await createHstCollection(contractId, client)
    await initializeHashiesContract(client, contractId, hstTokenId);
}

main()
