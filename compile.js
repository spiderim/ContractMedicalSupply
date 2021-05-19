const path= require('path'); //standered modules to get path of a file
const fs= require('fs'); //standered modules to read a file
const solc=require('solc'); //getting solidity compiler


const medicalSupplyPath= path.resolve(__dirname,'contracts','MedicalSupply.sol');
const source= fs.readFileSync(medicalSupplyPath,'utf-8');
// console.log(solc.compile(source,1));
module.exports=solc.compile(source,1).contracts[':MedicalSupply'];

