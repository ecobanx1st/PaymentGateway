var http = require('http'),
qs = require('querystring');
var Web3 = require("web3");

var web3 = new Web3('https://polygon-rpc.com');
try {
	var account = web3.eth.accounts.create();
	var privateKey = account.privateKey;
    var addr = account.address;
	var obj = {
				'address' : addr.toString(),
				'privateKey' : privateKey.toString()
			};
}
catch(err) {
	console.log(err);
}
console.log(JSON.stringify(obj));