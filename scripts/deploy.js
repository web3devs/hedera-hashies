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
const {formatHbar, parseHbar, formatUnits} = require("@hashgraph/hethers/lib/utils");

async function deployHashiesContract(client) {
    const bytecode = await fs.readFileSync("build/contracts_hashie_sol_Hashies.bin")

    // Create contract
    const createContractTx = await new ContractCreateFlow()
        .setGas(800_0000) // Increase if revert
        .setBytecode(bytecode) // Contract bytecode
        .setAdminKey(client.operatorPublicKey)
        .setInitialBalance(69)
        .execute(client)
    const createContractRx = await createContractTx.getReceipt(client);

    console.log(`Contract created with ID: ${createContractRx.contractId} \n`);
    logEvents(await createContractTx.getRecord(client), await loadAbi(), "HTSCollectionCreationFailed")

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

async function createHTSCollection(client, hashiesContractId) {
    console.log('creating HTS for', hashiesContractId.toString())

    const nftCreateTx = await new TokenCreateTransaction()
        .setTokenName("Hashies")
        .setTokenSymbol("HASHIE")
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Infinite)
        .setInitialSupply(0)
        // TODO Set the hashies contract as the treasury and admin of the HTS token
        // .setTreasuryAccountId(hashiesContractAddress)
        // .setSupplyKey(hashiesContractAddress) // Will this work?
        .setTreasuryAccountId(client.operatorAccountId)
        .setSupplyKey(client.operatorPublicKey)
        .execute(client)
    const nftCreateRx = await nftCreateTx.getReceipt(client);
    const tokenId = nftCreateRx.tokenId;

    console.log(`Created HTS collection. Token ID: ${tokenId}`);

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
        const logTopics = log.topics.map(topic => '0x'.concat(topic.toString('hex')))

        // decode the event data
        const event = abi.decodeEventLog(eventName, logStringHex, logTopics)
        console.log(event)
    })
}

// async function initializeHashiesContract(client, contractId, htsTokenId) {
//     const htsSolidityAddress = AccountId.fromString(htsTokenId.toString()).toSolidityAddress();
//
//     const identity = {
//         account: process.env.MY_ACCOUNT_ID,
//         privateKey: process.env.MY_PRIVATE_KEY
//     }
//     const provider = hethers.providers.getDefaultProvider('testnet');
//     const wallet = new hethers.Wallet(identity, provider)
//
//     const contract = new hethers.Contract(contractId.toSolidityAddress(), loadAbi(), wallet);
//     // const contractWithSigner = contract.connect(provider).connect(wallet)
//     contract.once('HTSCollectionAssociated', (collectionId, sender) => {
//         console.log(`${sender} associated the HTS collection ${collectionId} to the hashie contract at ${contract.address}`);
//     });
//
//     const result = await (await contract.setHTSCollectionId(htsSolidityAddress, {gasLimit: 100000})).wait()
//     console.log('contract call result:', result)
// }

async function initializeHashiesContract(client, contractId) {
    let abi = loadAbi();

    const initializeContractTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        // .setPayableAmount(200)
        .setFunction("initialize")
        // .freezeWith(client)
        // .signWithOperator(client)
    const rx = await initializeContractTx.execute(client)
    const record = await rx.getRecord(client)
    console.log(record.contractFunctionResult.logs)
    logEvents(record, abi, "HTSCollectionCreated");
    logEvents(record, abi, "HTSCollectionCreationFailed");
    const receipt = await rx.getReceipt(client);
    // console.log(receipt)
}

const main = async () => {
    const client = createClient();
    const contractId = await deployHashiesContract(client);
    // const contractId = AccountId.fromString('0.0.48476935')
    // const hstTokenId = await createHTSCollection(client, contractId)
    // const htsTokenId = AccountId.fromString('0.0.48476936')
    const tokenId = await initializeHashiesContract(client, contractId);


}

main()
