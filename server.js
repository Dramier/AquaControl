/**
 *
 *  Aquarium Controller for Raspberry Pi
 *
 *  Version: 1.0
 *  3/13/2018 6:00am
 */



var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/home.htm');
});

app.get('/pc', function(req, res){
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



http.listen(3000, function(){
  console.log('listening on *:3000');
});