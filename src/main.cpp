#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <coap-simple.h>
#include <HCSR04.h>
#include <AudioOutputI2S.h>
#include <AudioGeneratorWAV.h>
#include <AudioFileSourcePROGMEM.h>

const byte triggerPin = D1;
const byte echoPin = D2;
const byte motionPin = D3;
const byte microphonePin = A0;

UltraSonicDistanceSensor distanceSensor(triggerPin, echoPin);

WiFiUDP Udp;
int localUdpPort = 4832;

AudioOutputI2S *out;
AudioGeneratorWAV *wav;

const unsigned char beepWav[] PROGMEM = {
    0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
    0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
    0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x08, 0x00, 0x00};

void playBeep()
{
  out->begin();

  int sampleRate = 22050;
  int frequency = 1000;
  int duration = 200;
  int numSamples = (sampleRate * duration) / 1000;

  for (int i = 0; i < numSamples; i++)
  {
    int16_t sample = sin(2 * PI * frequency * i / sampleRate) * 32767 * 0.5;
    out->ConsumeSample((int16_t[2]){sample, sample});
  }

  out->stop();
}
void COAPResponse(CoapPacket &packet, IPAddress ip, int port);
void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port);

Coap coap(Udp);

float readMicrophoneDB()
{
  const int sampleWindow = 50;
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

  if (peakToPeak < 10)
  {
    return 0.0;
  }

  double volts = (peakToPeak * 3.3) / 1024.0;
  double db = 20 * log10(volts / 0.00631);

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
  coap.put(IPAddress(192, 168, 40, 241), 4832, "distance", payload.c_str());
}

void sendMotion()
{
  int motion = digitalRead(motionPin);
  String motionStr = (motion == HIGH) ? "true" : "false";
  String payload = "{\"deviceId\":\"ESP_004\",\"value\":" + motionStr + "}";
  Serial.print("Sending: ");
  Serial.println(payload);
  coap.put(IPAddress(192, 168, 40, 241), 4832, "motion", payload.c_str());
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
  coap.put(IPAddress(192, 168, 40, 241), 4832, "microphone", payload.c_str());
}

void setup()
{
  Serial.begin(115200);
  delay(2000);
  Serial.println("\nStarting...");

  out = new AudioOutputI2S();
  out->SetPinout(15, 2, 3);
  out->SetGain(0.5);

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
  coap.server(myCOAPCallback, "alert");
  coap.response(COAPResponse);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(motionPin, INPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  Serial.println("Ready");
  playBeep();
}

bool lastMotionState = LOW;

void loop()
{
  if (wav && wav->isRunning())
  {
    wav->loop();
  }

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
  Serial.println("Alert received!");
  playBeep();
}

void COAPResponse(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("Response received");
}