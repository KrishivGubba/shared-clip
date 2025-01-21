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
console.log("bello")