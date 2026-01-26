import asyncio
import aiocoap.resource as resource
import aiocoap
import aiohttp
import json

API_BASE_URL = "https://api.loiccapdeville.fr/api/sensormanager"
ARDUINO_IP = "192.168.40.46"
ARDUINO_PORT = 5683

POLL_INTERVAL = 5

last_alert_ids = {
    "distance": None,
    "microphone": None,
    "motion": None
}

class SensorResource(resource.Resource):
    
    def __init__(self, sensor_type):
        super().__init__()
        self.sensor_type = sensor_type
    
    async def render_put(self, request):
        payload = request.payload.decode('utf-8')
        print(f"[{self.sensor_type}] Received: {payload}")
        
        try:
            data = json.loads(payload)
            device_id = data.get('deviceId', 'UNKNOWN')
            value = data.get('value')
            
            print(f"[{self.sensor_type}] Device: {device_id}, Value: {value}")
            
        except json.JSONDecodeError:
            print(f"[ERROR] Invalid JSON")
            return aiocoap.Message(code=aiocoap.BAD_REQUEST, payload=b"Invalid JSON")
        
        api_data = self._prepare_data(device_id, value)
        asyncio.create_task(self._send_to_api(api_data))
        
        return aiocoap.Message(code=aiocoap.CHANGED, payload=b"OK")
    
    def _prepare_data(self, device_id, value):
        try:
            if self.sensor_type == "distance":
                return {"deviceId": device_id, "distanceCm": float(value)}
            elif self.sensor_type == "microphone":
                return {"deviceId": device_id, "decibels": float(value)}
            elif self.sensor_type == "motion":
                return {"deviceId": device_id, "motionDetected": str(value).lower() in ["1", "true", "yes"]}
        except (ValueError, TypeError) as e:
            print(f"[ERROR] {e}")
            return None
    
    async def _send_to_api(self, data):
        if data is None:
            return False
        
        url = f"{API_BASE_URL}/sensor/{self.sensor_type}/record"
        print(f"[API] POST {url}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=data,
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get('alert'):
                            print(f"[ALERT] {result.get('message')}")
                        return True
                    else:
                        print(f"[API] Error {response.status}")
                        return False
        except Exception as e:
            print(f"[ERROR] {e}")
            return False


async def fetch_alerts(sensor_type):
    url = f"{API_BASE_URL}/alerts/{sensor_type}/get"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"[POLL] Error {response.status} for {sensor_type}")
                    return []
    except Exception as e:
        print(f"[POLL ERROR] {sensor_type}: {e}")
        return []


async def send_alert_to_arduino(sensor_type, alert_data):
    protocol = await aiocoap.Context.create_client_context()
    
    endpoint = f"coap://{ARDUINO_IP}:{ARDUINO_PORT}/alert"
    
    payload = json.dumps({
        "type": sensor_type,
        "alert": alert_data
    }).encode('utf-8')
    
    request = aiocoap.Message(code=aiocoap.PUT, payload=payload, uri=endpoint)
    
    try:
        response = await protocol.request(request).response
        print(f"[ARDUINO] Alert sent for {sensor_type}: {response.code}")
    except Exception as e:
        print(f"[ARDUINO ERROR] {e}")


async def poll_alerts():
    global last_alert_ids
    
    while True:
        for sensor_type in ["distance", "microphone", "motion"]:
            alerts = await fetch_alerts(sensor_type)
            
            if alerts and len(alerts) > 0:
                latest_alert = alerts[0]
                latest_id = latest_alert.get("id")
                
                if last_alert_ids[sensor_type] != latest_id:
                    print(f"[NEW ALERT] {sensor_type} - ID: {latest_id}")
                    last_alert_ids[sensor_type] = latest_id
                    await send_alert_to_arduino(sensor_type, latest_alert)
        
        await asyncio.sleep(POLL_INTERVAL)


async def main():
    root = resource.Site()
    
    root.add_resource(['distance'], SensorResource('distance'))
    root.add_resource(['microphone'], SensorResource('microphone'))
    root.add_resource(['motion'], SensorResource('motion'))
    
    SERVER_IP = '192.168.40.241'
    SERVER_PORT = 4832
    
    await aiocoap.Context.create_server_context(root, bind=(SERVER_IP, SERVER_PORT))
    
    print(f"CoAP server: {SERVER_IP}:{SERVER_PORT}")
    print(f"API: {API_BASE_URL}")
    print(f"Arduino: {ARDUINO_IP}:{ARDUINO_PORT}")
    print(f"Listening...")
    
    asyncio.create_task(poll_alerts())
    
    await asyncio.get_running_loop().create_future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Shutdown")