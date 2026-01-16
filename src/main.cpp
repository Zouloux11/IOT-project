#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <coap-simple.h>
#include <HCSR04.h>

const byte triggerPin = 5;
const byte echoPin = 4;
const byte motionPin = 0;

UltraSonicDistanceSensor distanceSensor(triggerPin, echoPin);

WiFiUDP Udp;
int localUdpPort = 4832;

void COAPResponse(CoapPacket &packet, IPAddress ip, int port);
void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port);

Coap coap(Udp);

void sendDistance()
{
  float distance = distanceSensor.measureDistanceCm();

  String payload = "{\"deviceId\":\"ESP_002\",\"value\":" + String(distance, 2) + "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  int id = coap.put(IPAddress(192, 168, 52, 241), 4832, "distance", payload.c_str());
}

void sendMotion()
{
  int motion = digitalRead(motionPin);
  String motionStr = (motion == HIGH) ? "true" : "false";

  String payload = "{\"deviceId\":\"ESP_004\",\"value\":" + motionStr + "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  int id = coap.put(IPAddress(192, 168, 52, 241), 4832, "motion", payload.c_str());
}

void setup()
{
  Serial.begin(115200);
  delay(1000);
  Serial.println("\nStarting...");

  WiFi.begin("AndroidAP2288", "evoooooo");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  Udp.begin(localUdpPort);
  coap.start(localUdpPort);
  coap.server(myCOAPCallback, "ac/n02");
  coap.response(COAPResponse);

  Serial.println("Ready");

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
}

void loop()
{
  coap.loop();
  delay(100);
  int motion = digitalRead(motionPin);
  Serial.println(motion);
  sendDistance();
  sendMotion();
}

void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("Callback");
}

void COAPResponse(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("Response received");
}