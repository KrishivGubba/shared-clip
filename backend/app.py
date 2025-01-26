# Python standard libraries
import json
import os
import sqlite3
from User import User
# Third-party libraries
from flask import Flask, redirect, request, url_for, jsonify
from datetime import datetime
from db_ops import DB_Ops
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from oauthlib.oauth2 import WebApplicationClient
import requests
import websockets
import asyncio

# Internal imports
# from db import init_db_command
# from user import User
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)
app.secret_key = os.getenv("APP_SECRET")


login_manager = LoginManager()
login_manager.init_app(app)

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' #dont remove this

client = WebApplicationClient(GOOGLE_CLIENT_ID)

def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()

# print(get_google_provider_cfg())

@app.route("/")
def index():
    if current_user.is_authenticated:
        return f'''
        <h1>Hello, {current_user.name}!<h1>
        <img src="{current_user.profile_pic}"><br>
        <a class='button' href='/logout'>Logout</a>
        '''
    else:
        return "<a class='button' href='/login'>Google Login</a>"

@app.route("/login")
def login():
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)

@app.route("/login/callback")
def callback():
    code = request.args.get("code")
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )
    client.parse_request_body_response(json.dumps(token_response.json()))
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)
    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
        # Create a user in your db with the information provided
        # by Google
        user = User(
            id_=unique_id, name=users_name, email=users_email, profile_pic=picture
        )
        if not User.get(unique_id):
            User.create(unique_id, users_name, users_email, picture)
        login_user(user) #stores the user in the session
        print(unique_id,  users_email, picture, users_name)
        return redirect(url_for("index")) #redirects to the index page (now that they are logged in)
    else:
        return "User email not available or not verified by Google.", 400

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))

#this should have body with id, the copied data too and maybe also the dtype of the copied stuff
@app.route("/saveclip", methods=["POST"])
def save():
    # try:
        print("hi")
        req_data = request.get_json()
        print(req_data)
        #save data first
        userId, data, timestamp, dtype = req_data["id"], req_data["data"], datetime.now(), req_data["data_type"]
        DB_Ops.save_clip(userId, timestamp, data, dtype)
        return {"Success":"saved thing"}, 200

@app.route("/fetchclip", methods=["GET"])
def get():
    try:
        key = request.args.get('key')
        result = DB_Ops.get_clips(key)
        body = {
            "success":"found results",
            "data":result
        }
        return jsonify(body)
    except Exception as e:
        return jsonify({"error??":str(e)})
        



    

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1111)


#TODO: for now, just send a post request to the clipboard updation endpoint from postman or something
#then try pasting in browser, see if this works to kinda simulate multiple devices