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
//var winston = require('winston');

var path = require('path');


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
var current_month = (current_time.getMonth() + 1);
var current_day = current_time.getDate();
var current_year = current_time.getFullYear();
console.log("Current time: " + current_time.getHours() + ":" + current_time.getMinutes());

logfile = current_month + "-" + current_day + "-" + current_year + ".log";

var winston = require('winston');
//logger.add(logger.transports.File, { filename: logfile });

var config = winston.config;
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function() {
        return Date.now();
      },
      formatter: function(options) {
        // - Return string will be passed to logger.
        // - Optionally, use options.colorize(options.level, <string>) to
        //   colorize output based on the log level.
        return options.timestamp() + ' ' +
          winston.config.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    }),
    new (winston.transports.File)({
      filename: logfile,
      timestamp: function() {
        return Date.now();
      },
      formatter: function(options) {
        // - Return string will be passed to logger.
        // - Optionally, use options.colorize(options.level, <string>) to
        //   colorize output based on the log level.
        return options.timestamp() + ' ' +
          winston.config.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })
  ]
});
//logger.add(logger.transports.Console);

logger.log('info', 'Logger started.');


//winston.add(winston.transports.File, { filename: logfile });



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

//Save the config file - REMOVE IN DEPLOYMENT!
var savefile = 0;
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
logger.log('server','Aqua Control booting...');
//console.log('-----------------------------');
//console.log('');
//console.log('-----------------------------');



try {
  var config = require('./setup.json');
}

catch(error)
{
  logger.log('error',error);
  
  control = default_config;
}

if (control.setup != 1)
{
  control = config;
  logger.log('server','Config loaded.');
  
}
else
{
  logger.log('error','Config not found.  Defaulting to Setup.');
  
}

control.uptime = current_time;

logger.log('server','Server started.');


for (i in control.outlet) {
  logger.log('server',"Outlet #" + i + " Name: " + control.outlet[i].name);
  //console.log("Outlet #" + i + " Name: " + control.outlet[i].name);
}



for (i in control.sensor) {
  logger.log('server',"Sensor #" + i + " Name: " + control.sensor[i].name);
  //console.log("Sensor #" + i + " Name: " + control.sensor[i].name);
}



Setup_Server();

//************************Application Variables Ends */



//app.use(express.static('public'))
//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/public')))
  

app.get('/', function(req, res){
  logger.log('url','URL base: Incoming connection.');
  res.sendFile(__dirname + '/public/home.htm');

});

app.get('/pc', function(req, res){
  logger.log('url','URL pc: Incoming connection.');
  
  res.sendFile(__dirname + '/public/homepc.htm');
});

app.get('/setup', function(req, res){
  logger.log('url','URL setup: Incoming connection.');
  
  res.sendFile(__dirname + '/public/setup.htm');
});

io.on('connection', function(socket){
  logger.log('socket','User connected.');
  io.emit('control update', control);

  socket.on('update', function(msg){
    logger.log('socket','Control update.');
    socket.emit('control update', control);
    if (control.warning.length > 0)
      PlaySound();
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];
    
  });

  socket.on('reset', function(msg){
    logger.log('socket','Reset requested.');
    control = default_config;
    SaveSettings();
    if (control.setup == 0)
    {
      ScheduleCheck();
      SensorCheck();
      WarningCheck();
    }
    socket.emit('control update', control);
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];
    
    logger.log('socket','Reset completed.');
    
  });

  socket.on('control update', function(msg){
    
    control = msg;
    logger.log('socket','Update from web rxd.');
    control.warning.length = 0;
    //for (var i = 0, len = control.warning.length; i < len; i++) 
    //{
    //var remove = control.warning.pop();
    //}
    control.warning = [{"text" : "none", "type": 0}];
    //socket.emit('control update', control);
  });

  socket.on('setup', function(msg){
    control = msg;
    logger.log('socket','Setup function called!');
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
  logger.log('socket','User disconnected.');
  
});

