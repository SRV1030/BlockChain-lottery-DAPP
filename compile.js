// compile code will go here

const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "lottery.sol");
const source = fs.readFileSync(lotteryPath, "utf-8");
//file,encodeing;
// we dont directly reyure sol files cz the node will treat them as js and try to run them

// console.log(solc.compile(source,1));

var input = {
    language: 'Solidity',
    sources: {
        'lottery.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};

// console.log(JSON.parse(solc.compile(JSON.stringify(input))).contracts);
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts['lottery.sol']['Lottery'];
