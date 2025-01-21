chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting === "clipboardData") {
            // console.log("background got something");
            // sendResponse({ response: "hihibro" });
            try {
                const copyText = request.copyText;
                sendResponse({success:"copied data successfully",data:copyText});
            } catch{
                sendResponse({error:"was not able to access clipboard data"});
            }
        }
    }
);
