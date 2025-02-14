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

//activeElement updation

function updateActive() {
    const elem = document.activeElement;
    console.log(elem.tagName)
    // if (activeElement && activeElement!==undefined && activeElement.)
}


// content_scripts.js
// document.addEventListener("paste", async function(event) {
        //TODO: might have to replace this with the old ctrl + q functionality

        // event.preventDefault();
        // const prevPaste = await navigator.clipboard.readText();
        // console.log(prevPaste)
        // console.log("heeee")
        // try{
        //     chrome.runtime.sendMessage(
        //         {purpose: "req-key"},
        //             (response) => {
        //                 if (response.clips) {
        //                     const toBeCopied = response.clips.data[response.clips.data.length-1].data
        //                     navigator.clipboard.writeText(toBeCopied)
        //                         .then(() => console.log("Written to pastebin ", toBeCopied))
        //                         .catch( error => {
        //                             console.error("Some error has ocurred", error);
        //                             throw new Error("Failed clipboard write");
        //                         })
        //                     console.log(toBeCopied)
        //                 } else {
        //                     console.log("received no clips");
        //                 }
        //             }
        //     )
        // }catch (error){
        //     console.error("Error ocurred, ", error)
        //     navigator.clipboard.writeText(prevPaste);
        // }
        // while(true){
        //     // updateActive()
        // }
    
// });


console.log("bello")