function TankCheck() 
{
  //On 0 minutes 0 seconds do a check of the system
  current_time = new Date();

  //check to see if a new logfile needs to be created
  var check_month = (current_time.getMonth() + 1);
  var check_day = current_time.getDate();
  var check_year = current_time.getFullYear();
  var datechanged = 0;

  logger.log('tankcheck',"Current time: " + current_time.getHours() + ":" + current_time.getMinutes());
  

  if (check_month != current_month)
    datechanged = 1;
  if (check_day != current_day)
    datechanged = 1;
  if (check_year != current_year)
    datechanged = 1;

  if (datechanged == 1)
  {
    current_month = check_month;
    current_day = check_day;
    current_year = check_year;
    
    logger.remove(logger.transports.File);
    logfile = current_month + "-" + current_day + "-" + current_year + ".log";
    logger.add(logger.transports.File, { filename: logfile });

    var timestamp = current_time.getFullYear() + "-" + current_time.getDate() + "-" + current_time.getFullYear() + " @ " + current_time.getHours() + ":" + current_time.getMinutes();
    logger.log('logger','New log file started.');
    

  }


  

  


  //if in setup mode, do not check anything
  if (control.setup == 1)
    return;

    logger.log('tankcheck','Firing TankCheck');
    
  //console.log('Time within loop: ' + current_time);

  //On the hour do a check of the schedule
  if ((current_time.getMinutes() == 0) && (current_time.getSeconds() <= 9))
  {
    logger.log('tankcheck','Checking schedule on the hour.');
    ScheduleCheck();
  }

  //On 30 minutes 0 seconds do a check of the system
  if ((current_time.getMinutes() == 43) && (current_time.getSeconds() <= 9))
  {
    logger.log('tankcheck','Checking schedule on the 43rd minute.');
    ScheduleCheck();
  }

  //Every minute read the sensors
  //if (current_time.getSeconds() <= 9)
  //{
    logger.log('tankcheck','Checking sensors on the minute.');
    SensorCheck();
    TriggerCheck();
    WarningCheck();
  //}

  logger.log('tankcheck','TankCheck Completed.');
  
}

//Every 10 minutes save the settings to file
function SaveSettings()
{
  logger.log('save','Saving setup.json settings.');
    fs.writeFile('setup.json', JSON.stringify(control), function (err) {
      if (err) throw err;
    });
    logger.log('save','Save complete.');
    
}

//only called on first run, sets everything up
function Setup_Server()
{
  //setup tankcheck interval
  //Setup interval functions that run on set times.
  //600,000 = ten minutes
  //1000 = 1 second
  setInterval(TankCheck, 10000);
  setInterval(SaveSettings, 600000);

  //start with sensors interval
  if (control.sensor[0].status == "Enabled")
  {
    //convert interval to ms
    var checktime = control.sensor[0].interval * 1000;
    //set interval timer
    const sensorInterval0 = setInterval(SensorCheck(0), checktime);
  }
  if (control.sensor[1].status == "Enabled")
  {
    //convert interval to ms
    var checktime = control.sensor[1].interval * 1000;
    //set interval timer
    const sensorInterval1 = setInterval(SensorCheck(0), checktime);
  }
  if (control.sensor[2].status == "Enabled")
  {
    //convert interval to ms
    var checktime = control.sensor[2].interval * 1000;
    //set interval timer
    const sensorInterval2 = setInterval(SensorCheck(0), checktime);
  }
  if (control.sensor[3].status == "Enabled")
  {
    //convert interval to ms
    var checktime = control.sensor[3].interval * 1000;
    //set interval timer
    const sensorInterval3 = setInterval(SensorCheck(0), checktime);
  }
}

function ChangeSensors()
{
  if (sensorInterval0 != NULL)
    clearInterval(sensorInterval0);
  if (sensorInterval1 != NULL)
    clearInterval(sensorInterval1);
  if (sensorInterval2 != NULL)
    clearInterval(sensorInterval2);
  if (sensorInterval3 != NULL)
    clearInterval(sensorInterval3);

    if (control.sensor[0].status == "Enabled")
    {
      //convert interval to ms
      var checktime = control.sensor[0].interval * 1000;
      //set interval timer
      const sensorInterval0 = setInterval(SensorCheck(0), checktime);
    }
    if (control.sensor[1].status == "Enabled")
    {
      //convert interval to ms
      var checktime = control.sensor[1].interval * 1000;
      //set interval timer
      const sensorInterval1 = setInterval(SensorCheck(1), checktime);
    }
    if (control.sensor[2].status == "Enabled")
    {
      //convert interval to ms
      var checktime = control.sensor[2].interval * 1000;
      //set interval timer
      const sensorInterval2 = setInterval(SensorCheck(2), checktime);
    }
    if (control.sensor[3].status == "Enabled")
    {
      //convert interval to ms
      var checktime = control.sensor[3].interval * 1000;
      //set interval timer
      const sensorInterval3 = setInterval(SensorCheck(3), checktime);
    }
}

