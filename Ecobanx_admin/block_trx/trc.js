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
		//tron web declaration
		var TronWeb = require('tronweb')
		var HttpProvider = TronWeb.providers.HttpProvider;
		var fullNode = new HttpProvider("https://api.trongrid.io");
		var solidityNode = new HttpProvider("https://api.trongrid.io");
		var eventServer = new HttpProvider("https://api.trongrid.io");

		if(data.method === 'send_trc'){
			async function sendTx() {
				try
				{
					var privateKey = data.pvtk;
					var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey); 
					tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'});

					var trc20ContractAddress = data.contract;
					var contract = await tronWeb.contract().at(trc20ContractAddress);
					var tx = contract.transfer(data.to_address, data.amount).send({
						feelimit: data.fee_limit
					}).then(output => {
						var obj = {
							"txid" : output
						};
						res.writeHead(200);
						res.end(JSON.stringify(obj));
					}
					);
				}
				catch (e) { console.log(e); }
			}
			sendTx();
		}
		if(data.method === 'send_trc_balance'){
			async function getBalanceTRC20() {
				try
				{
					var privateKey = data.pvtk;
					const CONTRACT = data.contract;
					const ACCOUNT = data.address;

					var tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
					tronWeb.setHeader({"TRON-PRO-API-KEY": '3291e4ee-9652-4d0e-b1cb-13d9c8249d9f'}); 
					var trc20ContractAddress = data.contract;
					var contract = await tronWeb.contract().at(trc20ContractAddress);
					const balance = await contract.methods.balanceOf(ACCOUNT).call();
					//console.log("balance:", balance.toString());

					var obj = {
						"result" : balance.toString() 
					};
					res.writeHead(200);
					res.end(JSON.stringify(obj));					
				}
				catch (e) { console.log(e); }
			}
			getBalanceTRC20();
		}
	});
	} else {
		res.writeHead(404);
		res.end();
	}
});
server.listen(8647, '127.0.0.1');