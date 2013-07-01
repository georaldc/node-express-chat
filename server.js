/**
 * Module dependencies
 */

var express = require("express");
var nicknames = new Array();

var app = express();
var server = app.listen(8000);
var io = require("socket.io").listen(server);

// Express setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Setup routes
app.get("/", function(req, res) {
	res.render("index");
});
app.get("/chat", function(req, res) {
	var nickname = req.param("nickname");
	
	res.render("chat", {
		"nickname": nickname,
		"chatMessages": "",
		"connectedUsers": "",
	});
});

io.sockets.on("connection", function(socket) {
	socket.on("addUser", function(nickname) {
		if (nicknames.indexOf(nickname) === -1) {
			socket.nickname = nickname;
			nicknames.push(nickname);
			socket.broadcast.emit("updateConversation", "SERVER", nickname + " has connected");
			io.sockets.emit("updateConnectedUsers", nicknames);
		} else {
			socket.emit("redirectBack");
		}
	});
	
	socket.on("sendMessage", function(nickname, message) {
		io.sockets.emit("updateConversation", nickname, message);
	});
	
	socket.on("disconnect", function() {
		if (typeof socket.nickname !== "undefined") {
			var index = nicknames.indexOf(socket.nickname);
			nicknames.splice(index, 1);
			console.log(nicknames);
			socket.broadcast.emit("updateConversation", "SERVER", socket.nickname + " has disconnected");
			io.sockets.emit("updateConnectedUsers", nicknames);
		}
	});
});