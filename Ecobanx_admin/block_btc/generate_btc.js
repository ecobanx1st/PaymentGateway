var http = require('http'),
qs = require('querystring');
var bitcore = require('bitcore-lib');
try {
	const privateKey = new bitcore.PrivateKey();
	const wif = privateKey.toWIF();
	const privateKeywif = bitcore.PrivateKey.fromWIF(wif);
	var publicKey = privateKey.toPublicKey();
    var addr = publicKey.toAddress();
	const btcaddress = new bitcore.Address(addr);
	var obj = {
				'address' : btcaddress.toString(),
				'publickey' : publicKey.toString(),
				'wif' : wif,
				'privatekey' : privateKey.toString()
			};
}
catch(err) {
	console.log(err);
}
console.log(JSON.stringify(obj));
    