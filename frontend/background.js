//establish websocket connection and listen for data
const socket = new WebSocket('ws://localhost:8765');

//upon conn
socket.onopen = function(event) {
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
    body = {
        "id":123, //we need to get the actual id eventually
        "data":text,
        "data_type":type
    }
    socket.send(JSON.stringify(body));
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
        }
    }
);
