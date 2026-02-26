'use strict';
const RippleAPI = require('ripple-lib').RippleAPI;

const api = new RippleAPI({
  server: 'wss://s1.ripple.com' // Public rippled server
});
api.connect().then(() => {
  /* begin custom code ------------------------------------ */
  
  return api.generateAddress();

}).then(info => {
	var myJSON = JSON.stringify(info);
	console.log(myJSON);
	process.exit(0);
	//console.log('getAccountInfo done');

  /* end custom code -------------------------------------- */
}).then(() => {
  return api.disconnect();
}).then(() => {
  //console.log('done and disconnected.');
}).catch(console.error);