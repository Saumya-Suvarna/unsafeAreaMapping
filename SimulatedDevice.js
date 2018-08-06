'use strict';
var connectionString = 'connection string';
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

setInterval(function(){
 
  var lat = 13 + (Math.random());
  var long = 77 + (Math.random());
  var ids = ["673501","235846","572013","166924","058375"];
  var deviceid = ids[Math.floor(Math.random() * ids.length)];
  var datetime = new Date();
  var alarm = ["teasing", "harassment", "strong"]
  var alarmType = alarm[Math.floor(Math.random() * alarm.length)];

  var data = JSON.stringify({ deviceid: deviceid, latitude: lat, longitude: long, time: datetime, alarmType: alarmType });
  var message = new Message(data);

  console.log('Sending message: ' + message.getData());

  client.sendEvent(message, printResultFor('send'));
}, 1500);
