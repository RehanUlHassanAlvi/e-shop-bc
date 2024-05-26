// src/web3.js
import Web3 from 'web3';
import ReviewContract from './ReviewContract.json'; 

const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545'); 
const contractAddress = '0xF665312D3Ca1c819919cE1ac2f3ccE6e2FE320aD'; 
const reviewContract = new web3.eth.Contract(ReviewContract.abi, contractAddress);

export { web3, reviewContract };
