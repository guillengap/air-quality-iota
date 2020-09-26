const sensor = require('node-dht-sensor');

const TIMEINTERVAL = 10; // 10 SECONDS
const SENSORTYPE = 11; // 11=DHT11, 22=DHT22
const GPIOPIN = 4; // RASPBERRY GPIO PIN FROM THE DHT11 SENSOR

function readSensor(){
    sensor.read(SENSORTYPE, GPIOPIN, function(err, temperature, humidity) {
        if (!err) {
            console.log('temp: ' + temperature.toFixed(1) + 'C, ' + 'humidity: ' + humidity.toFixed(1) + '%');
        } else {
            console.log(err);
        }
    });
}

readSensor();

// AUTOMATICALLY UPDATE SENSOR VALUE EVERY 10 SECONDS
setInterval(readSensor, TIMEINTERVAL*1000);
