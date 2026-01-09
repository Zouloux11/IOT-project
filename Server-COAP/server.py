import asyncio
import aiocoap.resource as resource
import aiocoap

class PingResource(resource.Resource):
    async def render_put(self, request):
        payload = request.payload.decode('utf-8')
        print(f"[PUT /ping] Reçu: {payload}")
        print(f"[FROM] {request.remote}")
        return aiocoap.Message(code=aiocoap.CHANGED, payload=b"Pong recu!")

async def main():
    root = resource.Site()
    root.add_resource(['ping'], PingResource())
    
    SERVER_IP = '192.168.52.241'
    SERVER_PORT = 4832
    
    await aiocoap.Context.create_server_context(root, bind=(SERVER_IP, SERVER_PORT))
    
    print(f"Serveur CoAP démarré sur {SERVER_IP}:{SERVER_PORT}")
    print("En attente de messages...")
    
    await asyncio.get_running_loop().create_future()

if __name__ == "__main__":
    asyncio.run(main())