import asyncio
from websockets.asyncio.server import serve
import json
from collections import defaultdict
from websockets.exceptions import ConnectionClosedError  # Import the specific exception

users = defaultdict(set)

async def register(websocket, id):
    try:
        users[id].add(websocket)
        await websocket.send("Successful registration")
        return True
    except Exception as e:
        print(f"Error occurred during registration: {str(e)}")
        await websocket.send("Retry registration")
        return False

async def unregister(websocket, id):
    users[id].remove(websocket)
    if not users[id]: del users[id]

async def echo(websocket):
    async for message in websocket:
        payload = json.loads(message)
        if "id" not in payload or "data" not in payload or "data_type"  not in payload:
            await websocket.send("Faulty message, missing keys")
        else:
            if websocket not in users[payload["id"]]:
                res = await register(websocket, payload["id"])
                if not res: continue #reg failed
            for user in users[payload["id"]]:
                if user!=websocket:
                    try:
                        await user.send(payload["data"])
                    except (asyncio.exceptions.CancelledError, 
                            asyncio.exceptions.InvalidStateError, 
                            ConnectionResetError, 
                            ConnectionClosedError):
                        await unregister(user, payload["id"]) #client disconnected
                    except Exception as e:
                        print("Some error: \n" + str(e))
                        await websocket.send("Some error occurred")

async def main():
    async with serve(echo, "localhost", 8765) as server:
        print("starting wbsckt server now")
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())