/**
 *
 *  Aqua Control for Raspberry Pi
 *
 *  Version: 1.1
 *  3/13/2018 6:00am
 */



var express = require('express'); // app server
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//io.path('/public');
//io.serveClient(true);
//io.attach(http);
const path = require('path');

var port = 3000; 

//app.use(express.static('public'))
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public')))
  

app.get('/', function(req, res){
  console.log('URL base: Incoming connection.');
  res.sendFile(__dirname + '/public/home.htm');
});

app.get('/pc', function(req, res){
  console.log('URL pc: Incoming connection.');
  res.sendFile(__dirname + '/public/homepc.htm');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });

});



io.on('disconnect', function(socket){
  console.log('a user disconnected');
});

http.listen(port, function(){
  console.log('Aqua Control listening on: ' + port);
});

module.exports = app;