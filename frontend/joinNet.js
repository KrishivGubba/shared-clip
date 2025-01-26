
document.getElementById("join-net").onclick = (e) => {
    console.log("Join New Button Clicked")
    const newKey = document.getElementById("input-key").value;
    if (newKey.length===0){
        document.getElementById("result").textContent = "Nonzero key length!";
    }else{
        document.getElementById("result").textContent = "";
        try{    
            chrome.runtime.sendMessage({        
                purpose: "join-net",
                key: newKey
            }, (response) => {
                // console.log(response, "this is the  key in netj.s")
                // document.getElementById("show-key").value = response;c
                console.log(response);
            }) 
        }catch (e){
            console.log("An error ocurred", e)
            document.getElementById("result").textContent = "Currently unresolveable err";
        }
    }
}