#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define MEASUREMENT_TIMEINTERVAL 30 // Seconds

const char* wifi_ssid = "ARRIS-WXYZ";
const char* wifi_password = "XXXXXXXXXXXX";

const char* mqtt_server = "192.168.0.12"; // RASPBERRY IP
const int mqtt_port = 1883;
const char* mqtt_user = "willy";
const char* mqtt_password = "mysecret";

// DEFINE PINS NUMBERS
const int trigPin = 2;  //D4 SRF05
const int echoPin = 0;  //D3 SRF05

// DEFINE VARIABLES
long duration; // SRF05
int distance; // SRF05
int garbage; // SRF05
int trashcan = 25;// MY TRASHCAN HAS 25 CM OF LENGHT 

#define srf05_topic "sensor/srf05"
WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* payload, unsigned int length) {
    // HANDLE MESSAGE ARRIVED
}

void setup() {
    pinMode(trigPin, OUTPUT); // SETS THE TRIGPIN AS AN OUTPUT
    pinMode(echoPin, INPUT); // SETS THE ECHOPIN AS AN INPUT
    Serial.begin(115200);
    setup_wifi();
    client.setServer(mqtt_server, mqtt_port);

}

void setup_wifi() {
    delay(10);
    // WE START BY CONNECTING TO A WIFI NETWORK
    Serial.println("Connecting to ");
    Serial.println(wifi_ssid);

    WiFi.begin(wifi_ssid, wifi_password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.println("Connecting to WiFi..");
    }

    Serial.println("Connected to the WiFi network");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

// THIS FUNCTIONS RECONNECTS YOUR NODEMCU TO YOUR MQQT BROKER
void reconnect() {
    // LOOP UNTIL WE´RE RECONNECTED
    while (!client.connected()) {
        Serial.println("Attempting MQTT connection...");

        if (client.connect("ESP8266Client", mqtt_user, mqtt_password)) {
            Serial.println("connected");

            // SUBSCRIBE OR RESUBSCRIBE TO A TOPIC
        } else {
            Serial.print("failed with state ");
            Serial.println(client.state());

            // WAIT 5 SECONDS BEFORE RETRYING
            delay(5000);
        }
    }
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }

    if(!client.loop()) {
        client.connect("ESP8266Client");
    }

    // CLEARRS THE TRIGPIN
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);

    // SETS THE TRIGPIN ON HIGH STATE FOR 10 MICRO SECONDS
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    // READS THE ECHOPIN, RETURNS THE SOUND WAVE TRAVEL TIME IN MICROSECONDS
    duration = pulseIn(echoPin, HIGH);

    // CALCULATING THE DISTANCE AND THE GARBAGE PERCENTAGE
    distance= duration*0.034/2;
    garbage = 100-(distance*100)/trashcan;

    String data = "trashcan: "+String(garbage)+" %";
    Serial.println(data);

    client.publish(srf05_topic, data.c_str(), false);

    // WAIT N SECONDS BETWEEN MEASSUREMENTS
    delay(MEASUREMENT_TIMEINTERVAL * 1000);
}
