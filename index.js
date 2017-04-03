var req = new XMLHttpRequest();
var ik=localStorage["ikey"];
var msgid;
var gmfolder;
var concatUrl;

req.onreadystatechange = function() {
   if (req.readyState != 4)  { return; }
   if (req.status != 200)  {
     setStatus("Failed to retrieve message.");
     return;
   }
};

/*
* Main JS function invoked from the extension UI page
*/
chrome.tabs.getSelected(null, function(tab) {
    prepDown(tab.url);
});

/*
* Javascript function to get message id from URL
*/
function prepDown(url) {
	var urlErrorMessage = "This icon is to save Gmail messages. Please click on the icon only when a Gmail message is open.";
	if (url == null || url == "" || url.indexOf("mail.google.com") == -1) {
		setStatus(urlErrorMessage);
		return;
	}
	// Get mail message unique id
	var idx=url.lastIndexOf("/");
	msgid=url.substring(idx+1);
	
  //Strip characters based on url format
  if(msgid.indexOf("th=")>0){//Format th=13dad6466b0fe48e&cvid=1
	  msgid = msgid.substring(msgid.indexOf("th=")+3);
	  if(msgid.indexOf("&")>0){
	     msgid = msgid.substring(0, msgid.indexOf("&"));
	  }
	} else if(msgid.indexOf("?")>0){ //Format /13dad6466b0fe48e?compose=new
     msgid = msgid.substring(0, msgid.indexOf("?"));
	}

		
	// validate message id
	var re = new RegExp("^[A-Fa-f0-9]{16}$");
	if (!msgid.match(re)) {
		setStatus(urlErrorMessage);
		return;
	}
	// Request message content for verification
	req.open("GET", url, true);
	// Get the key for user id
	req.onload = prepUserId;
	req.send(null);
}

function setStatus(message) {
	var d = document.getElementById("statdiv");
	d.innerHTML = message;
}

/*
* Javascript function to get user unique key
*/
function prepUserId() {
	var msg = req.responseText;
	// Get GLOBALS value from message content
	var idx=msg.indexOf('GLOBALS=[');
	if (idx>0) {
		var strglbls=msg.substring(idx,idx+250);
		// Split GLOBALS value in to list using comma separator
		var glbls=strglbls.split(',');
		// Get the key for user id
		localStorage["ikey"]=glbls[9].replace(/"/g,"");
		ik=localStorage["ikey"];
		concatUrl = "https://mail.google.com" + glbls[7].replace(/"/g,"") + "/";
		// Get the message content in original format
		getGMsg();
	}
}

/*
* Javascript function to get message content in original format
*/
function getGMsg() {
	setStatus("Click on the 'Save' button to save and open the message.");
	var url = concatUrl + "?ui=2&ik=" + ik + "&view=om&th=" + msgid;
  chrome.downloads.download( {url: url, filename: msgid + ".eml"});
}
