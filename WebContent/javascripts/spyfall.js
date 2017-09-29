var defaultTitle = document.title;

var url = window.location.href;

var name = url.split("?")[1];

var Chat = {};

Chat.socket = null;

var chatHistory = [];
var chatHistoryCursor;

var popSrc = "../sounds/notification/pop.mp3";

Chat.connect = (function(host) {
	if ('WebSocket' in window) {
		Chat.socket = new WebSocket(host);
	} else if ('MozWebSocket' in window) {
		Chat.socket = new MozWebSocket(host);
	} else {
		Console.log('Error: WebSocket is not supported by this browser.');
		return;
	}

	Chat.socket.onopen = function() {
		//Console.log('Info: WebSocket connection opened.');
		document.getElementById('chat').onkeydown = function(event) {
			if (event.keyCode == 13) {
				Chat.sendMessage();
			}
			try {
				if (event.keyCode == 38 || event.keyCode == 40) {
					if (chatHistory[chatHistoryCursor])
						document.getElementById('chat').value = chatHistory[chatHistoryCursor];
					if (event.keyCode == 38) // up button
						chatHistoryCursor--;
					if (event.keyCode == 40) // down button
						chatHistoryCursor++;

					if (chatHistoryCursor == 0)
						chatHistoryCursor = chatHistory.length - 1;
					if (chatHistoryCursor == chatHistory.length)
						chatHistoryCursor = 0;
				}
			} catch (e) {
				chatHistoryCursor = chatHistory.length - 1;
			}

		};
		initGame();
	};

	Chat.socket.onclose = function() {
		document.getElementById('chat').onkeydown = null;
		Console.log('Info: WebSocket closed.');
	};

	Chat.socket.onmessage = function(message) {
		Console.log(message.data);
	};
});

Chat.initialize = function() {
	if (name == 'undefined') {
		window.location = 'spyfall-register.xhtml';
	} else {
		if (window.location.protocol == 'http:') {
			Chat.connect('ws://' + window.location.host + '/Games/spyfall/'
					+ name);
		} else {
			Chat.connect('wss://' + window.location.host + '/Games/spyfall/'
					+ name);
		}
	}
};

function addChatHistory(message){
	chatHistory.push(message);
	chatHistoryCursor = chatHistory.length - 1;
}

Chat.sendMessage = (function() {
	var message = document.getElementById('chat').value;
	if (message != '') {
		addChatHistory(message);
		if (message == 'cls') {
			clear();
		} else {
			Chat.socket.send(message);
		}
		document.getElementById('chat').value = '';
	}
});

var Console = {};

Console.log = (function(message) {
	var console = document.getElementById('console');
	var p = document.createElement('p');
	p.style.wordWrap = 'break-word';
	p.innerHTML = message;
	console.appendChild(p);
	while (console.childNodes.length > 100) {
		console.removeChild(console.firstChild);
	}
	console.scrollTop = console.scrollHeight;
	//must include game-animation.js
	notify(message, defaultTitle, popSrc);
});

Chat.initialize();

document.addEventListener("DOMContentLoaded", function() {
	// Remove elements with "noscript" class - <noscript> is not allowed in
	// XHTML
	var noscripts = document.getElementsByClassName("noscript");
	for (var i = 0; i < noscripts.length; i++) {
		noscripts[i].parentNode.removeChild(noscripts[i]);
	}
	setLocations();

}, false);

function initGame() {
	initGameEmojis()
	initGameSettings();
	initGameButtons();
}

function initGameEmojis() {
	var emojis = document.getElementById("game-emojis");
	emojis.appendChild(createActionImage("../css/emoji/gun.png",
			"Chat.socket.send('-gun');addChatHistory('-gun');", "-gun", 20, 20));
}

var soundOptions = [
    {"label":"pop.mp3", "value":"../sounds/notification/pop.mp3"}, 
    {"label":"pop1.mp3", "value":"../sounds/notification/pop1.mp3"},
    {"label":"pop2.mp3", "value":"../sounds/notification/pop2.mp3"}];

function initGameSettings() {
	var settings = document.getElementById("game-settings");
	settings.append(createLabel(" Text Color : "));
	settings.append(createColorInput("changeTextColor(this.value)", "-chcolor color"));
	settings.append(createLabel(" Chat Sound : "));
	settings.append(createSelect("changeChatSound(this.value)", soundOptions, ""));
}

function initGameButtons() {
	var menu = document.getElementById("game-buttons");
	menu.appendChild(createButtonInput("Start Game", "startGame()", "-start"));
	menu.appendChild(createButtonInput("Clear", "clear()", "-cls"));
	menu.appendChild(createButtonInput("Show Online Players", "showPlayers()",
			"-players"));
}

function createLabel(text) {
	var textNode = document.createTextNode(text);
	return textNode;
}

function createButtonInput(value, onclickFunction, title) {
	var button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", value);
	button.setAttribute("title", title);
	button.setAttribute("onclick", onclickFunction);
	button.setAttribute("style", "cursor: pointer");
	return button;
}

function createColorInput(onchangeFunction, title) {
	var input = document.createElement("input");
	input.setAttribute("type", "color");
	input.setAttribute("title", title);
	input.setAttribute("onchange", onchangeFunction);
	input.setAttribute("style", "cursor: pointer");
	return input;
}

function createSelect(onchangeFunction, options, title) {
	var select = document.createElement("select");
	select.setAttribute("onchange", onchangeFunction);
	select.setAttribute("title", title);
	for(var index = 0; index < options.length ; index++){
		var option = document.createElement("option");
		option.setAttribute("value", options[index].value);
		option.appendChild(createLabel(options[index].label));
		select.appendChild(option);
	}
	return select;
}

function createActionImage(src, onclickFunction, title, width, height) {
	var image = document.createElement("img");
	image.setAttribute("src", src);
	image.setAttribute("title", title);
	image.setAttribute("onclick", onclickFunction);
	image.setAttribute("width", width);
	image.setAttribute("height", height);
	image.setAttribute("style", "cursor: pointer");
	return image;
}

function changeTextColor(color){
	Chat.socket.send("-chcolor " + color);
	addChatHistory("-chcolor " + color);
}

function changeChatSound(sound){
	popSrc = sound;
}

function startGame() {
	Chat.socket.send("-start");
	addChatHistory("-start");
}

function clear() {
	var console = document.getElementById('console');
	console.innerHTML = "";
}

function showPlayers() {
	Chat.socket.send("-players");
	addChatHistory("-players");
}

function setLocations() {
	var locations = [ "Airplane", "Beer House", "Car", "Casino", "Church",
			"Factory", "Forest", "Hospital", "Mall", "Market", "Motel", "Park",
			"Pirate Ship", "Prison", "Restaurant", "Train", "School" ];
	var content = "";
	for (var i = 0; i < locations.length; i++) {
		content = content + "<p>" + locations[i] + "</p>";
	}
	var locationsDiv = document.getElementById('locations');
	locationsDiv.innerHTML = content;
}
