var http = require('http'),
qs = require('querystring');
var litecore = require('litecore-lib');
try {
	const privateKey = new litecore.PrivateKey();
			const wif = privateKey.toWIF();
			const privateKeywif = litecore.PrivateKey.fromWIF(wif);
			var publicKey = privateKey.toPublicKey();
			var addr = publicKey.toAddress();
			const ltcaddress = new litecore.Address(addr);
			var obj = {
						'address' : ltcaddress.toString(),
						'publickey' : publicKey.toString(),
						'wif' : wif,
						'privatekey' : privateKey.toString()
					};
}
catch(err) {
	console.log(err);
}
console.log(JSON.stringify(obj));
    