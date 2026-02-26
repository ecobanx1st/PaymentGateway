var http = require('http'),
qs = require('querystring');
const fs = require('fs');
const path = require('path');
const { FireblocksSDK } = require('fireblocks-sdk');
const { exit } = require('process');
const { inspect } = require('util');

var server = http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var data = JSON.parse(body);
      const apiSecret = fs.readFileSync(path.resolve(__dirname,"fireblocks_secret.key"), "utf8");
      const apiKey = data.apiKey;
      const baseUrl = data.baseUrl;
      const fireblocks = new FireblocksSDK(apiSecret, apiKey, baseUrl);
      // Create Vault
      const createVault = async (name, hiddenOnUI, customerRefId, autoFueling) => {
        try {
          const vaultAccount = await fireblocks.createVaultAccount(name, hiddenOnUI, customerRefId, autoFueling);
          var obj = {
            'status': true,
            'result': vaultAccount
          };
        } catch (error) {
          //console.error(`Failed: ${error}`);
          //exit(-1);
          var obj = {
            'status': false,
            'result': error.toString()
          };
        }
       console.log('Result',obj);
       res.writeHead(200);
       res.end(JSON.stringify(obj));
      };
      // Create Asset
      const createVaultAsset = async (vaultAccountId, assetId) => {
        try {
          const vaultAsset = await fireblocks.createVaultAsset(vaultAccountId, assetId);
          var obj = {
            'status': true,
            'result': vaultAsset
          };
        } catch (error) {
          //console.error(`Failed: ${error}`);
          //exit(-1);
          var obj = {
            'status': false,
            'result': error.toString()
          };
        }
       console.log('Result',obj);
       res.writeHead(200);
       res.end(JSON.stringify(obj));
      };
      // GET Deposit Address
      const depositAddresses = async (vaultAccountId, assetId) => {
        try {
          const depositAddresses = await fireblocks.getDepositAddresses(vaultAccountId, assetId);
          var obj = {
            'status': true,
            'result': depositAddresses
          };
        } catch (error) {
          //console.error(`Failed: ${error}`);
          //exit(-1);
          var obj = {
            'status': false,
            'result': error.toString()
          };
        }
       console.log('Result',obj);
       res.writeHead(200);
       res.end(JSON.stringify(obj));
      };
      // Create Address
      const generateAddress = async (vaultAccountId, assetId, description, customerRefId) => {
        try {
          const address = await fireblocks.generateNewAddress(vaultAccountId, assetId, description, customerRefId);
          console.log(inspect(address, false, null, true));
          var obj = {
            'status': true,
            'result': address
          };
        } catch (error) {
          //console.error(`Failed: ${error}`);
          //exit(-1);
          var obj = {
            'status': false,
            'result': error.toString()
          };
        }
       console.log('Result',obj);
       res.writeHead(200);
       res.end(JSON.stringify(obj));
      };
      // Transaction Histroy
      const getTransactions = async (params) => {
        try {
          const transactions = await fireblocks.getTransactions(params);
          console.log(inspect(transactions, false, null, true));
          var obj = {
            'status': true,
            'result': transactions
          };
        } catch (error) {
          //console.error(`Failed: ${error}`);
          //exit(-1);
          var obj = {
            'status': false,
            'result': error.toString()
          };
        }
       console.log('Result',obj);
       res.writeHead(200);
       res.end(JSON.stringify(obj));
      };
      // Create Transaction 
      const createTransactions = async (params) => {
        try {
          const payload: TransactionArguments = { assetId: asset, source: { type:  o
          , id: sourceId || 0 }, destination: { type: destinationType, id: String(destinationId) }, amount: String(amount), fee: String(fee), note: "Created by fireblocks SDK" }; 
          const result = await fireblocks.createTransaction(payload);
          console.log(inspect(result, false, null, true));
          var obj = {
            'status': true,
            'result': result
          };
        } catch (error) {
          //console.error(`Failed: ${error}`);
          //exit(-1);
          var obj = {
            'status': false,
            'result': error.toString()
          };
        }
       console.log('Result',obj);
       res.writeHead(200);
       res.end(JSON.stringify(obj));
      };

      if(data.method === 'createVault'){
        createVault(data.name, data.hiddenOnUI,data.customerRefId,data.autoFuel);
      }

      if(data.method === 'createVaultAsset'){
        createVaultAsset(data.vaultAccountId, data.assetId);
      }

      if(data.method === 'depositAddresses'){
        depositAddresses(data.vaultAccountId, data.assetId);
      }

      if(data.method === 'generateAddress'){
        generateAddress(data.vaultAccountId, data.assetId,data.description,data.customerRefId);
      }

      if(data.method === 'getTransactions'){
        getTransactions(data.params);
      }

    });
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(8545, '127.0.0.1');