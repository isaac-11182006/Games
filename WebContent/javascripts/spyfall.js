var defaultTitle = document.title;

var url = window.location.href;

var name = url.split("?")[1];

var Chat = {};

Chat.socket = null;

var chatHistory = [];
var chatHistoryCursor;

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
		Console.log('Info: WebSocket connection opened.');
		document.getElementById('chat').onkeydown = function(event) {
			if (event.keyCode == 13) {
				Chat.sendMessage();
			}
			try {
				if (event.keyCode == 38 || event.keyCode == 40) {
					if(chatHistory[chatHistoryCursor])
						document.getElementById('chat').value = chatHistory[chatHistoryCursor];
					if (event.keyCode == 38) //up button
						chatHistoryCursor--;
					if (event.keyCode == 40) //down button 
						chatHistoryCursor++;
					
					if(chatHistoryCursor == 0)
						chatHistoryCursor = chatHistory.length - 1;
					if(chatHistoryCursor == chatHistory.length)
						chatHistoryCursor = 0;
				}
			} catch (e) {
				chatHistoryCursor = chatHistory.length - 1;
			}
			
		};
		initGameButtons();
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

Chat.sendMessage = (function() {
	var message = document.getElementById('chat').value;
	if (message != '') {
		chatHistory.push(message);
		chatHistoryCursor = chatHistory.length - 1;
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
	notify(message, defaultTitle);
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

function initGameButtons(){
	var menu = document.getElementById("game-buttons");
	menu.appendChild(createActionButton("Start Game", "startGame()", "-start"));
	menu.appendChild(createActionButton("Clear", "clear()", "-cls"));
	menu.appendChild(createActionButton("Show Online Players", "showPlayers()", "-players"));
}

function initGameSettings(){
	var settings = document.getElementById("game-settings");
}

function createActionButton(value, onclickFunction, title){
	var button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", value);
	button.setAttribute("title", title);
	button.setAttribute("onclick", onclickFunction);
	return button;
}

function startGame(){
	Chat.socket.send("-start");
}

function clear() {
	var console = document.getElementById('console');
	console.innerHTML = "";
}

function showPlayers(){
	Chat.socket.send("-players");
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
