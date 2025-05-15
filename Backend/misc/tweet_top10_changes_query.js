import mongodb from "mongodb";
import dotenv from 'dotenv'
import { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()


const last_n_hour = 1
let naverChartQuery_RankAchievements = await db.collection('naverChart').aggregate(
    [    
        {
            $addFields: { 
              compareDate : {
                $dateFromString :{
                  dateString : {$substr :[{$arrayElemAt : [{$last: "$Rank" },0]},0,24]} ,  
                    }    
                },
               
            }
        },
        {
            $match : {
              compareDate : {
                $gte : new Date(new Date().getTime() - 1000 * 60 * 60 * last_n_hour)
              }
            }
        },
        {
            $addFields: {
                prevRank:{
                    $arrayElemAt : [{$arrayElemAt:[ "$Rank",-10] },1]
                },
                currRank:{
                    $arrayElemAt : [{$arrayElemAt:[ "$Rank",-1] },1]
                }, 
                allTimeHigh :{
                    $min: {
                        $map: {
                            input: {$slice: ["$Rank",  { "$subtract": [ { $size: "$Rank" }, 1] }]},
                            as : 'rankObj',
                            in : {$arrayElemAt : ['$$rankObj',1]}
                        }
                    }
                }
            }
        },
        {
            $project: {
              Rank:0
            }
        },
        {
            $addFields: {
                rankDiff: {$subtract: ['$prevRank','$currRank']},
                allTimeHighAchievement : { $lt : ['$currRank','$allTimeHigh']}
            }
        },
        {
            $match: {               
                achievement: true    
            }
        },
        
    ]
).toArray()

let melonChartQuery_RankAchievements = await db.collection('melonChart').aggregate(
    [    
        {
            $addFields: { 
              compareDate : {
                $dateFromString :{
                  dateString : {$substr :[{$arrayElemAt : [{$last: "$순위" },0]},0,24]} ,  
                    }    
                },
               
            }
        },
        {
            $match : {
              compareDate : {
                $gte : new Date(new Date().getTime() - 1000 * 60 * 60 * last_n_hour)
              }
            }
        },
        {
            $addFields: {
                prevRank:{
                    $toInt: {$arrayElemAt : [{$arrayElemAt:[ "$순위",-10] },1]}
                },
                currRank:{
                    $toInt: {$arrayElemAt : [{$arrayElemAt:[ "$순위",-1] },1]}
                }, 
                allTimeHigh :{
                    $min: {
                        $map: {
                            input: {$slice: ["$순위",  { "$subtract": [ { $size: "$순위" }, 1] }]},
                            as : 'rankObj',
                            in : {$toInt :{$arrayElemAt : ['$$rankObj',1]}}
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id:0,
                순위:0,
                좋아요:0
            }
        },
        {
            $addFields: {
                rankDiff: {$subtract: ['$prevRank','$currRank']},
                allTimeHighAchievement : { $lt : ['$currRank','$allTimeHigh']}
            }
        },
        {
            $match: {               
                allTimeHighAchievement : true
            }
        },
        
    ]
).toArray()

let circleChart_latestDateObj = await checkGlobalDate()

let circleChart_RankAchievements = await db.collection('circleChart_Rank').aggregate(
    [    
        {
            $match:{
                "Rank":    {
                    $elemMatch:circleChart_latestDateObj   
                }
            }
        },
        {
            $addFields: {
                prevRank: {$arrayElemAt:[ "$Rank.Rank",-10] },
                currRank: {$arrayElemAt:[ "$Rank.Rank",-1] }, 
                allTimeHigh :{
                    $min: '$Rank.Rank'
                }
            }
        },
        {
            $project: {
                _id:0,
                Rank:0
            }
        },
        {
            $addFields: {
                rankDiff: {$subtract: ['$prevRank','$currRank']},
                allTimeHighAchievement : { $lt : ['$currRank','$allTimeHigh']},
                Source: 'CircleChart'
            }
        },
        {
            $match: {               
                achievement: true    
            }
        },
        
    ]
).toArray()


client.close()