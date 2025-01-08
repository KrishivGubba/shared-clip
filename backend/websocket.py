import asyncio
from websockets.asyncio.server import serve
import json
from collections import defaultdict

users = defaultdict(set)

#TODO: 6there will have to be some kind of a registration ssytem in the beginning where each device will have to ping the
#webscoket and get connected so that we can addd them to the set
async def echo(websocket):
    # users.add(websocket)
    # print(websocket)
    async for message in websocket:
        payload = json.loads(message)
        if "id" not in payload or "data" not in payload or "data_type"  not in payload:
            await websocket.send("Faulty message, missing keys")
        # for user in users:
        #     await user.send(message)
        else:
            users[payload["id"]].add(websocket)
            for user in users[payload["id"]]:
                if user!=websocket: await user.send(payload["data"])
            # await websocket.send("we got your message")


async def main():
    async with serve(echo, "localhost", 8765) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())