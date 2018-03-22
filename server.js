/**
 *
 *  Aqua Control for Raspberry Pi
 *
 *  Version: 1.2
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
//setup
//    1 - server not active, user is defining settings
//    0 - server is active, setup is complete

//outlet:
//    trigger - disabled, manual, schedule, sensor
//              ignored - not installed at all, so don't even look at it
//    trigger name - name of the thing that controls it
//    schedule - 24 variables that state on or off through hours 0 to 23
//    current state - on or off
//    name - text string of the device

//sensor 
//    name - text string name of the device
//    data - last stored reading

//warning
//    text - the text of the warning
//    type - 0 - none, 1 - temp low, 2 - temp high, 3 through 8 - outlet 1 to 6 failure, 9 through 12 - sensor 1 to 4 failure
//    status - disabled, enabled, ignored

global.current_time = new Date();
console.log("Current time: " + current_time.getHours() + ":" + current_time.getMinutes());

var control = {
  "sound": 0,
  "uptime": 0,
  "setup": 1,
  
  "outlet": 
  [ 
    {
      "trigger": "Ignored",
      "triggername" : "none",
      "triggersensor": 0,
      "state" : 0,
      "runtime": 3600,
      "name" : "Outlet 1",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
    "trigger": "Ignored",
    "triggername" : "none",
    "triggersensor": 0,
    "state" : 0,
    "runtime": 3600,
    "name" : "Outlet 2",
    "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "Ignored",
      "triggername" : "none",
      "triggersensor": 0,
      "state" : 0,
      "runtime": 3600,
      "name" : "Outlet 3",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "Ignored",
      "triggername" : "none",
      "triggersensor": 0,
      "state" : 0,
      "runtime": 3600,
      "name" : "Outlet 4",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "Ignored",
      "triggername" : "none",
      "triggersensor": 0,
      "state" : 0,
      "runtime": 3600,
      "name" : "Outlet 5",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
    {
      "trigger": "Ignored",
      "triggername" : "none",
      "triggersensor": 0,
      "state" : 0,
      "runtime": 3600,
      "name" : "Outlet 6",
      "sched": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    } 
  ],
  "sensor": 
  [
    {
      "name" : "Sensor 1",
      "status": "Ignored",
      "data" : 82,
      "interval": 0,
      "datatype" : "Temperature",
      "lowtrigger" : 50,
      "hightrigger" : 150
    },
    {
      "name" : "Sensor 2",
      "status": "Ignored",
      "data" : 0,
      "interval": 0,
      "datatype" : "none",
      "lowtrigger" : 0,
      "hightrigger" : 0
    },
    {
      "name" : "Sensor 3",
      "status": "Ignored",
      "data" : 0,
      "interval": 0,
      "datatype" : "none",
      "lowtrigger" : 0,
      "hightrigger" : 0
    },
    {
      "name" : "Sensor 4",
      "status": "Ignored",
      "data" : 0,
      "interval": 0,
      "datatype" : "none",
      "lowtrigger" : 0,
      "hightrigger" : 0
    }
  ],
  "warning": [{"text" : "none", "type" : 0}]
};

//setup a default config for the reset function
var default_config = control;

//console.log('Control: ');
//console.log(JSON.stringify(control));

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

app.get('/setup', function(req, res){
  console.log('URL setup: Incoming connection.');
  console.log('-----------------------------');
  
  res.sendFile(__dirname + '/public/setup.htm');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log('-----------------------------');
  io.emit('control update', control);

  socket.on('update', function(msg){
    console.log('message: ' + msg);
    console.log('-----------------------------');
    socket.emit('control update', control);
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];
    
  });

  socket.on('reset', function(msg){
    console.log('Reset requested.');
    control = default_config;
    SaveSettings();
    ScheduleCheck();
    SensorCheck();
    WarningCheck();
    socket.emit('control update', control);
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];
    
    console.log('Reset completed.');
    console.log('-----------------------------');
  });

  socket.on('control update', function(msg){
    //console.log('message: ' + msg);
    control = msg;
    console.log('Update from server rxd');
    console.log('-----------------------------');
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];
    //socket.emit('control update', control);
  });

  socket.on('setup', function(msg){
    //console.log('message: ' + msg);
    control = msg;
    console.log('Setup function called!');
    console.log('-----------------------------');
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];

    //make sure all GPIO pins get turned off
    //clear the control to defaults
    control = default_config;
    //delete the config file

    //socket.emit('control update', control);
  });

  
});

io.on('disconnect', function(socket){
  console.log('a user disconnected');
  console.log('-----------------------------');
});

function TankCheck() 
{
  console.log('Firing TankCheck.');
  console.log('-----------------------------');
  //On 0 minutes 0 seconds do a check of the system
  current_time = new Date();
  //console.log('Time within loop: ' + current_time);

  //On the hour do a check of the schedule
  if ((current_time.getMinutes() == 0) && (current_time.getSeconds() <= 9))
  {
    console.log('TankCheck: Checking schedule on the hour.');
    ScheduleCheck();
  }

  //On 30 minutes 0 seconds do a check of the system
  if ((current_time.getMinutes() == 43) && (current_time.getSeconds() <= 9))
  {
    console.log('TankCheck: Checking schedule on the 43rd minute.');
    ScheduleCheck();
  }

  //Every minute read the sensors
  //if (current_time.getSeconds() <= 9)
  //{
    console.log('TankCheck: Checking sensors on the minute.');
    SensorCheck();
    TriggerCheck();
    WarningCheck();
  //}

  console.log('Completed TankCheck.');
  console.log('-----------------------------');
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

function TriggerCheck()
{
  if (control.outlet[0].trigger == "sensor")
  {
    //compare low trigger value against data
    /*
    if (control.sensor[control.outlet[0].triggersensor].data < control.sensor[control.outlet[0].triggersensor].lowtrigger)
    {
      var msg = control.sensor[control.outlet[0].triggersensor].name + " is reporting " + control.sensor[control.outlet[0].triggersensor].datatype + " is too low!";
      var type = 1;
      var exists = false;
      for (var i = 0, len = control.warning.length; i < len; i++) {
        if (control.warning[i].type == type)
          exists = true;
      }
      if (exists == false)
        control.warning.push(msg, type);
      
    }

    //compare high trigger value against data
    if (control.sensor[control.outlet[0].triggersensor].data > control.sensor[control.outlet[0].triggersensor].hightrigger)
    {
      var msg = control.sensor[control.outlet[0].triggersensor].name + " is reporting " + control.sensor[control.outlet[0].triggersensor].datatype + " is too high!";
      var type = 2;
      var exists = false;
      for (var i = 0, len = control.warning.length; i < len; i++) {
        if (control.warning[i].type == type)
          exists = true;
      }
      if (exists == false)
        control.warning.push(msg, type);
      
    }
    */
  }
}

