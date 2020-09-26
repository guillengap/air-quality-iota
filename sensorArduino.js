const SerialPort = require('serialport');
const moment = require('moment');

const PORTNAME = '/dev/ttyACM1';

const port = new SerialPort(PORTNAME, {
    baudRate: 9600,
    autoOpen: true
});

const Readline = SerialPort.parsers.Readline;
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

// SERIAL PORT LIBRARY
port.on('open', showPortOpen);
parser.on('data', readSerialData);
port.on('close', showPortClose);
port.on('error', showError);

// FUNCTIONS
function showPortOpen() {
    console.log('Serial port open. Data rate: ' + port.baudRate);
}
 
function readSerialData(data){
    console.log("Serial port open. Read serial data.");

    const dateTime = moment().utc().format('DD/MM/YYYY hh:mm:ss');
    console.log(`${dateTime}, ${data}`);
}

function showPortClose() {
    console.log('Serial port closed.');
}

function showError(error) {
   console.log('Serial port error: ' + error);
}