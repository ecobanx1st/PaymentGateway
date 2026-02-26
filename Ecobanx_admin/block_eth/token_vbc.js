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
		var Web3 = require('web3');
		if(typeof web3 !== 'undefined') {
			web3 = new Web3(web3.currentProvider);
		} else {
			web3 = new Web3(new Web3.providers.HttpProvider(Url));
		}
		if(data.method === 'create_address'){
			try {
				var keypair = web3.shh.newKeyPair();
				var hash = web3.shh.hasKeyPair(keypair);
				var getprivatekey = web3.shh.getPrivateKey(keypair);
				var addprivatekey = web3.shh.addPrivateKey(getprivatekey);
				var account = web3.personal.importRawKey(addprivatekey,data.psw);
				var obj = {
					'address' : account,
					'privatekey' : addprivatekey
				};
			}
			catch(err) {
				console.log(err);
			}
		}
		if(data.method === 'create_rawtx'){
			try {
				const EthereumTx = require('ethereumjs-tx');
				const privateKey = new Buffer.from(data.pvk, 'hex');
				const count = web3.eth.getTransactionCount(data.formaddr);
				const txParams = {
					from: data.formaddr,
					nonce: web3.toHex(count),
					gasPrice: web3.toHex(20000000000),
					gas: web3.toHex(21000),
					to: data.toddr,
					value: web3.toHex(web3.toWei(data.amount, 'ether')),
					data: "",
					chainId: web3.toHex(1)
				};
				const tx = new EthereumTx(txParams);
				tx.sign(privateKey);
				const serializedTx = tx.serialize();
				web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(error, txid){
					if(error){
						var obj = { "error" : error };
					} else {
						var obj = {
							"txid" : txid
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					}
					
				});
			}
			catch(err) {
				console.log(err);
			}
		}
		if(data.method === 'create_rawtx_token'){
			try {
			    var contractAddress= data.contract;
			    var abiArray= data.abiarray;
			    const EthereumTx = require('ethereumjs-tx');
				const privateKey = new Buffer.from(data.pvk, 'hex');
				const count = web3.eth.getTransactionCount(data.formaddr);			    
				var contract = web3.eth.contract(abiArray).at(contractAddress);
				let result = contract.transfer.estimateGas(data.toddr, data.amount, {from: data.formaddr});
                var amount = data.amount;
                var txParams = {
                  "from": data.formaddr,
                  "nonce": web3.toHex(count),
                  "gasPrice": web3.toHex(20000000000),
                  "gasLimit": web3.toHex(result),
                  "to": contractAddress,
                  "value": web3.toHex(0),
                  "data": contract.transfer.getData(data.toddr, data.amount, {from: data.formaddr}),
                  "chainId": web3.toHex(1)
                };
              
				const tx = new EthereumTx(txParams);
				tx.sign(privateKey);
				const serializedTx = tx.serialize();
				web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(error, txid){
					if(error){
						var obj = { "error" : error };
					} else {
						var obj = {
							"txid" : txid
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					}
					
				});
			}
			catch(err) {
				console.log(err);
			}
		}
		if(data.method === 'get_balance'){
			try{
				web3.eth.getBalance(data.address, function(error, balance){
					if(!error){
						console.log(balance.toString(10));
					} else {
						var obj = { "error" : error };
					}
				});
			}
			catch(err) {
				console.log(err);
			}
		}
		
		
	});
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(9545, '159.65.34.156');