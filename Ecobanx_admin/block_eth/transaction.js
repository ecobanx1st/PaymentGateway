var http = require('http'),
    qs = require('querystring');
var server = http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var data = JSON.parse(body);
      var Url = data.url;
      const Web3 = require('web3');

// Variables definition
const privKey = data.pvk; // Genesis private key
const addressFrom = data.formaddr;
const addressTo = data.toddr;
const web3 = new Web3(Url);


// Create transaction
const deploy = async () => {
   console.log(
      `Attempting to make transaction from ${addressFrom} to ${addressTo}`
   );
 try {
   //console.log('ChainID',data.chainId);
   const createTransaction = await web3.eth.accounts.signTransaction(
      {
         from: addressFrom,
         to: addressTo,
         value: web3.utils.toWei(String(data.amount), 'ether'),
         gas: '21000',
         chainId:web3.utils.toHex(data.chainId)
      },
      privKey
   );
   //console.log('createTransaction',createTransaction);

   // Deploy transaction
   const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
   );
   //console.log('createReceipt',createReceipt);
   console.log(
      `Transaction successful with hash: ${createReceipt.transactionHash}`
   );
   var obj = {
      "txid" : createReceipt.transactionHash
   };
   } catch (error) {
      console.log('ERRoR',error);
   var obj = {
      'status': false,
      'result': error.toString()
    };
    return false;
  }
   console.log('txid',obj);
   res.writeHead(200);
   res.end(JSON.stringify(obj));
};
// Token Create transaction
const deployToken = async () => {
   console.log(
      `Attempting to make transaction from ${addressFrom} to ${addressTo}`
   );
   try {
   var contractAddress= data.contract;
   chainID = data.chainId;
   var abiArray= JSON.parse(data.abiarray);
   amountToSend = data.amount;
   //amount = web3.utils.toWei(String(data.amount), 'ether');
   let contract = new web3.eth.Contract(abiArray, contractAddress, { from: addressFrom, gas: data.gaslimit, gasPrice: data.gasprice});
   //var contract = web3.eth.contract(abiArray).at(contractAddress);
   const tokenDecimal = await contract.methods.decimals().call();
   var value1 = (amountToSend*(10**tokenDecimal)).toString();
   value = convert(value1);
   var amount = web3.utils.toBN(value);

   let dataContract = contract.methods.transfer(addressTo, amount).encodeABI();
   const gasPrice = await web3.eth.getGasPrice();
   gasAmount = await contract.methods.transfer(addressTo, amount).estimateGas({ from: addressFrom });
   
   const createTransaction = await web3.eth.accounts.signTransaction(
      {
         from: addressFrom,
         to: contractAddress,
         value: web3.utils.toWei('0', 'ether'),
         data: dataContract,
         gas: gasAmount, 
         gasPrice: gasPrice,
         chainId:web3.utils.toHex(chainID)
      },
      privKey
   );

   // Deploy transaction
   const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
   );
   console.log(
      `Transaction successful with hash: ${createReceipt.transactionHash}`
   );
   var obj = {
      "txid" : createReceipt.transactionHash
   };
   } catch (error) {

   var obj = {
      'status': false,
      'result': error.toString()
    };
    return false;
  }
   console.log('txid',obj);
   res.writeHead(200);
   res.end(JSON.stringify(obj));
};
const getGasAmountForContractCall = async (fromAddress, toAddress, amountToSend, ABI,contractAddress) => {
   try {
   var abiArray= JSON.parse(ABI);
   const contract = new web3.eth.Contract(abiArray, contractAddress);
   const tokenDecimal = await contract.methods.decimals().call();
   var value1 = (amountToSend*(10**tokenDecimal)).toString();
   value = convert(value1);
   //console.log('value',value);
   
   var amount = web3.utils.toBN(value);
   //console.log('amount',amount);
    gasAmount = await contract.methods.transfer(toAddress, amount).estimateGas({ from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();
    const fee = gasPrice * gasAmount;
    var obj = {
      "gasAmount" : gasAmount,
      "gasPrice" : gasPrice,
      "fee" : fee
      };
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return gasAmount
   } catch (error) {

   var obj = {
      'status': false,
      'result': error.toString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(obj));
    return false;
  }
    
}
const getBalanceToken = async (toAddress,ABI,contractAddress) => {
   try {
      var abiArray= JSON.parse(ABI);
      const contract = new web3.eth.Contract(abiArray, contractAddress);
      balance = await contract.methods.balanceOf(toAddress).call();
      const balanceInWei = web3.utils.fromWei(balance);
      var obj = {
         'status': true,
         "balance" : balance,
         "balanceInWei" : balanceInWei
      };
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return balance
   } catch (error) {
      var obj = {
         'status': false,
         'result': error.toString()
      };
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return false;
   }    
}
const getBalance = async (address) => {
   try { 
      const balanceWei = await web3.eth.getBalance(address);  
      balance = web3.utils.fromWei(balanceWei, 'ether');
      var obj = {
         'status': true,
         "balance" : balance,
         "balanceInWei" : balanceWei
      };
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return balance
   } catch (error) {

   var obj = {
      'status': false,
      'result': error.toString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(obj));
    return false;
  }    
}
const getNewAddress = async () => {
   try {
		var account = web3.eth.accounts.create();
		var privateKey = account.privateKey;
		var addr = account.address;
	
		var obj = {
			'status': true,
			'address' : addr.toString(),
			'privateKey' : privateKey.toString()
		};
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return obj
	} catch (error) {

		var obj = {
		  'status': false,
		  'result': error.toString()
		};
		res.writeHead(200);
		res.end(JSON.stringify(obj));
		return false;
	}    
}
const getBlockTransaction = async (startBlock,latestBlock=null) => {
   try {
         if(latestBlock == null ||  latestBlock ==''){
            latestBlock = await getLatestBlockNumber();
         }
      var myTrans = [];
      for (let i = startBlock; i <= latestBlock; i++) {
        const block = await web3.eth.getBlock(i, true);
         if (block && block.transactions) {
            block.transactions.forEach((tx) => {
               date = new Date(block.timestamp * 1000); // Convert timestamp to milliseconds
               tx.timestamp =  block.timestamp;
               tx.date =  date;
               tx.amount =  web3.utils.fromWei(tx.value, 'ether');
               /*     console.log(`Block Number: ${tx.blockNumber}`);
                    console.log(`From: ${tx.from}`);
                    console.log(`To: ${tx.to}`);
                    console.log(`Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
                    console.log(`Transaction Hash: ${tx.hash}`);
                    console.log(`---------------------------------`);*/
               myTrans.push(tx);
            });
         }
      }   
      var obj = {
         'status': true,
         'data' : myTrans,
         'lastblock' : latestBlock
      };
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return obj
   } catch (error) {

      var obj = {
        'status': false,
        'result': error.toString()
      };
      res.writeHead(200);
      res.end(JSON.stringify(obj));
      return false;
   }    
}

function convert(n) {
  var sign = +n < 0 ? "-" : "",
    toStr = n.toString();
  if (!/e/i.test(toStr)) {
    return n;
  }
  var [lead, decimal, pow] = n.toString()
    .replace(/^-/, "")
    .replace(/^([0-9]+)(e.*)/, "$1.$2")
    .split(/e|\./);
  return +pow < 0 ?
    sign + "0." + "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal :
    sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))) : (decimal.slice(0, +pow) + "." + decimal.slice(+pow)))
}
async function getLatestBlockNumber() {
   return await web3.eth.getBlockNumber();
}


if(data.method === 'create_rawtx_token'){
   deployToken();
}
if(data.method === 'create_rawtx_adminfee'){
   deploy();
}
if(data.method === 'getGasAmountForContractCall'){
   getGasAmountForContractCall(data.formaddr, data.toddr, data.amount, data.abiarray,data.contract);
}
if(data.method === 'getBalanceToken'){
   getBalanceToken(data.address, data.abiarray,data.contract);
}
if(data.method === 'getBalance'){
   getBalance(data.address);
}
if(data.method === 'getNewAddress'){
   getNewAddress();
}
if(data.method === 'getBlockTransaction'){
   getBlockTransaction(data.startblock,data.endblock);
}

});
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(8545, '127.0.0.1');