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
var fs = require('fs');

const path = require('path');


//**********************Server Variables */


var port = 3000; 

//**********************Server Variables Ends*/


//************************Application Variables */

//sound
//    config setting for true/false on whether to have audible alarms
//uptime
//    setting for when the server started to display uptime

//outlet:
//    trigger type - disabled, manual, schedule, sensor
//    trigger name - name of the thing that controls it
//    schedule - 24 variables that state on or off through hours 0 to 23
//    current state - on or off
//    name - text string of the device

//sensor 
//    name - text string name of the device
//    data - last stored reading

global.current_time = new Date();
console.log("Current time: " + current_time.getHours() + ":" + current_time.getMinutes());

var control = {
  "sound": 0,
  "uptime": 0,
  
  "outlet": 
  [ 
    {
      "trigger": "manual",
      "triggername" : "none",
      "state" : 0,
      "name" : "Outlet 1",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
    "trigger": "manual",
    "triggername" : "none",
    "state" : 0,
    "name" : "Outlet 2",
    "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "manual",
      "triggername" : "none",
      "state" : 0,
      "name" : "Outlet 3",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "manual",
      "triggername" : "none",
      "state" : 0,
      "name" : "Outlet 4",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "manual",
      "triggername" : "none",
      "state" : 0,
      "name" : "Outlet 5",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "manual",
      "triggername" : "none",
      "state" : 0,
      "name" : "Outlet 6",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    } 
  ],
  "sensor": 
  [
    {
      "name" : "Float Switch",
      "data" : 82,
      "lowtrigger" : 50,
      "hightrigger" : 150
    },
    {
      "name" : "Sensor 2",
      "data" : 0,
      "lowtrigger" : 0,
      "hightrigger" : 0
    },
    {
      "name" : "Sensor 3",
      "data" : 0,
      "lowtrigger" : 0,
      "hightrigger" : 0
    },
    {
      "name" : "Sensor 4",
      "data" : 0,
      "lowtrigger" : 0,
      "hightrigger" : 0
    }
  ]
};

console.log('Control: ');
console.log(JSON.stringify(control));

//Save the config file - REMOVE IN DEPLOYMENT!
var savefile = 1;
if (savefile === 1)
{
  console.log('Creating setup.json.');
  fs.writeFileSync('setup.json', JSON.stringify(control), function (err) {
    if (err) throw err;
    console.log('Error: ' + err);
  });
  console.log('INI Saved!');
}

//Load the config file
console.log('-----------------------------');
console.log('Aqua Control booting...');
console.log('-----------------------------');

var config = require('./setup.json');
control = config;
console.log('INI Loaded.');

console.log('-----------------------------');

control.uptime = current_time;

console.log('-----------------------------');

console.log("Server start time: " + control.uptime.getHours() + ":" + control.uptime.getMinutes());

console.log('-----------------------------');

for (i in control.outlet) {
  console.log("Outlet #" + i + " Name: " + control.outlet[i].name);
}

console.log('-----------------------------');

for (i in control.sensor) {
  console.log("Sensor #" + i + " Name: " + control.sensor[i].name);
}

console.log('-----------------------------');

//console.log("Outlet 1: " + JSON.stringify(control.outlet[0].name));
//console.log("Sensor 1: " + JSON.stringify(control.sensor[0]));



//************************Application Variables Ends */



//app.use(express.static('public'))
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public')))
  

app.get('/', function(req, res){
  console.log('URL base: Incoming connection.');
  console.log('-----------------------------');
  res.sendFile(__dirname + '/public/home.htm');
});

app.get('/pc', function(req, res){
  console.log('URL pc: Incoming connection.');
  console.log('-----------------------------');
  res.sendFile(__dirname + '/public/homepc.htm');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log('-----------------------------');
  io.emit('control update', control);

  socket.on('update', function(msg){
    console.log('message: ' + msg);
    console.log('-----------------------------');
  });

  socket.on('control update', function(msg){
    //console.log('message: ' + msg);
    control = msg;
    console.log('Update from server rxd');
    console.log('-----------------------------');
    //socket.emit('control update', control);
    
  });


});



io.on('disconnect', function(socket){
  console.log('a user disconnected');
  console.log('-----------------------------');
});

function TankCheck() 
{
  //console.log('Firing TankCheck.');
  //console.log('-----------------------------');
  //On 0 minutes 0 seconds do a check of the system
  current_time = new Date();
  //console.log('Time within loop: ' + current_time);

  //On the hour do a check of the schedule
  if ((current_time.getMinutes() == 0) && (current_time.getSeconds() == 0))
  {
    console.log('Verifying schedule...');
    console.log('Schedule check complete.');
    io.emit('control update', control);
    console.log('-----------------------------');
  }

  //On 30 minutes 0 seconds do a check of the system
  if ((current_time.getMinutes() == 43) && (current_time.getSeconds() == 0))
  {
    console.log('Verifying schedule...');
    console.log('Schedule check complete.');
    io.emit('control update', control);
    console.log('-----------------------------');
  }

  //Every minute read the sensors
  if (current_time.getSeconds() == 0)
  {
    console.log('Reading sensors...');
    console.log('Sensor check complete.');
    io.emit('sensor update', { "sensor": 275});
    console.log('Checking for warning conditions.');
    console.log('Warning check complete.');
    console.log('-----------------------------');
  }

  //console.log('Completed TankCheck.');
  //console.log('-----------------------------');
}

//Every 10 minutes save the settings to file
function SaveSettings()
{
  console.log('Saving setup.json settings...');
    fs.writeFile('setup.json', JSON.stringify(control), function (err) {
      if (err) throw err;
    });
    console.log('Save complete.');
    console.log('-----------------------------');
}

setInterval(TankCheck, 1000);
setInterval(SaveSettings, 600000);



http.listen(port, function(){
  console.log('Aqua Control listening on: ' + port);
  console.log('-----------------------------');
});

module.exports = app;