#include <MQ2.h>
#include "MQ7.h"
#include "DHT.h"   
#define DHTPIN 2     
 
#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT22   // DHT 22  (AM2302)
//#define DHTTYPE DHT21   // DHT 21 (AM2301)

int pin = A0;
int lpg;
MQ2 mq2(pin);
MQ7 mq7(A1,5.0); 

DHT dht(DHTPIN, DHTTYPE);  //PIN AND SENSOR TYPE
 
void setup()
{
  Serial.begin(9600);
  dht.begin();
  mq2.begin();
}
 
void loop()
{
  int h = dht.readHumidity();  //READ HUMIDITY
  int t = dht.readTemperature();  //READ TEMPERATURE

  float* values= mq2.read(true); //SET IT FALSE IF YOU DON'T WANT TO PRINT THE VALUES IN THE SERIAL
 
  if (isnan(t) || isnan(h)) // ARE THERE NUMBERS?
  {
    Serial.println("Fail to read the DHT sensor"); //FAILURE IF THERE ARE NOT NUMBERS
  } else {
    //lpg = values[0];
    lpg = mq2.readLPG();
    Serial.print("CO: ");
    Serial.print(mq7.getPPM());
    Serial.print("ppm, ");
    Serial.print("Temperature: ");
    Serial.print(t);
    Serial.print("°C, ");
    Serial.print("Humidity: ");
    Serial.print(h);
    Serial.println("%"); 
  }
  delay(30000);
}
