import mongodb from "mongodb";
import dotenv from 'dotenv'
import moment from 'moment'
import crypto from "crypto"
import { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'
import TwitterClient from '../marketingAPI/twitterClient.js'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let currYear = new Date().getUTCFullYear()

let last_n_day_dateObj = new Date()
last_n_day_dateObj.setUTCDate(new Date().getUTCDate() - 2)


let last_n_day_searchObj = {
    year : last_n_day_dateObj.getUTCFullYear(),
    month: last_n_day_dateObj.getUTCMonth()+1,
    day: last_n_day_dateObj.getUTCDate()
}

let test = await db.collection('Ktown_'+currYear).aggregate(
    [
        {
            $unwind:'$Albums'
        },
        
        {
            $lookup:{
                from : "Ktown_2022" ,
                localField : "Albums.Album",
                foreignField : "Albums.Album",
                let : {albumName : '$Albums.Album'},
                as : 'prev',
                pipeline:[
                    {
                        $unwind: '$Albums'
                    },
                    {
                        $match:{
                            $expr:{
                                 $eq: ['$Albums.Album', '$$albumName'] ,
                            }   
                            
                        }
                    },
                    
                    
                ]
            }
        },
        {
            $set : {
                    lastYearSales: {
                        $cond: {
                        if: {
                          $and: [
                            {
                              $gte: [ {$size:"$prev"}, 1 ]
                            }
                          ]
                        },
                        then: true,
                        else: false

                }
                }
            }
        },
        {
            $project :{
                prev: 0
            }
        },
        { 
            $replaceRoot: 
                { newRoot:
                    {
                        $mergeObjects: ["$$ROOT","$Albums"]
                    }
                }
        },
        {
            $project: {
              Albums: 0
            }
        },
        {
            $match:{
                $expr:{
                    $and: [
                        {$eq:["$lastYearSales",false]},
                        {$eq:[{$toInt:{$substr:[{ $arrayElemAt: ['$Sales.Today_Sales.Date', 0 ] },0,4]}},last_n_day_searchObj.year]},
                        {$gte:[{$toInt:{$substr:[{ $arrayElemAt: ['$Sales.Today_Sales.Date', 0 ] },5,2]}},last_n_day_searchObj.month]},
                        {$gte:[{$toInt:{$substr:[{ $arrayElemAt: ['$Sales.Today_Sales.Date', 0 ] },8,2]}},last_n_day_searchObj.day]},
                        
                    ]
                }
            }
        }
    ]
).toArray()
console.log(test)
console.log(test.map((obj) => {
    let albumNameOnly = obj.Album.replace(obj.Artist,'')
    albumNameOnly = albumNameOnly.substring(albumNameOnly.lastIndexOf('[')+1,albumNameOnly.lastIndexOf(']'))  + ' '+albumNameOnly.substring(albumNameOnly.lastIndexOf('(')+1,albumNameOnly.lastIndexOf(')') )
   return albumNameOnly
}))





client.close()