#from bson import ObjectId # For ObjectId to work
from pymongo import MongoClient
import pandas as pd
client = MongoClient("mongodb://mashrin:5qGpAeDLvL2ORNEbfPuMUE2XOBblo2nXngtZ4ZuP3ERGc9kn4x3mxs3dEmB4F47Ebre7RPaRgKpHZXhW9BhrmA==@mashrin.documents.azure.com:10255/?ssl=true&replicaSet=globaldb") #host uri
db = client.database_spektro    #Select the database
db.authenticate(name="mashrin",password='5qGpAeDLvL2ORNEbfPuMUE2XOBblo2nXngtZ4ZuP3ERGc9kn4x3mxs3dEmB4F47Ebre7RPaRgKpHZXhW9BhrmA==')
data = pd.DataFrame(columns=['longitude','deviceid','_id','latitude','time'])

collection = db.simulator
cursor = collection.find({})
for document in cursor:
    index = [0]
    data2 = pd.DataFrame(document, index=index)
    data= data.append(data2, ignore_index=True)
