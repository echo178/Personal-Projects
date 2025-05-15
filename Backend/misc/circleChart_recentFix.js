import mongodb from "mongodb";
import dotenv from 'dotenv'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let last_7_day_dateObj = new Date()
last_7_day_dateObj.setUTCDate(new Date().getUTCDate() - 3)

let last_7_day_searchObj = {
    year : last_7_day_dateObj.getUTCFullYear(),
    month : last_7_day_dateObj.getUTCMonth() + 1,
    day : last_7_day_dateObj.getUTCDate()
}

      
let circleChart_prev_7 = await db.collection('circleChart_Rank').aggregate(
  [
    {
        $match: {
            'Rank.0.year': 2023,
            'Rank.0.month' : 4,
            'Rank.0.day' :{
                $gte: 9
            }
        }   
    }
  ]
).project({'_id':0, 'Rank': 0}).toArray()
console.log(circleChart_prev_7)
client.close()