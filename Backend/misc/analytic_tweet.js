import mongodb from "mongodb";
import dotenv from 'dotenv'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let currentMonthDateObj = new Date()
let prev_1month_dateObj = new Date(new Date().setUTCMonth(currentMonthDateObj.getUTCMonth() - 1))
let prev_2month_dateObj = new Date(new Date().setUTCMonth(currentMonthDateObj.getUTCMonth() - 2))

const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
let currentMonthCollectionName ='GroupsTweetCount_'+ monthsArray[currentMonthDateObj.getUTCMonth()] + currentMonthDateObj.getUTCFullYear()
let prev_1month_CollectionName = 'GroupsTweetCount_'+ monthsArray[prev_1month_dateObj.getUTCMonth()] + prev_1month_dateObj.getUTCFullYear()
let prev_2month_CollectionName= 'GroupsTweetCount_'+ monthsArray[prev_2month_dateObj.getUTCMonth()] + prev_2month_dateObj.getUTCFullYear()



let test = await db.collection(currentMonthCollectionName).aggregate(
    [   
       
        
        {
            $project: {
                group_EngFullName: 1,
                sumTweetOfDay : 1,
            }
        },
        {
            $lookup: {
            from : 'analytics',
            localField : 'group_EngFullName',
            foreignField : 'Artist',
            pipeline : [
                {
                    $match: {
                        chart: 'tweetVolume',
                        Group : true
                    }
                },
                
            ],
            as : 'analytics'
            }
        },
        {
            $lookup: {
            from : prev_1month_CollectionName,
            localField : 'group_EngFullName',
            foreignField : 'group_EngFullName',
            pipeline : [
                {
                    $project: {
                        _id: 0,
                        sumTweetOfDay: 1,
                    }
                },
                
            ],
            as : prev_1month_CollectionName
            }
        },
        {
            $lookup: {
            from : prev_2month_CollectionName,
            localField : 'group_EngFullName',
            foreignField : 'group_EngFullName',
            pipeline : [
                {
                    $project: {
                        _id: 0,
                        sumTweetOfDay: 1,
                    }
                },
                
            ],
            as : prev_2month_CollectionName
            }
        },
        {
            $set : {
                prev_3month_sumTweetOfDay: {
                    $concatArrays: ['$sumTweetOfDay', {$first :'$' + prev_1month_CollectionName + '.sumTweetOfDay'},{$first: '$' + prev_2month_CollectionName + '.sumTweetOfDay'}]
                }
            }
            
        },
        {
            $project: {
                group_EngFullName: 1,
                sumTweetOfDay : 1,
                analytics : {
                    $first: '$analytics'
                },
                avgTweet : {
                    $avg : {
                        $map : {
                        input : '$prev_3month_sumTweetOfDay',
                        as : 'currDay',
                        in : {
                            $add : ['$$currDay.globalTweetTotal','$$currDay.koreaTweetTotal'],
                            }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                tweetSpikesByAvg : {
                    $map : {
                        input : '$sumTweetOfDay',
                        as : 'currDay',
                        in : {
                           $round: [{$multiply : [{$divide : [{$subtract: [{$add : ['$$currDay.globalTweetTotal','$$currDay.koreaTweetTotal']},'$avgTweet']},'$avgTweet']},100]},0]
                        }
                    }
                },
                maxSpikes : {
                    $max : {
                        $filter : {
                            input : '$tweetSpikesByAvg',
                            as : 'currSpike',
                            cond : {
                                $gte: ['$$currSpike',0]
                            }
                        }
                    }
                },
                tweetSpikesByAnalyticAvg : {
                    $map : {
                        input : '$sumTweetOfDay',
                        as : 'currDay',
                        in : {
                           $round: [{$multiply : [{$divide : [{$subtract: [{$add : ['$$currDay.globalTweetTotal','$$currDay.koreaTweetTotal']},'$analytics.averageTweetPerDay']},'$analytics.averageTweetPerDay']},100]},0]
                        }
                    }
                },
                maxSpikesByAnalyticAvg : {
                    $max :  {
                        $filter : {
                            input : '$tweetSpikesByAnalyticAvg',
                            as : 'currSpike',
                            cond : {
                                $gte: ['$$currSpike',0]
                            }
                        }
                    }
                }
            }
        },
        {
            $project : {
                group_EngFullName : 1,
                maxSpikesPercentage : {
                    $ifNull : [{$max : '$maxSpikes'},0]
                },
                maxSpikesDate : {
                   $add: [{ $indexOfArray : ['$tweetSpikesByAvg',{ $ifNull : [{$max : '$tweetSpikesByAvg'},0]}]},1]
                },
                maxSpikesPercentageAnalytic : {
                    $ifNull : [{$max : '$maxSpikesByAnalyticAvg'},0]
                },
                maxSpikesDateAnalytic : {
                   $add: [{ $indexOfArray : ['$tweetSpikesByAnalyticAvg',{  $ifNull : [{$max : '$tweetSpikesByAnalyticAvg'},0]}]},1]
                }
            }
        },
       
        
    ]
).toArray()

let DiffData = test.filter((obj) => obj.maxSpikesDate !== obj.maxSpikesDateAnalytic)
console.log(test)

client.close()