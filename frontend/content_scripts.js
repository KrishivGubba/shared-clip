// import MouseTrap from 'mousetrap';

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

//add event listener

// MouseTrap.bind("ctrl+q", function(e) {
//     e.preventDefault();
//     console.log("hello there q")
    // tell bg to give latest

// })

// content_scripts.js
document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key.toLowerCase() === "q") {
        console.log("heeee")
        chrome.runtime.sendMessage(
            {purpose: "req-key"},
                (response) => {
                    if (response.clips) {
                        const toBeCopied = response.clips.data[response.clips.data.length-1].data
                        navigator.clipboard.writeText(toBeCopied);
                        console.log(toBeCopied)
                    } else {
                        console.log("received no clips");
                    }
                }
        )
    }
});


console.log("bello")