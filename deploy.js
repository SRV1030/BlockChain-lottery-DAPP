const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');//Web3 is capital cz its a constructor
const dotenv = require("dotenv");
const path = require("path");
const { abi, evm } = require("./compile");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const mnemonicPhrase = process.env.MNEMONIC_PHRASE;
const providerUrl = process.env.INFURAENDPOINT_PROVIDER_URL;

// console.log(mnemonicPhrase);

const provider = new HDWalletProvider({
    mnemonic: mnemonicPhrase,
    providerOrUrl: providerUrl
});

const web3 = new Web3(provider);

const cColors = {
    green: '\x1b[36m%s\x1b[32m',
    yellow: '\x1b[36m%s\x1b[33m',
    red: '\x1b[36m%s\x1b[31m'
};

(async () => {
    try {
        const accounts = await web3.eth.getAccounts();

        console.log(cColors.yellow, "Pending Process: Deploying contract from Account: ", accounts[0]);
        
        const contract = await new web3.eth.Contract(abi);
        const deploy = contract.deploy({ data: '0x' + evm.bytecode.object});
        const results = await deploy.send({from: accounts[0]});

        console.log(cColors.green, "Contract deployed at account: ", results.options.address);
        
        process.exit();
    }
    catch (e) {
        console.log(cColors.red, "Contract deployement error: ", e);
        process.exit();
    }
})();