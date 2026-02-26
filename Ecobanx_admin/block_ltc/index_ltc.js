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
		var litecore = require('litecore-lib');
		  if(data.method === 'create_address'){
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
		} else if(data.method === 'create_multisig_address'){
			var privateKeys = [];
			var publicKeys = [];
			var pvk;
			var wif = [];
			for (var i = 0; i < 3; i++) {
				pvk = new litecore.PrivateKey();
				publicKeys[i] = litecore.PublicKey(pvk).toString();
				privateKeys[i] = pvk;
				wif[i] = privateKeys[i].toWIF();				
			}			
			try {
			const requiredSignatures = 2;
			const address = new litecore.Address(publicKeys, requiredSignatures);
			var obj = {
						'address' : address.toString(),
						'publickey' : publicKeys,
						'wif' : wif,
						'privatekey' : privateKeys
					};
			}
			catch(err) {
				console.log(err);
			}
		} else if(data.method === 'create_rawtx'){
			try {
			const transaction = new litecore.Transaction()
				.from(JSON.parse(data.utxo))
				.to(data.toaddr, data.amount)
				.change(data.fromaddr)
				.fee(data.fee)
				.sign(data.privatekey);
			var obj = { 'rawtx' : transaction.toString() };
			}
			catch(err) {
				 console.log(err);
				}
		} else if(data.method === "create_multisig_rawtx"){
			var utxo = JSON.parse(data.utxo);
			var publicKeys = JSON.parse(data.publicKeys);
			var privatekeys = JSON.parse(data.privatekeys);
			try {
				const transaction = new litecore.Transaction()
					.from(utxo, publicKeys, 2)
					.to(data.toaddr, data.amount)
					.change(data.fromaddr)
					.fee(data.fee)
					.sign(privatekeys);
					var obj = { 'rawtx' : transaction.toString() };
				}
			catch(err) {
				 console.log(err);
				}
		}
	  res.writeHead(200);
      res.end(JSON.stringify(obj));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(8086, '127.0.0.1');