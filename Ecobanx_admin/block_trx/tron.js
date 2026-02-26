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
		if(data.method === 'get_hex'){
			try {
				var TronWeb = require('tronweb')
				var HttpProvider = TronWeb.providers.HttpProvider;
				var fullNode = new HttpProvider("https://api.trongrid.io");
				var solidityNode = new HttpProvider("https://api.trongrid.io");
				var eventServer = new HttpProvider("https://api.trongrid.io");
				var privateKey = "3481E79956D4BD95F358AC96D151C976392FC4E3FC132F78A847906DE588C145";
				var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
				tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});
				//convert address here
				var get_address = tronWeb.address.toHex(data.address);
				var obj = {
					"hex_address" : get_address
				};
				res.writeHead(200);
				res.end(JSON.stringify(obj));
			}
			catch(err) {
				console.log(err);
			}
		}
		else if(data.method === 'get_trx_address'){
			try {
				var TronWeb = require('tronweb')
				var HttpProvider = TronWeb.providers.HttpProvider;
				var fullNode = new HttpProvider("https://api.trongrid.io");
				var solidityNode = new HttpProvider("https://api.trongrid.io");
				var eventServer = new HttpProvider("https://api.trongrid.io");
				var privateKey = "3481E79956D4BD95F358AC96D151C976392FC4E3FC132F78A847906DE588C145";
				var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
				tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});

				//get address here
				tronWeb.createAccount().then(function (result) {
					var obj = {
						"address" : result.address.base58,
						"privateKey" : result.privateKey,
						"hexAddress" : result.address.hex
					};
					res.writeHead(200);
					res.end(JSON.stringify(obj));
				});
			}
			catch(err) {
				console.log(err);
			}
		}
		else if(data.method === 'send_trxtn'){
			async function sendTrxTn() {
				try
				{
					var TronWeb = require('tronweb')
					var HttpProvider = TronWeb.providers.HttpProvider;
					var fullNode = new HttpProvider("https://api.trongrid.io");
					var solidityNode = new HttpProvider("https://api.trongrid.io");
					var eventServer = new HttpProvider("https://api.trongrid.io");
					var privateKey = data.pvtk;
					var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
					tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});
					var tx = tronWeb.trx.sendTransaction(data.to_address, data.amount).then(output => {
						var obj = {
							"txid" : output
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					});
				}
				catch (e) { console.log(e); }
			}
			sendTrxTn();
		}
		else if(data.method === 'get_hextoaddress'){
			try {
				var TronWeb = require('tronweb')
				var HttpProvider = TronWeb.providers.HttpProvider;
				var fullNode = new HttpProvider("https://api.trongrid.io");
				var solidityNode = new HttpProvider("https://api.trongrid.io");
				var eventServer = new HttpProvider("https://api.trongrid.io");
				var privateKey = "3481E79956D4BD95F358AC96D151C976392FC4E3FC132F78A847906DE588C145";
				var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
				tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});

				//convert address here
				var get_address = tronWeb.address.fromHex(data.address);
				var obj = {
					"hex_address" : get_address
				};
				res.writeHead(200);
				res.end(JSON.stringify(obj));
			}
			catch(err) {
				console.log(err);
			}
		}
		else if(data.method === 'get_trx_balance'){
			try {
				var TronWeb = require('tronweb')
				var HttpProvider = TronWeb.providers.HttpProvider;
				var fullNode = new HttpProvider("https://api.trongrid.io");
				var solidityNode = new HttpProvider("https://api.trongrid.io");
				var eventServer = new HttpProvider("https://api.trongrid.io");
				var privateKey = "3481E79956D4BD95F358AC96D151C976392FC4E3FC132F78A847906DE588C145";
				var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
				tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});

				//convert address here
				var get_address = tronWeb.trx.getBalance(data.address).then(result => {
						var obj = {
							"balance" : result
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					}).catch(console.log);
			}
			catch(err) {
				console.log(err);
			}
		}
		else if(data.method === 'get_confirmed_tx'){
			try {
				var TronWeb = require('tronweb')
				var HttpProvider = TronWeb.providers.HttpProvider;
				var fullNode = new HttpProvider("https://api.trongrid.io");
				var solidityNode = new HttpProvider("https://api.trongrid.io");
				var eventServer = new HttpProvider("https://api.trongrid.io");
				var privateKey = "3481E79956D4BD95F358AC96D151C976392FC4E3FC132F78A847906DE588C145";
				var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
				tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});

				//convert address here
				try {
					tronWeb.trx.getConfirmedTransaction(data.txhash)
					.then(function (result) {
						var obj = {
							"txid" : result
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					})
					.catch(function (errors) {
						var obj = {
							"errors" : errors
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					});
				} catch(err) { console.log(err); }
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
server.listen(8646, '127.0.0.1');
