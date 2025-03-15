let socket = null
let isConnect = false;
let reconnectInterval = null;
// chrome.storage.local.get(["networkKey"], function(result) {
//     if (result.networkKey) {
//       wsKey = result.networkKey;
//       //we have key, now connect
//       connectWebSocket();
//     } else {
//       console.log("No network key found in storage");
//       // TODO: in case the user does not have a key, then what do you do?
//     }
// //   });

let IP = "192.168.141.1"

// console.log("background is running")
function connectWebSocket() {
    // In case the socket is already connected or connecting
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        console.log("WebSocket already connected or connecting");
        return;
    }
    
    console.log("Now connecting to the websocket server");
    // Use the global socket variable, don't redeclare with const
    socket = new WebSocket(`ws://${IP}:8765`);

    socket.onopen = function() {
        console.log("WebSocket connection established");
        isConnect = true; // Changed from isConnect to isConnected
        
        // Stop any reconnection attempts since we're connected now
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
    };
      
    socket.onclose = function(event) {
        console.log("WebSocket connection closed", event.code, event.reason);
        isConnect = false; // Changed from isConnect to isConnected
        
        // Start trying to reconnect
        if (!reconnectInterval) {
            reconnectInterval = setInterval(connectWebSocket, 5000); // Every 5 seconds
        }
    };
    
    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    socket.onmessage = function(event) {
        console.log("Received a message from the backend:", event.data);
        // sendDataToContentScript(event.data);
        setTimeout(sendDataToContentScript, 3000, event.data)
    };
}

// Move this function outside of connectWebSocket
function sendDataToContentScript(text) {
    try {
        console.log("Sending data to content script:", text);
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { purpose: 'incoming clip data', data: text }, (response) => {
                    if (response && response.success) {
                        console.log(response.message); // Success feedback
                    } else {
                        console.log(response);
                        console.error(response ? response.message : 'No response from content script.');
                    }
                });
            } else {
                console.log("No active tabs found to send message to");
            }
        });
    } catch (error) {
        console.error("Error sending data to content script:", error);
    }
}

console.log("still working")

//i think you might have to move the socket.onmessage somewhere else, it's causing issues.
// 

console.log("helloo there")
function sendToSocket(text, type){
    if (!isConnect){
        console.log("Still not connected")
        connectWebSocket(); //try to connect 
        setTimeout(() => sendToSocket(text,type), 1000)

    }
    chrome.storage.local.get(["networkKey"], function(result) {
        console.log("this is the result")
        console.log(result)
        if (result.networkKey !== undefined) {
            // The key exists
            console.log("Key value:", result.networkKey);
            body = {
                "id":result.networkKey, //we need to get the actual id eventually
                "data":text,
                "data_type":type
            }
            socket.send(JSON.stringify(body));        
        } else {
            // The key does not exist
            console.log("Key does not exist in storage.");
        }
    });
}

function keepAlive() {
    // Check connection state and reconnect if needed
    sendToSocket("blah", "heartbeat") //DONOT remove this line
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
  }

connectWebSocket()

chrome.alarms.create("myAlarm", {
    periodInMinutes:1/10
})

chrome.alarms.onAlarm.addListener(function(alarm) {
    keepAlive()
    console.log("connecting i suppose")
})

function getNetworkKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["networkKey"], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else if (result.networkKey !== undefined) {
                resolve(result.networkKey);
            } else {
                reject(new Error("networkKey not found in local storage"));
            }
        });
    });
}

async function saveClip(copyText, url, dtype){
    try{
        const key = await getNetworkKey();
        // const apiUrl = 'http://192.168.142.1:1111/saveclip';
        const data = {
        "id": key,
        "data": copyText,
        "data_type": "text"
        };

        const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        }
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            throw new Error("Response not okay! Status: " + response.status);
        }
        const responseData = await response.json();
        console.log("Response Data:", responseData);
    }catch (error){
        console.log("Some error while saving clip data", error);
    }
}

async function getAllClips(){
    try{
        const thing = await getNetworkKey();
        const params = new URLSearchParams({
            key : thing
        });
        const url = `http://${IP}:1111/fetchclip`
        const urlWithParams = `${url}?${params.toString()}`;
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const response = await fetch(urlWithParams, requestOptions);
        
        if (!response.ok) {
            throw new Error("Response not okay! Status: " + response.status);
        }
        
        const responseData = await response.json();       
        return responseData; 

    }catch (e){
        console.log("this is the error while fetching cb", e);
    }
}
    


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting === "clipboardData") { //TODO: make api call to save data
            try {
                console.log("we are on the right place")
                const copyText = request.copyText;
                sendResponse({success:"copied data successfully",data:copyText});
                sendToSocket(copyText, "text") //for now the type is just text
                //api call to svae
                saveClip(copyText, `http://${IP}:1111/saveclip`, "text"); //just text for now
            } catch{
                sendResponse({error:"was not able to access clipboard data"});
            }
        } else if (request.purpose==="new-key" || request.purpose=="join-net"){
            console.log("we are here in bg")
            try{
                //check key existence
                chrome.storage.local.get(["networkKey"], function(res) {
                    if (res.networkKey){
                        //unregister existing key conn
                        console.log("trying to unreg client first")
                        body = {
                            "oldKey" : res.networkKey
                        }
                        socket.send(JSON.stringify(body))
                    } else{
                        console.log("no networkKey found in storage")
                    }
                })
                //set new key
                chrome.storage.local.set({ networkKey: request.key }, function() {
                    console.log("Key saved successfully");    
                    chrome.storage.local.get(["networkKey"], function(result) {
                        console.log("Retrieved key:", result.networkKey);
                        sendResponse(result.networkKey); // Send the key back as the response
                    });
                });  
                //register now
                sendToSocket("New device registered", request.key);
                return true;
            }catch (e){
                console.log(e);
                sendResponse({error:"something went wrong while setting cookies"});
                console.log("badbadbad")
            }
            //send key to backend?? no.
        }else if (request.purpose === "req-key"){
            (async () => {
                try {
                    const allClips = await getAllClips(); // Wait for the function to resolve
                    console.log("These are all the clips I got:", allClips);
                    sendResponse({ clips: allClips });
                } catch (error) {
                    console.error("Error fetching clips:", error);
                    sendResponse({ error: "Failed to fetch clips" });
                }
            })();
            return true; //
        }
    }
);


//popup.js stuff

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         if (request.purpose)
//     }
// )