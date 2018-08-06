# Unsafe Area Mapping
Code Repo for unsafe area mapping as part of Azure Iot hackathon


#### Iot hub
We have simulated the Iot hub using node.js. The modified code that we have used to simulate the device is given in the file SimulatedDevice.js

#### Function App
The function app has been coded in C# and the modified code is given below
```
using System;
using System.Runtime.Serialization;
using System.ServiceModel.Description;
using MongoDB.Bson.IO;
using MongoDB.Bson;
using MongoDB;
using MongoDB.Driver;
using System.Security.Authentication;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public static void Run(string myIoTHubMessage, TraceWriter log)
{
log.Info($"C# IoT Hub trigger function processed a message: {myIoTHubMessage}");
string deviceid="",latitude="", longitude="", time="", alarmType="";
var raw_obj=JObject.Parse(myIoTHubMessage);
deviceid=(string)raw_obj["deviceid"];
latitude=(string)raw_obj["latitude"];
longitude=(string)raw_obj["longitude"];
time=(string)raw_obj["time"];
alarmType=(string)raw_obj["alarmType"];
Cosmos cosmos= new Cosmos(deviceid,latitude,longitude,time,alarmType);
cosmos.pushData();
}

//CosmosDB class
public class Cosmos
{
string deviceid="",latitude="", longitude="", time="",alarmType="";
public BsonDocument document = new BsonDocument();
public Cosmos(string deviceid, string latitude, string longitude, string time, string alarmType )
{
this.deviceid=deviceid;
this.latitude=latitude;
this.longitude=longitude;
this.time=time;
this.alarmType=alarmType;
}
public void pushData()
{
MainAsync().Wait();
}
public async Task MainAsync()
{
string connectionString = 
@"mongodb://mashrin:sIuOB86DN3t0A3nZmNnIYE0pfyrdSVW5UewH3qI4kJfZBv6t3RNd9BhQG9F2vMpi4H44fSXu5DjmEC4ySe6hVw==@mashrin.documents.azure.com:10255/?ssl=true&replicaSet=globaldb";
MongoClientSettings settings = MongoClientSettings.FromUrl(new MongoUrl(connectionString));
settings.SslSettings = new SslSettings() { EnabledSslProtocols = SslProtocols.Tls12};
var mongoClient = new MongoClient(settings);
IMongoDatabase db = mongoClient.GetDatabase("database_spektro");
var icollection = db.GetCollection<BsonDocument>("simulator");

document.Add("deviceid",deviceid);
document.Add("latitude",latitude);
document.Add("longitude",longitude);
document.Add("time",time);
document.Add("alarmType",alarmType);
await icollection.InsertOneAsync(document);
}

}
```
The files to be included are 
```
{
  "frameworks": {
    "net46":{
      "dependencies": {
        "Newtonsoft.Json": "10.0.3",
        "System.ServiceModel.Primitives":"4.4.0",
        "MongoDB.Bson": "2.4.0",
        "MongoDB.Driver": "2.4.0",
        "MongoDB.Driver.Core": "2.4.0"
      }
    }
   }
}
```

#### CosmosDB
Cosmos db has been used to process the data and the database name, the collection name, connection string, name and password has to be changed in main.py.

####WebApp
The web app has been deployed on a linux system using docker. the docker file is in the repo.

