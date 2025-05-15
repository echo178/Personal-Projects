import Chart from 'chart.js'
import annotation from 'chartjs-plugin-annotation'
import fs from 'fs'
import generateChart from '../marketingAPI/generateChart.js'

import mongodb from "mongodb";
import dotenv from 'dotenv'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()




let databaseDataObj = {
  index: 121,
  
  group_EngFullName: 'Destiny',
  group_KRName: '데스티니',
  curr_tweetCount_total: {
    'Hours 1': 1831,
    'Hours 2': 1498,
    'Hours 3': 1563,
    'Hours 4': 1205,
    'Hours 5': 4663,
    'Hours 6': 9319,
    'Hours 7': 5556,
    'Hours 8': 5327,
    'Hours 9': 6240,
    'Hours 10': 4701,
    'Hours 11': 4754,
    'Hours 12': 85
  },
  prev_tweetCount_total: {
    'Hours 12': 1328,
    'Hours 13': 1738,
    'Hours 14': 1844,
    'Hours 15': 1955,
    'Hours 16': 1728,
    'Hours 17': 1585,
    'Hours 18': 1478,
    'Hours 19': 1302,
    'Hours 20': 1250,
    'Hours 21': 1371,
    'Hours 22': 1186,
    'Hours 23': 2470
  },
  curr_totalTweet: 48475,
  prev_totalTweet: 19235,
  tweetDifference: -29240
}

let img = generateChart(databaseDataObj,24)

var regex = /^data:.+\/(.+);base64,(.*)$/;
var buffer = Buffer.from(img, 'base64');
fs.writeFileSync('data.jpeg' , buffer);
client.close()