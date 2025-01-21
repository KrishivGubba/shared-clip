function handleCopy(event){
    if (event.ctrlKey && event.key==="c"){
        // Direct clipboard access in content script
        navigator.clipboard.readText()
        .then((text) => {
            chrome.runtime.sendMessage({greeting:"clipboardData",copyText: text}, (response) => {
                if (response.success){
                    console.log("received confirmation");
                    console.log(response.data);
                }else{
                    console.log(response.error);
                }
            })
        })
        .catch((error) => console.error("Clipboard access error:", error));

        //NEED TO SEND A MESSAGE HERE
        // chrome.runtime.sendMessage({greeting:"clipboardData"}, (response) => {
        //     console.log("got somethingb ack i sup")
        // })
    }
}

document.addEventListener("keydown", handleCopy)


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("ccsc")
        if (request.purpose === "incoming clip data") {
            try {
                const copyText = request.data;
                navigator.clipboard.writeText(copyText).then(() => {
                    sendResponse({success:"added data to clipboard successfully",data:copyText});
                  }).catch((err) => {
                    console.error('Failed to copy text to clipboard: ', err);
                  });
            } catch{
                sendResponse({error:"was not able to write to keyboard"});
            }
        }
        return true;
    }
);

console.log("bello")