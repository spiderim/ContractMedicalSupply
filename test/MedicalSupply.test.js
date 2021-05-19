const assert=require('assert');
const ganache=require('ganache-cli');
const Web3=require('web3');
const web3=new Web3(ganache.provider());
const {interface,bytecode}=require('../compile');

let accounts;
let medicalSupply;

beforeEach(async () =>{
	//get list of all account
	 accounts= await web3.eth.getAccounts();
	 // console.log(accounts);

	//Use one of the account to deploy the contract
	medicalSupply=await new web3.eth.Contract(JSON.parse(interface))
		.deploy({data: bytecode})
			.send({from: accounts[0],gas: '1000000'});
});

describe('medicalSupply Contract',()=>{
	it('deploys a contract',()=>{
		// console.log(inbox);
		//check if the address of deployment exist or not
		assert.ok(medicalSupply.options.address);
	});

	it('doctor suggest medical treatment take care',async()=>{
		await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		});
		const doctor=await medicalSupply.methods.doctor().call();
		const name=await medicalSupply.methods.getMedicineName().call();
		assert.equal('paracetamol',name);
		assert.equal(accounts[3],doctor);

	});

	it('it makes an order',async()=>{
		await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		});

		await medicalSupply.methods.make_order(accounts[1]).send({
			from:accounts[0],
			value:web3.utils.toWei('0.02','ether')
		});

		const name=await medicalSupply.methods.getMedicineName().call();
		const medical_company=await medicalSupply.methods.medical_company().call();
		const customer=await medicalSupply.methods.customer().call();
		const orderid=await medicalSupply.methods.getOrderId().call();

		assert.equal('paracetamol',name);
		assert.equal(accounts[1],medical_company);
		assert.equal(accounts[0],customer);
		assert.ok(orderid);

	});
	it('only customer-patient can make order',async()=>{
		try{
		await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		});

		await medicalSupply.methods.make_order(accounts[1]).send({
			from:accounts[2],
			value:web3.utils.toWei('0.02','ether')
		});

		assert(false);
		}catch(err){
			assert.ok(err);
		}
	});

	it('customer requires a minimum amount of ether to enter',async()=>{
		try{
			await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		    });

			await medicalSupply.methods.make_order(accounts[1]).send({
				from:accounts[0],
				value:0
			});
			assert(false);
		}catch(err){
			assert.ok(err);
		}

	});

	it('medical_company sends an order to customer',async()=>{
		await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		});

		await medicalSupply.methods.make_order(accounts[1]).send({
			from:accounts[0],
			value:web3.utils.toWei('0.02','ether')
		});
	
		await medicalSupply.methods.send_order(accounts[2],2).send({
			from:accounts[1],
			gas:3000000
		});		

		const supplier=await medicalSupply.methods.getSuppliers().call();
		const cost=await medicalSupply.methods.getCost().call();

		assert.equal(accounts[2],supplier);
		assert.equal(2,cost);


	});

	it('order delivered by customer',async()=>{

		await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		});
		const medical_company=await medicalSupply.methods.medical_company().call();
		const suppliers=await medicalSupply.methods.getSuppliers().call();
		const orderid=await medicalSupply.methods.getOrderId().call();
		const cost=await medicalSupply.methods.getCost().call();
		console.log(medical_company);
		console.log(suppliers.length);
		console.log(orderid);
		console.log(cost);

		const initial_balance_customer=await web3.eth.getBalance(accounts[0]);

		await medicalSupply.methods.make_order(accounts[1]).send({
			from:accounts[0],
			value:web3.utils.toWei('0.02','ether')
		});
	
		await medicalSupply.methods.send_order(accounts[2],2).send({
			from:accounts[1],
			gas:3000000
		});

		const initial_balance_medical=await web3.eth.getBalance(accounts[1]);

		await medicalSupply.methods.delivered().send({
			from:accounts[0],
			value:web3.utils.toWei('3','ether')
		});

		const final_balance_customer=await web3.eth.getBalance(accounts[0]);
		const final_balance_medical=await web3.eth.getBalance(accounts[1]);

		const difference_medical=final_balance_medical - initial_balance_medical;
		const difference_customer=initial_balance_customer - final_balance_customer;

		assert(difference_medical>=web3.utils.toWei('2','ether'));


	});

	it('only medical company can send order',async()=>{
		try{
			await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		    });

			await medicalSupply.methods.make_order(accounts[1],'paracetamol').send({
			from:accounts[0],
			value:web3.utils.toWei('0.02','ether')
		    });
	
		    const val=await medicalSupply.methods.send_order(accounts[2],2).send({
			from:accounts[0],
			gas:3000000
		    });	
		    assert(false);
		}catch(err){
			assert.ok(err);
		}
	});

	it('only customer can deliver order',async()=>{
		try{
			await medicalSupply.methods.takeCare(accounts[0],'paracetamol').send({
			from:accounts[3],
			gas:3000000
		    });
			await medicalSupply.methods.make_order(accounts[1],'paracetamol').send({
				from:accounts[0],
				value:web3.utils.toWei('0.02','ether')
			});
		
			await medicalSupply.methods.send_order(accounts[2],2).send({
				from:accounts[1],
				gas:3000000
			});

			await medicalSupply.methods.delivered().send({
				from:accounts[1],
				value:web3.utils.toWei('3','ether')
			});	
			assert(false);		
		}catch(err){
			assert.ok(err);
		}

	});

	
});
