const fs = require('fs');
const path = require('path');
const { FireblocksSDK } = require('fireblocks-sdk');
const { exit } = require('process');
const { inspect } = require('util');

const apiSecret = fs.readFileSync(path.resolve(__dirname,"fireblocks_secret.key"), "utf8");
const apiKey = "b0395bfe-3376-4148-af8a-537ad4b3c815"
// Choose the right api url for your workspace type 
const baseUrl = "https://api.fireblocks.io";
const fireblocks = new FireblocksSDK(apiSecret, apiKey, baseUrl);

const vaultAccountId = 564;
const assetId = "BTC_TEST";
const description = "Vi";
const customerRefId = "Tran1";

(async () => {
const address = await fireblocks.generateNewAddress(vaultAccountId, assetId, description, customerRefId);


console.log('Address',address);

})().catch((e)=>{
    console.error(`Failed: ${e}`);
    exit(-1);
})