function generateRandomKey(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

function dummyKey(){
    return "12223"
}

document.getElementById("newKeyButton").onclick = (e) => {
    console.log("started from")
    //generate key
    const newKey = generateRandomKey(10);
    //store key in cookie
    chrome.runtime.sendMessage({        
        purpose: "new-key",
        key: newKey
    }, (response) => {
        // console.log(response, "this is the  key in netj.s")
        document.getElementById("show-key").value = response;
    }) 
}
  