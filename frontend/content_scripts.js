// Listen for the "copy" event (this captures all copy actions, including Ctrl + C)
document.addEventListener("copy", (event) => {
    console.log("copy event detected");
    const copiedText = window.getSelection().toString();
    if (copiedText){
        chrome.runtime.sendMessage(
            {greeting: "clipboardData", copyText: copiedText},
            (response) => {
                if (response.success) {
                    console.log("Received confirmation");
                    console.log(response.data);
                } else {
                    console.log(response.error);
                }
            }
        )
    }
});



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