const fs = require('fs')

const main = async () => {
    const bytecode = await fs.readFileSync('./build/contracts_hashie_sol_HTS.bin')
    console.log(bytecode.length)
}
main()
