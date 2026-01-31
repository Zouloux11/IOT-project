import asyncio
import aiocoap.resource as resource
import aiocoap
import aiohttp
import json

API_BASE_URL = "https://api.loiccapdeville.fr/api/sensormanager"

http_session = None

class SensorResource(resource.Resource):
    
    def __init__(self, sensor_type):
        super().__init__()
        self.sensor_type = sensor_type
    
    async def render_put(self, request):
        try:
            data = json.loads(request.payload.decode('utf-8'))
            device_id = data.get('deviceId', 'UNKNOWN')
            value = data.get('value')
        except json.JSONDecodeError:
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
        except (ValueError, TypeError):
            return None
    
    async def _send_to_api(self, data):
        global http_session
        
        if data is None:
            return False
        
        url = f"{API_BASE_URL}/sensor/{self.sensor_type}/record"
        
        try:
            async with http_session.post(url, json=data, headers={"Content-Type": "application/json"}, timeout=aiohttp.ClientTimeout(total=3)) as response:
                return response.status == 200
        except:
            return False


async def main():
    global http_session
    
    root = resource.Site()
    
    root.add_resource(['distance'], SensorResource('distance'))
    root.add_resource(['microphone'], SensorResource('microphone'))
    root.add_resource(['motion'], SensorResource('motion'))
    
    await aiocoap.Context.create_server_context(root, bind=('192.168.40.241', 4832))
    
    http_session = aiohttp.ClientSession()
    
    print("CoAP server ready on 192.168.40.241:4832\n")
    
    await asyncio.get_running_loop().create_future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutdown")