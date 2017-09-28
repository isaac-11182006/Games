var nofityTimer = null;
var isTitleShowing = true;
var isAnimating = false;

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
	if(!isAnimating){
		isAnimating = true;
		pulsateTitle(message, defaultTitle)
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
			console.log(message);
		} else {
			isTitleShowing = true;
			document.title = defaultTitle;
			console.log(defaultTitle);
		}
	}

}