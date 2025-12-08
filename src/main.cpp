#include <Arduino.h>
#include <ESP8266WiFi.h>
// put function declarations here:
int myFunction(int, int);

void setup()
{
  Serial.begin(115200);
  Serial.printf("helloWorld");
  WiFi.begin("AndroidAP2288", "evoooooo");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.print("connected");
  // int result = myFunction(2, 3);
}

void loop()
{
  // put your main code here, to run repeatedly:
}

// put function definitions here:
int myFunction(int x, int y)
{
  return x + y;
}
