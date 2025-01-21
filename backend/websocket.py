import asyncio
from websockets.asyncio.server import serve
import json
from collections import defaultdict

users = defaultdict(set)


def savetoclipboard(text):
    pass


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
            print(payload["data"])
            print(users[payload["id"]])
            print(websocket)
            for user in users[payload["id"]]:
                print(user)
                if user!=websocket:
                    try:
                        await user.send(payload["data"])
                    except:
                        print("Error in connecting to client, REMOVED.")
                        #remove faulty connection
                        # users[payload["id"]].remove(user)
            # await websocket.send("we got your message")


async def main():
    async with serve(echo, "localhost", 8765) as server:
        print("starting wbsckt server now")
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())