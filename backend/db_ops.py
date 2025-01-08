from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv


load_dotenv()
uri = os.getenv("MONGO_THING")

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
# try:
#     client.admin.command('ping')
#     print("zucc")
# except Exception as e:
#     print(e)
mydb = client["shared-clip-data"]

class DB_Ops:

    @staticmethod
    def save_clip(userid, timestamp, data, dtype):
        thisCollection = mydb["clip-data"]
        toSave = {
            "userId": userid,
            "timestamp": timestamp,
            "data": data,
            "data_type": dtype
        }
        thisCollection.insert_one(toSave)
    