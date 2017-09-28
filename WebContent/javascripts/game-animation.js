var nofityTimer = null;
var isTitleShowing = true;
var isAnimating = false;
var isSoundPlaying = false;

var visible = (function(){
	 	var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();

function notify(message, defaultTitle) {
	if(!isSoundPlaying && !visible()){
		isSoundPlaying = true;
		var pop = document.createElement("audio");
		pop.setAttribute("src", "../sounds/pop.mp3");
		pop.play();
		pop.onended = function() {
			isSoundPlaying = false;
		};
	}
	
	if(!isAnimating){
		isAnimating = true;
		pulsateTitle(message, defaultTitle);
	}
}
function pulsateTitle(message, defaultTitle) {
	if (visible()) {
		document.title = defaultTitle;
		isTitleShowing = true;
		clearTimeout(nofityTimer);
		nofityTimer = null;
		isAnimating = false;
	} else {
		nofityTimer = self.setTimeout(function() {
			pulsateTitle(message, defaultTitle);
		}, 2000);
		if (isTitleShowing) {
			isTitleShowing = false;
			document.title = message;
		} else {
			isTitleShowing = true;
			document.title = defaultTitle;
		}
		
	}

}