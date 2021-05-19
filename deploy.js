const HDWalletProvider= require('truffle-hdwallet-provider');
const Web3=require('web3');
const {interface,bytecode}=require('./compile');

const provider=new HDWalletProvider(
'your metemask memonic',
'ink of infura for rinkeby test network',
0,
4
);
// const INITIAL_STRING='Hi i am sonu sharma';

const web3=new Web3(provider);

const deploy = async ()=>{
	const accounts=await web3.eth.getAccounts();
	console.log('Attempting to deploy from account',accounts[0]);
	console.log('second account',accounts[1]);
	console.log('third account',accounts[2]);
	console.log('fourth account',accounts[3]);
	const result=await new web3.eth.Contract(JSON.parse(interface))
					.deploy({data: bytecode})
						.send({from: accounts[0],gas: '1000000'});
	console.log(interface);
	console.log('Contract deployed to ',result.options.address);
};
deploy();