function SensorCheck(sensor2read)
{
  //read the sensor
  logger.log('sensorcheck','Reading sensor #: ' + sensor2read);
  
}

function TriggerCheck()
{
  for (var routlet = 0; routlet < 6; routlet++)
  {
    if ((control.outlet[routlet].trigger == "sensor") && (control.outlet[routlet].status == "Enabled"))
    {
      //compare low trigger value against data
      if (control.sensor[control.outlet[routlet].triggersensor].data < control.sensor[control.outlet[routlet].triggersensor].lowtrigger)
      {
        //var msg = control.sensor[control.outlet[0].triggersensor].name + " is reporting " + control.sensor[control.outlet[0].triggersensor].datatype + " is too low!";
        //var type = 1;
        //var exists = false;
        //for (var i = 0, len = control.warning.length; i < len; i++) {
         // if (control.warning[i].type == type)
          //  exists = true;
        //}
        //if (exists == false)
         // control.warning.push(msg, type);
        
         //run the device for the specified time period

         //log the incident using winston



      }

      //compare high trigger value against data
      if (control.sensor[control.outlet[routlet].triggersensor].data > control.sensor[control.outlet[routlet].triggersensor].hightrigger)
      {
        //var msg = control.sensor[control.outlet[0].triggersensor].name + " is reporting " + control.sensor[control.outlet[0].triggersensor].datatype + " is too high!";
        //var type = 2;
        //var exists = false;
        //for (var i = 0, len = control.warning.length; i < len; i++) {
            //          if (control.warning[i].type == type)
            //exists = true;
        //}
        //if (exists == false)
          //          control.warning.push(msg, type);
        
          //run the device for the specified time period

          //log the incident using winston



      }
      
    }
  }
}

function ScheduleCheck()
{
  logger.log('schedulecheck','Verifying schedule.');
  
  global.current_time = new Date();
  var hour = current_time.getHours();
  //console.log("Current time: " + current_time.getHours() + ":" + current_time.getMinutes());

  //check outlet 1
  //update control
  if (control.outlet[0].sched[hour] == 1)
  {
    //if the pin isn't already on, turn it on
    control.outlet[0].state = 1;
  }
  if (control.outlet[0].sched[hour] == 0)
  {
    //if the pin isn't already off, turn it off
    control.outlet[0].state = 0;
  }


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
  
  logger.log('schedulecheck','Schedule check complete.');
  
}

function PlaySound()
{
  if (control.sound == 0)
    return;

  //play a two second beep



}

function WarningCheck()
{
  logger.log('warningcheck','Checking for warning conditions.');
  
  //check if filter has stopped working

  //check if sensor data is too low
  for (var rsensor = 0; rsensor < 4; rsensor++)
  {
    if (control.sensor[rsensor].status == "Enabled")
    {
      if (control.sensor[rsensor].data < control.sensor[rsensor].lowtrigger)
        {
          var msg = control.sensor[rsensor].name + " is reporting " + control.sensor[rsensor].datatype + " is too low!";
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

        //check if first sensor data is too high
        if (control.sensor[rsensor].data > control.sensor[rsensor].hightrigger)
        {
          var msg = control.sensor[rsensor].name + " is reporting " + control.sensor[rsensor].datatype + " is too high!";
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
      }
  }

  

  //update warnings and send to website

  logger.log('warningcheck','Warning check complete.');
  
}

function SensorCheck()
{
  logger.log('sensorcheck','Reading sensors.');
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

  logger.log('sensorcheck','Sensor check complete.');
  
}







http.listen(port, function(){
  logger.log('server','Aqua Control listening on: ' + port);
  
});

module.exports = app;