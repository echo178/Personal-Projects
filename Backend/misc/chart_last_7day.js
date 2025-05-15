import mongodb from "mongodb";
import dotenv from 'dotenv'
import generateChartDataURL from "../marketingAPI/generateChart.js";
import axios from "axios";
import { JSDOM } from "jsdom";
import getGlobalChart, { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()


let last_7_day_dateObj = new Date()
last_7_day_dateObj.setUTCDate(new Date().getUTCDate() - 7)



let last_7_day_searchObj = {
    year : last_7_day_dateObj.getUTCFullYear(),
    month : last_7_day_dateObj.getUTCMonth() + 1,
    day : last_7_day_dateObj.getUTCDate()
}



let new_circleChart_prev_7 = await db.collection('circleChart_Rank').aggregate(
    [
        {
            $match: {
                $expr: {
                    $and:[
                        {$eq:[{$first: "$Rank.year"},last_7_day_searchObj.year]},
                        {$eq:[{$first: "$Rank.month"},last_7_day_searchObj.month]},
                        {$gt:[{$first:"$Rank.day"},last_7_day_searchObj.day]}
                    ]
                }
            }
        },
    ]
).toArray()

console.log(new_circleChart_prev_7[0])
/*
let new_naverChart_prev_7= await db.collection('naverChart').aggregate(
    [
        {
            $addFields: { 
              compareDate : {
                $dateFromString :{
                  dateString : {$substr :[{$arrayElemAt : [{$first: "$Rank" },0]},0,24]} ,  
              }   
            }
            }
        },
        {
            $match : {
              compareDate : {
                $gt : last_7_day_dateObj
              }
            }
        },
        {
            $project:{
                Rank: 0
            }
        }
    ]
).toArray()

let new_melonChart_prev_7 = await db.collection('melonChart').aggregate(
   
        [
            {
                $addFields: { 
                  compareDate : {
                    $dateFromString :{
                      dateString : {$substr :[{$arrayElemAt : [{$first: "$순위" },0]},0,24]} ,  
                  }   
                }
                }
            },
            {
                $match : {
                  compareDate : {
                    $gt : last_7_day_dateObj
                  }
                }
            },
            {
                $project:{
                    compareDate: 0
                }
            }
        ]
).toArray()
*/
client.close()