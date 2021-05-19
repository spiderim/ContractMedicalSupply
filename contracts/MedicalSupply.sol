pragma solidity ^0.4.17;

contract MedicalSupply{
    address public medical_company;
    address[] public suppliers;
    uint order_id;
    string medicine_name;
    address public customer;
    uint cost;
    address public doctor;
    string status;
    
    function MedicalSupply() public{
      medicine_name='abc'; 
      status='NA';         
    }
    
    function takeCare(address patient,string drug) public{
      doctor=msg.sender;
      customer=patient;
      medicine_name=drug;
      status='0';
    }

    function make_order(address owner) public payable{
        require(msg.value>=.001 ether);
        require(msg.sender==customer);
        medical_company=owner;
        order_id=create_order_id(); 
        status='1';
    }
    
    function send_order(address supplier,uint price) public{
       require(msg.sender==medical_company);
       suppliers.push(supplier);
       cost=price;
       status='2';
    }
    
    function delivered() public payable{
      require(msg.sender==customer);
      uint total_balance=this.balance/1000000000000000000;
      require(cost<=total_balance);
      uint remain_balance=total_balance-cost;
      customer.transfer(remain_balance*1000000000000000000);
      medical_company.transfer(this.balance);
      status='3';
    }
    
    
    
    function create_order_id() private view returns(uint){
		   return uint(keccak256(block.difficulty,now,customer,medical_company));
	  }
	
	 function getCost() public view returns(uint){
	    return cost;
	 }
	
	 function getOrderId() public view returns(uint){
	  return order_id;  
	 }
	
	 function getMedicineName() public view returns(string){
	    return medicine_name;
	 }

    function getSuppliers() public view returns(address[]){
      return suppliers;
    } 

    function getStatus() public view returns(string){
      return status;
    }  
}