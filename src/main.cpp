#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <coap-simple.h>

WiFiUDP Udp;
int localUdpPort = 4832;

void COAPResponse(CoapPacket &packet, IPAddress ip, int port);

void myCOAPCallback(CoapPacket &packet, IPAddress ip, int port);


Coap coap(Udp);

void sendTemp(){
  int id = coap.put(IPAddress(10, 42, 0, 1), 4832, "temp/n02", "42");
  int id2 = coap.put(IPAddress(10, 42, 0, 183), 4832, "ac/n02", "412");

}

void setup()
{
  Serial.begin(115200);
  Serial.printf("helloWorld");

  WiFi.begin("rohan", "mkqJNZee");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.print("connected");

  Udp.begin(localUdpPort);
  Serial.print("UDPBeginned");

  coap.server(myCOAPCallback, "ac/n02");
  Serial.print("Coaped");

  coap.start();
  coap.response(COAPResponse);
  Serial.print("coap started");
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
  Serial.println("Macron EXEPLOSION");
  // Serial.println(packet.payload[0]);
}

void COAPResponse(CoapPacket &packet, IPAddress ip, int port) {
  Serial.println("Received CoAP response");
}
