const assert = require('assert');
const ganache = require("ganache-cli");
// ganache creates its own dummy unlocked accounts
const Web3 = require('web3');//Web3 is capital cz its a constructor
const web3 = new Web3(ganache.provider());//linking web3 and ganache
const { abi, evm } = require("../compile");

const cConfig = {
    cColors: {
        green: '\x1b[36m%s\x1b[32m',
        yellow: '\x1b[36m%s\x1b[33m',
        red: '\x1b[36m%s\x1b[31m'
    },
    cUnicodes: {
        check: '✓',
        cross: '⨯',
        gas: '⧫'
    },
    cSpaces: (ns) => Array(ns + 1).join(" ")
};



beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();//web3.eth is for etherium. every fucntion of web3 is asynchronouus

    //Use one of thpse accounts to deploy the contract

    let contract = await new web3.eth.Contract(abi);
    let deploy = await contract.deploy({ data: '0x' + evm.bytecode.object });// creates the contract with constract construtor arguments
    lottery = await deploy.send({ from: accounts[0], gas: '1000000' });// deploys the contract with constract construtor arguments

});

describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);//address of contract. ok checks if value exists or not
    });
    it('allows one account to enter in the lottery', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')//included in web3 sending 0.02 ether
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });
    it('allows multiple account to enter in the lottery', async () => {
        const multiAccounts = accounts.slice(0, 3);
        for (let i = 0; i < multiAccounts.length; i++) {
            await lottery.methods.enter().send({
                from: accounts[i],
                value: web3.utils.toWei('0.02', 'ether')
            });
        }
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        for (let i = 0; i < multiAccounts.length; i++) {
            assert.strictEqual(accounts[i], players[i]);;
        }
        assert.strictEqual(3, players.length);
    });
    it('requires a minimum amount of ether to enter', async () => {
        // try{ 
        //     await lottery.methods.enter().send({
        //     from: accounts[0],
        //     value: 0
        //     });
        // assert(false);
        // }
        // catch(err){
        //     assert.ok(err);
        // }
        await assert.rejects(async () => {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            // assert(false);
        }, (err) => {
            console.log(
                cConfig.cColors.green,
                cConfig.cSpaces(3),
                cConfig.cUnicodes.check,
                err.results[Object.keys(err.results)[0]]['reason']
            );
            assert(err);
            return true;
        });

    });
    it('requires admin privileges', async () => {
        await assert.rejects(async () => {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
        }, (err) => {
            console.log(
                cConfig.cColors.green,
                cConfig.cSpaces(3),
                cConfig.cUnicodes.check,
                err.results[Object.keys(err.results)[0]]['reason']
            );
            assert(err);
            return true;
        });
    });

    it('Complete lottery set up Check i.e sends money + gets winner and finally resets array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initBalance;

        console.log(
            cConfig.cColors.yellow,
            cConfig.cSpaces(3),
            cConfig.cUnicodes.gas,
            web3.utils.fromWei((difference).toString(), 'ether'),
            'ETH'
        );
        assert(difference > web3.utils.toWei('1.8', 'ether'));

        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        const contractBalance = await web3.eth.getBalance(lottery.options.address);

        assert.strictEqual(0, players.length);
        assert.strictEqual(0, Number(contractBalance));
    });

});