function ScheduleCheck()
{
  console.log('Verifying schedule...');
  var changesmade = false;

  //check outlet 1
  //update control

  //check outlet 2
  //update control

  //check outlet 3
  //update control

  //check outlet 4
  //update control

  //check outlet 5
  //update control

  //check outlet 6
  //update control

  //if a change in outlet conditions has occurred then update the web
  
  console.log('Schedule check complete.');
  console.log('-----------------------------');

}

function WarningCheck()
{
  console.log('Checking for warning conditions.');

  //check if filter has stopped working

  //check if temperature is too low
  if (control.sensor[0].data < control.sensor[0].lowtrigger)
    {
      var msg = control.sensor[0].name + " is reporting " + control.sensor[0].datatype + " is too low!";
      var temp = new Object();
      temp["text"] = msg;
      temp["type"] = 1;
      var exists = false;
      for (var i = 0, len = control.warning.length; i < len; i++) {
        if (control.warning[i].type == temp.type)
          exists = true;
      }
      if (exists == false)
        control.warning.push(temp);
      
    }

    //check if temperature is too high
    if (control.sensor[0].data > control.sensor[0].hightrigger)
    {
      var msg = control.sensor[0].name + " is reporting " + control.sensor[0].datatype + " is too high!";
      var type = 2;
      var temp = new Object();
      temp["text"] = msg;
      temp["type"] = 2;
      var exists = false;
      for (var i = 0, len = control.warning.length; i < len; i++) {
        if (control.warning[i].type == temp.type)
          exists = true;
      }
      if (exists == false)
        control.warning.push(temp);
      
    }

  

  //update warnings and send to website

  console.log('Warning check complete.');
  console.log('-----------------------------');
}

function SensorCheck()
{
  console.log('Reading sensors...');
  //check sensor 1
  if (control.sensor[0].status == "Enabled")
  {
    //read data
  }
  

  //check sensor 2
  if (control.sensor[1].status == "Enabled")
  {
    //read data
  }

  //check sensor 3
  if (control.sensor[2].status == "Enabled")
  {
    //read data
  }

  //check sensor 4
  if (control.sensor[3].status == "Enabled")
  {
    //read data
  }

  console.log('Sensor check complete.');
  console.log('-----------------------------');
}



//Setup interval functions that run on set times.
//600,000 = ten minutes
//1000 = 1 second
setInterval(TankCheck, 10000);
setInterval(SaveSettings, 600000);



http.listen(port, function(){
  console.log('Aqua Control listening on: ' + port);
  console.log('-----------------------------');
});

module.exports = app;