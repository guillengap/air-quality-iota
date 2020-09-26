const SerialPort = require('serialport');
const moment = require('moment');

const IOTA = require('iota.lib.js');
const Mam = require('./lib/mam.client.js');

//const iota = new IOTA({ provider: 'https://nodes.testnet.iota.org:443' });
const iota = new IOTA({ provider: 'https://potato.iotasalad.org:14265' });

const MODE = 'restricted'; // PUBLIC, PRIVATE, RESTRICTED
const SIDEKEY = 'mysecret'; // ONLY ASCII CHARACTERS
const SECURITYLEVEL = 3; // 1, 2, 3

const PORTNAME = '/dev/ttyACM1'; // ENTER VALID PORT 

const port = new SerialPort(PORTNAME, {
    baudRate: 9600,
    autoOpen: true
});

const Readline = SerialPort.parsers.Readline;
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

// INITIALIZE MAM STATE
let mamState = Mam.init(iota, undefined, SECURITYLEVEL);

// SET CHANNEL MODE
if (MODE == 'restricted') {
    const key = iota.utils.toTrytes(SIDEKEY);
    mamState = Mam.changeMode(mamState, MODE, key);
} else {
    mamState = Mam.changeMode(mamState, MODE);
}

// PUBLISH TO TANGLE
const publish = async function(packet) {
    // CREATE MAM PAYLOAD
    const trytes = iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(mamState, trytes);

    // SAVE NEW MAMSTATE
    mamState = message.state;
    console.log('Root: ', message.root);
    console.log('Address: ', message.address);

    // ATTACH THE PAYLOAD
    await Mam.attach(message.payload, message.address);

    return message.root;
}

// SERIAL PORT LIBRARY EVENTS
port.on('open', showPortOpen);
parser.on('data', readSerialData);
port.on('close', showPortClose);
port.on('error', showError);

// CALLBACK FUNCTIONS
function showPortOpen() {
    console.log('Serial port open. Data rate: ' + port.baudRate);
}

async function readSerialData(data){
    let json = {};

    const time = moment().utc().format('YYYY/MM/DD hh:mm:ss');
    const city = ('NY');
    const building = ('13');

    json['time'] = time;
        json['city'] = `${city}`;
        json['building'] = `${building}`;
	json['data'] = `{${data}}`;

    console.log('json = ',json);
    const root = await publish(json);
}

function showPortClose() {
    console.log('Serial port closed.');
}

function showError(error) {
   console.log('Serial port error: ' + error);
}
