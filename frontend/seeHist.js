function injectIntoDiv(data) {
    const insertInto = document.getElementById("thing");

    if (!insertInto) {
        console.error("history-container not found in the DOM.");
        return;
    }

    for (let i = data.length - 1; i >= 0; i--) {
        let toInsert = document.createElement("div");
        toInsert.className = "clipboard-item";

        let contentDiv = document.createElement("div");
        contentDiv.className = "content";
        contentDiv.textContent = data[i]["data"] || "No content available"; // Default fallback

        let button = document.createElement("button");
        button.className = "button";
        button.textContent = "Action"; // Add text to button

        toInsert.appendChild(contentDiv);
        toInsert.appendChild(button);

        insertInto.appendChild(toInsert);
    }
}



function getHistory(){
    //make request to bg.js to get key
    chrome.runtime.sendMessage(
        {
            purpose:"req-key"
        }, (response) => {
            console.log(response)
            console.log(Object.keys(response));  // See available keys in response
            //response.data, 
            //each elem: data, data_type, timestamp, userId, 
            console.log(response.clips.data);
            if (response.clips){
                injectIntoDiv(response.clips.data);
            }else{
                console.log("Some Error ocurred, there is nothing to dis")
            }

        }
    )
}
console.log("sending message")
getHistory()