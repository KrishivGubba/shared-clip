//establish websocket connection and listen for data
const socket = new WebSocket('ws://192.168.142.1:8765');

//upon conn
socket.onopen = function(event) {
    
    //make this some kind of test message
    const message = {
        "id":123,
        "data":"hell1",
        "data_type":"text"
    }
    socket.send(JSON.stringify(message));
    console.log("estd conn to wbsckt");
}

socket.onmessage = function(event){
    console.log("we received a message fromt the bakcend")
    console.log(event.data);
    //func to send wbsckt rcv data to cscript
    function sendData(text){
        try {
            console.log("Sending data to content script:", text);
            // chrome.runtime.sendMessage({
            //     purpose: "incoming clip data",
            //     data: text
            // }, (response) => {
            //     console.log("Response from content script:", response);
            // });

            setTimeout(() => {
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
                    }
                });
                // Your code here
            }, 5000);
        } catch (error) {
            console.error("Error sending data to content script:", error);
        }
    }
    sendData(event.data);
}

socket.onclose = function (event) {
    // Log a message when disconn
    console.log('Disconnected from WebSocket server');
};

function sendToSocket(text, type){
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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting === "clipboardData") {
            // console.log("background got something");
            // sendResponse({ response: "hihibro" });
            try {
                const copyText = request.copyText;
                sendResponse({success:"copied data successfully",data:copyText});
                //TODO: we got the text, now send it through websocket to backend
                sendToSocket(copyText, "text") //for now the type is just text
            } catch{
                sendResponse({error:"was not able to access clipboard data"});
            }
        } else if (request.purpose==="new-key" || request.purpose=="join-net"){
            //TODO: check validity in case of join-net: 
            // if (request.purpose==="join-net"){
            //     body = {
            //         "checkValid":request.key
            //     }
            //     socket.send(JSON.stringify(body))
            //     //if not pass do not execute the rest this code block
            // }
            //TODO: put the id in .env
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
        }
    }
);


//popup.js stuff

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         if (request.purpose)
//     }
// )