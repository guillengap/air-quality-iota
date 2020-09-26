const mqtt = require('mqtt');
const moment = require('moment');
const Mam = require('./lib/mam.client.js');
const IOTA = require('iota.lib.js');

const MODE = 'restricted';  // PUBLIC, PRIVATE OR RESTRICTED
const SIDEKEY = 'mysecret'; // ENTER ONLY ASCII CHARACTERS. USED ONLY IN RSETRICTED MODE
const SECURITYLEVEL = 3; // 1, 2 or 3

const SRF05_TOPIC = "sensor/srf05";

const BROKER_URL = "mqtt://192.168.0.12";

const options = {
    port: 1883,
    clientId: 'nodemcu_mqtt_mam.js',
    username: 'willy',
    password: 'mysecret'
};

//const iota = new IOTA({ provider: 'https://nodes.testnet.iota.org:443' });
//const iota = new IOTA({ provider: 'https://potato.iotasalad.org:14265' });
const iota = new IOTA({ provider: 'https://durian.iotasalad.org:14265' });

// INITIALIZE MAMA STATE
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

const client = mqtt.connect(BROKER_URL, options);

client.on("connect", onConnected);
client.on("message", onMessageReceived)

function onConnected() {
    client.subscribe(SRF05_TOPIC);
}

async function onMessageReceived(topic, message) {
    if (topic == SRF05_TOPIC) {
        const city = ('BERLIN');
        const building = ('7');
        const dateTime = moment().utc().format('YYYY/MM/DD hh:mm:ss');
        const data = `{${message}}`;
        const json = {"data": data, "dateTime": dateTime, "building": building, "city": city};               

        const root = await publish(json);
        console.log(`City: ${json.city}, Building: ${json.building}, dateTime: ${json.dateTime} UTC, data: ${json.data}, root: ${root}`);
    }
}
