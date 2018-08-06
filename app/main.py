# -*- coding: utf-8 -*-

import pandas as pd
from shapely.geometry import Point, shape
from flask import Flask
from flask import render_template
from flask import request
import urllib.request, json
from pandas.io.json import json_normalize
from pymongo import MongoClient

data_path = './input/'

def get_hour_segment(hour):
    if hour >= 0 and hour < 6:
        return '00-06'
    elif hour >= 6 and hour < 12:
        return '06-12'
    elif hour >= 12 and hour < 18:
        return '12-18'
    else:
        return '18-24'

def get_location_state(longitude, latitude, polygons_state):

    point = Point(longitude, latitude)
    for polygon in polygons_state:
        if polygon[0].contains(point):
            return polygon[1]
    return 'other'

def generate_polygon_state(provinces_json):
    polygons_state = []
    for record in provinces_json['features']:
        polygon = shape(record['geometry'])
        polygons_state.append([polygon,record['properties']['NAME_1']])
    return polygons_state


def get_location_city(longitude, latitude, polygons_city):

    point = Point(longitude, latitude)
    for polygon in polygons_city:
        if polygon[0].contains(point):
            return polygon[1]
    return 'other'

def generate_polygon_city(provinces_json):
    polygons_city = []
    for record in provinces_json['features']:
        polygon = shape(record['geometry'])
        polygons_city.append([polygon,record['properties']['NAME_2']])
    return polygons_city

with open('./input/geojson/india.json') as data_file:    
    provinces_json = json.load(data_file)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/queryByDate", methods=['GET','POST'])
def queryByDate():
    #startDate='03-07-2018'
    #endDate='04-07-2018'
    if request.method == "POST":
        startDate = request.form["startDate"]
        endDate = request.form["endDate"]
    client = MongoClient("mongodb://mashrin:sIuOB86DN3t0A3nZmNnIYE0pfyrdSVW5UewH3qI4kJfZBv6t3RNd9BhQG9F2vMpi4H44fSXu5DjmEC4ySe6hVw==@mashrin.documents.azure.com:10255/?ssl=true&replicaSet=globaldb") #host uri
    db = client.database_spektro    #Select the database
    db.authenticate(name="mashrin",password='sIuOB86DN3t0A3nZmNnIYE0pfyrdSVW5UewH3qI4kJfZBv6t3RNd9BhQG9F2vMpi4H44fSXu5DjmEC4ySe6hVw==')
    df = pd.DataFrame(columns=['longitude','deviceid','_id','latitude','time','alarmType'])

    collection = db.simulator
    cursor = collection.find({})
    for document in cursor:
        index = [0]
        data2 = pd.DataFrame(document, index=index)
        df= df.append(data2, ignore_index=True)

    #print (df)
    df.columns = df.columns.map(lambda x: x.split(".")[-1])
    #print (df)
    df['time_datetime']= pd.to_datetime(df['time'])
    df['time']=df['time_datetime'].dt.tz_localize('UTC').dt.tz_convert('Asia/Hong_Kong')
    df['day'] = df['time'].dt.weekday_name
    df['hour'] = df['time'].dt.hour.apply(lambda hour: get_hour_segment(hour))
    df['latitude']=pd.to_numeric(df['latitude']) 
    df['longitude']=pd.to_numeric(df['longitude']) 
    polygons_state = generate_polygon_state(provinces_json)
    df['location_state'] = df.apply(lambda row: get_location_state(row['longitude'], row['latitude'],polygons_state), axis=1)
    polygons_city = generate_polygon_city(provinces_json)
    df['location_city'] = df.apply(lambda row: get_location_city(row['longitude'], row['latitude'],polygons_city), axis=1)    #df = pd.read_csv('full_data.csv')
    cols_to_keep = ['longitude','deviceid','latitude','time','day', 'hour','location_state','alarmType','location_city']
    #cols_to_keep = ['longitude', 'latitude', 'deviceCode', 'location']
    df_clean = df[cols_to_keep].dropna()
    #    cols_to_keep2 = ['timestamp', 'day', 'hour', 'alarmType']
    #    df_clean2 = df[cols_to_keep2].dropna()
    df_clean.to_csv('full_data_new.csv')
    #print(df_clean)
    return df_clean.to_json(orient='records')

if __name__ == "__main__":
    app.run()
