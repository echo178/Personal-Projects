import mongodb from "mongodb";
import dotenv from 'dotenv'
import crypto from "crypto"
import { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'
import { generateTweet_NewlyEntered, generateTweet_rankDiff, generateTweet_PeakRank} from '../marketingAPI/generateTweet_RecentData.js'
import TwitterClient from '../marketingAPI/twitterClient.js'

dotenv.config({path:"/var/app/current/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let tweetTwitterClient = new TwitterClient('POST','https://api.twitter.com/2/tweets')

let circleChart_latestDateObj = await checkGlobalDate()
let last_n_hour = 1
let rankDiff_song_of_last_n_hour = 24 * 3

let last_n_day_dateObj = new Date()
last_n_day_dateObj.setUTCDate(new Date().getUTCDate() - 5)


let last_n_day_searchObj = {
    year : last_n_day_dateObj.getUTCFullYear(),
    month: last_n_day_dateObj.getUTCMonth()+1,
    day: last_n_day_dateObj.getUTCDate()
}

let circleChart_Query = await db.collection('circleChart_Rank').aggregate(
    [
        {
            $facet: {
                    newlyEntered:[
                        {
                            $match:{
                                $and:[ 
                                    {
                                        "Rank": 
                                            {             
                                            $elemMatch:circleChart_latestDateObj
                                            }
                                    },
                                    {
                                      "Rank":{
                                          $size: 1
                                      }
                                    },

                                ] 
                            
                            }
                        },
                        {
                            $project: {
                                _id:0,
                                Artist: 1,
                                Song: 1,
                                prevRank : {$arrayElemAt: ['$Rank.Rank',0]},
                                firstDate : {$arrayElemAt: ['$Rank',0]},
                                source : 'circleChart'
                            }
                        }
                    ],
                    RankDiff :   [
                        {
                            $match:{
                                $expr:{
                                    $gt: [{$size:'$Rank'},1]
                                }
                                
                            }
                        },
                        {
                            $addFields: {
                              prevRank : {$arrayElemAt: [ "$Rank.Rank", -2 ] },
                              currRank : {$arrayElemAt: [ "$Rank.Rank", -1 ] },
                              RankDiff:{$subtract :[{$arrayElemAt: [ "$Rank.Rank", -2 ] },{$arrayElemAt: [ "$Rank.Rank", -1 ] }]},
                              firstDate : {
                                    year : {$arrayElemAt: [ "$Rank.year", 0 ] },
                                    month: {$arrayElemAt: [ "$Rank.month", 0 ] },
                                    day : {$arrayElemAt: [ "$Rank.day", 0 ]}
                              },
                              latestDate : {
                                    year : {$arrayElemAt: [ "$Rank.year", -1 ] },
                                    month: {$arrayElemAt: [ "$Rank.month", -1 ] },
                                    day : {$arrayElemAt: [ "$Rank.day", -1 ]}
                                },
                            }
                        },
                        {
                            $project:{
                                _id:0,
                                Artist:1,
                                RankDiff:1,
                                Song:1,
                                firstDate: 1,
                                latestDate: 1,
                                prevRank: 1,
                                currRank: 1
                                
                            }
                        },
                        {
                            $match:{
                                RankDiff:{
                                    $ne: 0
                                },
                                'firstDate.day': {
                                    $gte: last_n_day_searchObj.day
                                } ,
                                'firstDate.month': {
                                    $gte: last_n_day_searchObj.month
                                },
                                'firstDate.year': {
                                    $eq: last_n_day_searchObj.year
                                }
                            }
                        },
                        {
                            $group:{
                                _id:{date: "$latestDate"},
                                RankDiff : {
                                    $push:{
                                        Artist: "$Artist",
                                        RankDiff: "$RankDiff",
                                        firstDate: "$firstDate",
                                        Song: "$Song",
                                        prevRank: "$prevRank",
                                        currRank: "$currRank"
                                    }
                                }
                            }
                        },
                        {
                            $project:{
                                Date:"$_id.date",
                                RankDiff: 1,   
                                source: 'circleChart',                            
                                _id:0
                            }
                        },
                        {
                            $sort: {
                                "Date.year": -1,
                                "Date.month" : -1,
                                "Date.day" : -1
                            }
                        },
                        {
                            $limit: 1
                        }
                        
                    ],
                    peakRankAchievement :  [    
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
                        
                    ],
            }
        }
    ]
).toArray()

let naverChart_Query = await db.collection('naverChart').aggregate(
    [
        {
            $facet: {
                newlyEntered: [
                    {
                        $addFields: { 
                            compareDate : {
                                $dateFromString :{
                                    dateString : {$substr :[{$arrayElemAt : [{$arrayElemAt: [ "$Rank", 0 ] },0]},0,24]} ,  
                                }   
                            }
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
                        $project: {
                            _id:0,
                            Artist: 1,
                            Song: 1,
                            prevRank : {$arrayElemAt : [{$arrayElemAt: ['$Rank',0]},1]},
                            firstDate : {$arrayElemAt : [{$arrayElemAt: ['$Rank',0]},0]},
                            source : 'naverChart'
                        }
                    }
                ],
                RankDiff : [
                    {
                        $match:{
                            $expr:{
                                $gt: [{$size:'$Rank'},1]
                            }
                            
                        }
                    },
                    {
                        $addFields: {
                          RankDiff:{$subtract :[{$toInt: {$arrayElemAt : [{$arrayElemAt: [ "$Rank", -2 ] },1]}},{$toInt: {$arrayElemAt : [{$arrayElemAt: [ "$Rank", -1 ] },1]}}]},
                          latestDate : {$dateFromString :{ dateString: {$substr :[{$arrayElemAt : [{$arrayElemAt: [ "$Rank", 0 ] },0]},0,24]} }},
                          prevRank : {$arrayElemAt: [{$arrayElemAt: [ "$Rank", -2 ] },1]},
                          currRank : {$arrayElemAt : [{$arrayElemAt: [ "$Rank", -1 ] },1]},
                        }
                    },
                    {
                        $match : {
                            latestDate : {
                            $gte : new Date(new Date().getTime() - 1000 * 60 * 60 * rankDiff_song_of_last_n_hour)
                          }
                        }
                    },
                    {
                        $project:{
                            _id:0,
                            Artist:1,
                            RankDiff:1,
                            Song:1,
                            latestDate: 1,
                            prevRank: 1,
                            currRank: 1
                            
                        }
                    },
                    {
                        $match:{
                            RankDiff:{
                                $ne: 0
                            },
                        }
                    },
                    {
                        $group:{
                            _id:{date: "$latestDate"},
                            RankDiff : {
                                $push:{
                                    Artist: "$Artist",
                                    RankDiff: "$RankDiff",
                                    Song: "$Song",
                                    prevRank : "$prevRank",
                                    currRank: "$currRank"
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            Date:"$_id.date",
                            RankDiff: 1,
                            source: 'naverChart', 
                            _id:0
                        }
                    },
                    {
                        $sort: {
                            "Date": -1
                        }
                    },
                    {
                        $limit:1
                    }
                   
                ],
                peakRankAchievement:   [    
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
                            _id:0,
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
                    
                ],
            }
        }
    ]
).toArray()

let melonChart_Query = await db.collection('melonChart').aggregate(
    [
        {
            $facet: {
                newlyEntered: [
                    {
                      $addFields: { 
                        compareDate : {
                          $dateFromString :{
                            dateString : {$substr :[{$arrayElemAt : [{$arrayElemAt: [ "$순위", 0 ] },0]},0,24]} ,  
                        }   
                      }
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
                        $project: {
                            _id:0,
                            Artist: 1,
                            Song: 1,
                            prevRank : {$arrayElemAt : [{$arrayElemAt: ['$순위',0]},1]},
                            firstDate : {$arrayElemAt : [{$arrayElemAt: ['$순위',0]},0]},
                            source: 'melonChart'
                        }
                    }
                  
                ],
                RankDiff: [
                    {
                        $match:{
                            $expr:{
                                $gt: [{$size:'$순위'},1]
                            }
                            
                        }
                    },
                    {
                        $addFields: {
                          RankDiff:{$subtract :[{$toInt: {$arrayElemAt : [{$arrayElemAt: [ "$순위", -2 ] },1]}},{$toInt: {$arrayElemAt : [{$arrayElemAt: [ "$순위", -1 ] },1]}}]},
                          latestDate : {$dateFromString :{ dateString: {$substr :[{$arrayElemAt : [{$arrayElemAt: [ "$순위", 0 ] },0]},0,24]} }},
                          prevRank : {$arrayElemAt: [{$arrayElemAt: [ "$순위", -2 ] },1]},
                          currRank : {$arrayElemAt : [{$arrayElemAt: [ "$순위", -1 ] },1]},
                        }
                    },
                    {
                        $match : {
                            latestDate : {
                            $gte : new Date(new Date().getTime() - 1000 * 60 * 60 * rankDiff_song_of_last_n_hour)
                          }
                        }
                    },
                    {
                        $project:{
                            _id:0,
                            Artist:1,
                            RankDiff:1,
                            Song:1,
                            latestDate: 1,
                            prevRank: 1,
                            currRank: 1
                            
                        }
                    },
                    {
                        $match:{
                            RankDiff:{
                                $ne: 0
                            },
                        }
                    },
                    {
                        $group:{
                            _id:{date: "$latestDate"},
                            RankDiff : {
                                $push:{
                                    Artist: "$Artist",
                                    RankDiff: "$RankDiff",
                                    Song: "$Song",
                                    prevRank : "$prevRank",
                                    currRank: "$currRank"
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            Date:"$_id.date",
                            RankDiff: 1,
                            source: 'melonChart',                        
                            _id:0
                        }
                    },
                    {
                        $sort: {
                            "Date": -1
                        }
                    },
                    {
                        $limit:1
                    }
                   
                ],
                peakRankAchievement :  [    
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
                    
                ],
            }
        }
    ]
).toArray()


let collectionName = ['circleChart_Query','melonChart_Query','naverChart_Query']
const timeStamp = new Date()
for(let i =0; i < collectionName.length; i++){
    let currentCollection = eval(collectionName[i])
    let newlyEnteredSongData = currentCollection[0].newlyEntered
    const chunkSize = 3

    for (let i = 0; i < newlyEnteredSongData.length; i += chunkSize) {
        const newlyEntered_3Song = newlyEnteredSongData.slice(i, i + chunkSize);
        let newlyEnteredTweet = await generateTweet_NewlyEntered(newlyEntered_3Song,db)
        let newlyEnteredTweet_hash = crypto.createHash('md5').update(newlyEnteredTweet).digest('hex')
        let checkTweetExist = await db.collection('tweetCollection').countDocuments({_id: newlyEnteredTweet_hash},{limit: 1})
        if(!Boolean(checkTweetExist)){
            let newlyEnteredTweet_ID = await tweetTwitterClient.postTweet({'text' : newlyEnteredTweet})
            let Doc = {
                _id : newlyEnteredTweet_hash,
                Content : newlyEnteredTweet,
                timeStamp : timeStamp,
                tweetID : newlyEnteredTweet_ID
            
            }
            await db.collection('tweetCollection').insertOne(Doc)
        }
        
        
    }
    if(currentCollection[0].RankDiff[0] !== undefined){
        
        let rankDiffData = currentCollection[0].RankDiff[0].RankDiff
        let rankDiff_Date = currentCollection[0].RankDiff[0].Date
        let rankDiff_source = currentCollection[0].RankDiff[0].source

        for (let i = 0; i < rankDiffData.length; i += chunkSize) {
            const rankDiffData_3Song = rankDiffData.slice(i, i + chunkSize);
            
            let rankDiffTweet = await generateTweet_rankDiff(rankDiffData_3Song,rankDiff_Date,rankDiff_source,db)
            let rankDiffTweet_hash = crypto.createHash('md5').update(rankDiffTweet).digest('hex')
            let checkTweetExist = await db.collection('tweetCollection').countDocuments({_id: rankDiffTweet_hash},{limit: 1})

            if(!Boolean(checkTweetExist)){
                let rankDiffTweet_ID = await tweetTwitterClient.postTweet({'text' : rankDiffTweet})
                let Doc = {
                    _id : rankDiffTweet_hash,
                    Content : rankDiffTweet,
                    timeStamp : timeStamp,
                    tweetID : rankDiffTweet_ID
                
                }
                await db.collection('tweetCollection').insertOne(Doc)
            }
            
        }
    }
    let peakRankAchievementData = currentCollection[0].peakRankAchievement
    for(let i = 0 ; i < peakRankAchievementData.length;i++){
        let peakRankTweet = await generateTweet_NewlyEntered(peakRankAchievementData[i],db)
        let peakRankTweet_hash = crypto.createHash('md5').update(peakRankTweet).digest('hex')
        let checkTweetExist = await db.collection('tweetCollection').countDocuments({_id: rankDiffTweet_hash},{limit: 1})
        if(!Boolean(checkTweetExist)){
            let peakRankTweet_ID = await tweetTwitterClient.postTweet({'text' : peakRankTweet})
            let Doc = {
                _id : peakRankTweet_hash,
                Content : peakRankTweet,
                timeStamp : timeStamp,
                tweetID : peakRankTweet_ID
            
            }
            await db.collection('tweetCollection').insertOne(Doc)
        }
    }
}
client.close()





