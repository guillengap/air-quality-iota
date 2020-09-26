const sensor = require('node-dht-sensor');
const Mam = require('./lib/mam.client.js');
const IOTA = require('iota.lib.js');
const moment = require('moment');

//const iota = new IOTA({ provider: 'https://nodes.devnet.thetangle.org:443' });
const iota = new IOTA({ provider: 'https://potato.iotasalad.org:14265' });
//const iota = new IOTA({ provider: 'https://peanut.iotasalad.org:14265' });

const MODE = 'restricted'; // PUBLIC, PRIVATE OR RESTRICTED
const SIDEKEY = 'mysecret'; // USED ONLY IN RESTRICTED MODE
const SECURITYLEVEL = 3; // 1, 2, 3
const TIMEINTERVAL = 30; // SECONDS
const SENSORTYPE = 11; // 11=DHT11, 22=DHT22
const GPIOPIN = 14; // RASPBERRY GPIO PIN FROM DHT11 SENSOR

// INITIALIZE MAM STATE
let mamState = Mam.init(iota, undefined, SECURITYLEVEL);

// CHANNEL MODE
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

function readSensor(){

    sensor.read(SENSORTYPE, GPIOPIN, async function(err, temperature, humidity) {
        if (!err) {
            const city = ('MEXICO');
            const building = ('65');
            const dateTime = moment().utc().format('YYYY/MM/DD hh:mm:ss'); 
            const data = `{Temperature: ${temperature.toFixed(1)}°C (${(temperature.toFixed(1)*1.8)+32}°F), Humidity: ${humidity.toFixed(1)}%}`;
            const json = {"data": data, "dateTime": dateTime, "building": building, "city": city};               

            const root = await publish(json);
            console.log(`City: ${json.city}, Building: ${json.building}, Time: ${json.dateTime} UTC, Data: ${json.data}, root: ${root}`);

        } else {
            console.log(err);
        }
    });
}

// START IT
readSensor();

// AUTOMATICALLY UPDATE SENSOR VALUE EVERY 30 SECONDS
setInterval(readSensor, TIMEINTERVAL*1000);
