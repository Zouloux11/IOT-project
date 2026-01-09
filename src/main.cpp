#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <coap-simple.h>

WiFiUDP Udp;
int localUdpPort = 4832;

void COAPResponse(CoapPacket &packet, IPAddress ip, int port);

void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port);

Coap coap(Udp);

void sendTemp()
{
  int id = coap.put(IPAddress(192, 168, 52, 241), 4832, "ping", "Je te pong");
}

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

  Udp.begin(localUdpPort);
  Serial.print("UDPBeginned");
  coap.start(localUdpPort);
  coap.server(myCOAPCallback, "ac/n02");
  Serial.print("Coaped");

  coap.response(COAPResponse);
  Serial.print("coap started");

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
}

void loop()
{
  coap.loop();
  delay(5000);
  sendTemp();
  Serial.print("messageenoyed");
  Serial.println(WiFi.localIP());
}

void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("myCOAPCallback UwU");

  // if (packet.payloadlen > 0)
  // {
  //   char firstChar = (char)packet.payload[0];

  //   if (firstChar == '1')
  //   {
  //     digitalWrite(LED_BUILTIN, LOW);
  //   }
  //   else if (firstChar == '0')
  //   {
  //     digitalWrite(LED_BUILTIN, HIGH);
  //   }
  // }
}

void COAPResponse(CoapPacket &packet, IPAddress ip, int port)
{
  Serial.println("Received CoAP response");
}
