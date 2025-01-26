function getHistory(){
    //make request to bg.js to get key
    chrome.runtime.sendMessage(
        {
            purpose:"req-key"
        }, (response) => {
            console.log(response)
        }
    )
}
console.log("sending message")
getHistory()