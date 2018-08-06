// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

// The device connection string to authenticate the device with your IoT hub.
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application
// or use an HSM or an x509 certificate.
// https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-security
//
// Using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
var connectionString = 'HostName=mashrin.azure-devices.net;DeviceId=MyNodeDevice;SharedAccessKey=qtIzSDPyg5S7lkJ8653vtArYjLeVg3SJrVxGYhE2qcw=';

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// Print results.
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// Create a message and send it to the IoT hub every second
setInterval(function(){
  // Simulate telemetry.
  var lat = 13 + (Math.random());
  var long = 77 + (Math.random());
  var ids = ["673501","235846","572013","166924","058375"];
  var deviceid = ids[Math.floor(Math.random() * ids.length)];
  var datetime = new Date();
  var alarm = ["teasing", "harassment", "strong"]
  var alarmType = alarm[Math.floor(Math.random() * alarm.length)];

  // Add the telemetry to the message body.
  var data = JSON.stringify({ deviceid: deviceid, latitude: lat, longitude: long, time: datetime, alarmType: alarmType });
  var message = new Message(data);

  // Add a custom application property to the message.
  // An IoT hub can filter on these properties without access to the message body.
 
  console.log('Sending message: ' + message.getData());

  // Send the message.
  client.sendEvent(message, printResultFor('send'));
}, 1500);
