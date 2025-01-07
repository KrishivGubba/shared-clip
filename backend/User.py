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

class User:

    def __init__(self, id_, name, email, profile_pic):
        self.id = id_
        self.name = name
        self.email = email
        self.profile_pic = profile_pic

    @staticmethod
    def get(unique_id):
        usercollection = mydb["user_data"]
        user = usercollection.find_one({"id":unique_id})
        if user:
            userObject = User(user["id"], user["username"], user["email"], user["pic"])
            return userObject


    @staticmethod
    def create(id, username, email, pic):
        userData = {"id":id, "username":username, "email":email, "pic":pic}
        usercollection = mydb["user_data"]
        usercollection.insert_one(userData)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True 

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.id


# User.create("123", "test", "abc", "lalala")
# print(User.get("123"))