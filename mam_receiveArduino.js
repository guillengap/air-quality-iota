const Mam = require('./lib/mam.client.js');
const IOTA = require('iota.lib.js');
//const iota = new IOTA({ provider: 'https://nodes.testnet.iota.org:443' });
const iota = new IOTA({ provider: 'https://potato.iotasalad.org:14265' });

const MODE = 'restricted'; // PUBLIC, PRIVATE OR RESTRICTED
const SIDEKEY = 'mysecret'; // ENTER ONLY ASCII CHARACTERS

let root;
let key;

// CHECK THE ARGUMENTS
const args = process.argv;
if(args.length !=3) {
    console.log('Missing root as argument: node mam_receive.js <root>');
    process.exit();
} else if(!iota.valid.isAddress(args[2])){
    console.log('You have entered an invalid root: '+ args[2]);
    process.exit();
} else {
    root = args[2];
}

// INITIALIZE MAM STATE
let mamState = Mam.init(iota);

// SET CHANNEL MODE
if (MODE == 'restricted') {
    key = iota.utils.toTrytes(SIDEKEY);
    mamState = Mam.changeMode(mamState, MODE, key);
} else {
    mamState = Mam.changeMode(mamState, MODE);
}

// RECEIVE DATA FROM THE TANGLE
const executeDataRetrieval = async function(rootVal, keyVal) {
    let resp = await Mam.fetch(rootVal, MODE, keyVal, function(data) {
    let json = JSON.parse(iota.utils.fromTrytes(data));
    console.log(`City: ${json.city}, Building: ${json.building}, Time: ${json.time} UTC, Data: ${json.data}`);
    });

    executeDataRetrieval(resp.nextRoot, keyVal);
}

executeDataRetrieval(root, key);
