import asyncio
from websockets.asyncio.server import serve
import json
from collections import defaultdict
from websockets.exceptions import ConnectionClosedError  # Import the specific exception

users = defaultdict(set)

async def register(websocket, id):
    try:
        users[id].add(websocket)
        return True
    except Exception as e:
        print(f"Error occurred during registration: {str(e)}")
        return False

async def unregister(websocket, id):
    users[id].remove(websocket)
    if not users[id]: del users[id]

#TODO: maybe, if something fails here because of client error, dont use websocket to convey this, use some endpoint that will
#comm this, websocket comms are becoming very complicated

async def echo(websocket):
    async for message in websocket:
        payload = json.loads(message)
        print(payload)
        if "oldKey" in payload or "checkValid" in payload: #TODO: what is checkValid?
            try:
                print(payload)
                print(users[payload["oldKey"]])
                if  websocket in users[payload["oldKey"]]: users[payload["oldKey"]].remove(websocket)
            except Exception as e:
                print("Some error ocurred")
                print(e)
        elif "id" not in payload or "data" not in payload or "data_type"  not in payload:
            # await websocket.send("Faulty message, missing keys")
            print("Error")
        elif payload["data_type"]=="heartbeat":
            print("received heartbeat ping")
            print(f"these are your clients for key: {payload["id"]}: {users[payload["id"]]}")
            if websocket not in users[payload["id"]]:
                print("yeah not in it")
                res = await register(websocket, payload["id"])
                print(res)
        else:
            if websocket not in users[payload["id"]]:
                res = await register(websocket, payload["id"])
                if not res: continue #reg failed
            mark = []
            print("why are we not sending to everyone")
            print(users[payload["id"]])
            for user in users[payload["id"]]:
                if user!=websocket:
                    try:
                        await user.send(payload["data"])
                        print("sent some data")
                    except Exception as e:
                        mark.append(user)
            #cleanup
            for thing in mark:
                users[payload["id"]].remove(thing)

async def main():
    async with serve(echo, "0.0.0.0", 8765) as server:
        print("starting wbsckt server now")
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())