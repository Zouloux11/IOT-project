#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <coap-simple.h>
#include <HCSR04.h>

const byte triggerPin = D1;
const byte echoPin = D2;
const byte motionPin = D3;
const byte microphonePin = A0;

UltraSonicDistanceSensor distanceSensor(triggerPin, echoPin);

WiFiUDP Udp;
int localUdpPort = 4832;

void COAPResponse(CoapPacket &packet, IPAddress ip, int port);
void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port);

Coap coap(Udp);

float readMicrophoneDB()
{
  const int sampleWindow = 50; // 50ms
  unsigned int sample;
  unsigned int peakToPeak = 0;
  unsigned int signalMax = 0;
  unsigned int signalMin = 1024;

  unsigned long startMillis = millis();
  while (millis() - startMillis < sampleWindow)
  {
    sample = analogRead(microphonePin);
    if (sample < 1024)
    {
      if (sample > signalMax)
      {
        signalMax = sample;
      }
      else if (sample < signalMin)
      {
        signalMin = sample;
      }
    }
  }

  peakToPeak = signalMax - signalMin;

  // Éviter les valeurs infinies
  if (peakToPeak < 10) // Seuil minimum de signal
  {
    return 0.0; // Silence
  }

  double volts = (peakToPeak * 3.3) / 1024.0;
  double db = 20 * log10(volts / 0.00631);

  // Limiter les valeurs aberrantes
  if (db < 0)
    db = 0;
  if (db > 120)
    db = 120;

  return db;
}
void sendDistance()
{
  float distance = distanceSensor.measureDistanceCm();

  String payload = "{\"deviceId\":\"ESP_002\",\"value\":" + String(distance, 2) + "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  int id = coap.put(IPAddress(192, 168, 40, 241), 4832, "distance", payload.c_str());
}

void sendMotion()
{
  int motion = digitalRead(motionPin);
  String motionStr = (motion == HIGH) ? "true" : "false";

  String payload = "{\"deviceId\":\"ESP_004\",\"value\":" + motionStr + "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  int id = coap.put(IPAddress(192, 168, 40, 241), 4832, "motion", payload.c_str());
}

void sendMicrophone()
{
  float db = readMicrophoneDB();

  Serial.print("Microphone: ");
  Serial.print(db);
  Serial.println(" dB");

  String payload = "{\"deviceId\":\"ESP_001\",\"value\":" + String(db, 2) + "}";

  Serial.print("Sending: ");
  Serial.println(payload);

  int id = coap.put(IPAddress(192, 168, 40, 241), 4832, "microphone", payload.c_str());
}

void setup()
{

  Serial.begin(115200);
  delay(2000);
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
  pinMode(motionPin, INPUT);
  digitalWrite(LED_BUILTIN, HIGH);
}

void loop()
{
  coap.loop();
  delay(200);

  int motion = digitalRead(motionPin);
  if (motion == HIGH)
  {
    Serial.println("Motion: HIGH");
    digitalWrite(LED_BUILTIN, LOW);
  }
  else
  {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println("Motion: LOW");
  }

  sendDistance();
  sendMotion();
  sendMicrophone();
}

void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("Callback");
}

void COAPResponse(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("Response received");
}