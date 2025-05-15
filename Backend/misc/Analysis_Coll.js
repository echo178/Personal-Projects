import mongodb from "mongodb";
import dotenv from 'dotenv'
import generateChartDataURL from "../marketingAPI/generateChart.js";
import axios from "axios";
import { JSDOM } from "jsdom";
import getGlobalChart, { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'
import moment from "moment";


dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()



let groupName = ''
let collectionArray = [ 'circleChart_Rank','naverChart','melonChart']

for(let i=0; i < collectionArray.length; i++){
    
   await db.collection(collectionArray[i]).updateMany({$text:{$search: groupName}},{$set:{Group:true}})
   await generateGroupAnalytics(groupName,collectionArray[i])
}

async function generateGroupAnalytics(name,collectionName){
    let rankArrayAggregation, sizeAggregation
    switch(collectionName){
        case 'circleChart_Rank' :{
            rankArrayAggregation =  [   
                {
                    $match:{
                        $text:{
                            $search: name
                        }
                        
                    }
                },
                {
                    $project:{
                        Group: 1,
                        Artist:{
                            $cond:[
                                {$eq:[{$type:'$Artist'},'inputArray' ]},
                                name + ' - Various Artist' ,
                                '$Artist'
                            ]
                        },
                        Rank: 1,
                    }
                },
               
                {
                    $unwind: {
                      path: '$Rank',
                      includeArrayIndex: 'index',
                    }
                },
               
                {
                    $group:{
                        _id:{ Group : "$Group", index : "$index"},
                        Artist: {
                            $first: '$Artist'
                        },
                        Rank:{
                            $avg: "$Rank.Rank"
                        },
                        
                    },
                    
                },
                {
                    $sort: {
                        "_id.index": 1
                    }
                }, 
               
                {
                    $group:{
                        _id:{Group: "$_id.Group"},
                        Artist: {
                            $first: '$Artist'
                        },
                        Group:{$first: "$_id.Group"},
                        averageRankArray: {
                            $push: {$round: ["$Rank",0]}
                        },
                        
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chart : 'circleChart_Rank',
                        Artist: 1,
                        Group: "$_id.Group",
                        averageRankArray: 1,
                        
                    }
                },
                {
                    $merge:{
                        into: "analytics",
                        on : ["chart","Group","Artist"],
                        whenMatched : "merge",
                        whenNotMatched: "insert"
                    }
                }
               
            ];
            sizeAggregation =  [
                {
                    $match:{
                        $text:{
                            $search: name
                        }
                        
                    }
                },
                {
                    $addFields: {
                        RankSize: {
                            $size: "$Rank"
                        }
        
                    }
                },  
                {
                    $project:{
                        Group: 1,
                        Artist:{
                            $cond:[
                                {$eq:[{$type:'$Artist'},'inputArray' ]},
                                name + ' - Various Artist' ,
                                '$Artist'
                            ]
                        },
                        RankSize: 1,
                        _id:0
                    }
                },
                {
                    $group: {
                      _id: "$Group",
                      Artist : {
                        $first: '$Artist'
                      },
                      RankSize: {
                        $avg :"$RankSize"
                      }
                    }
                },
                {
                    $project: {
                        _id:0,
                        chart : 'circleChart_Rank',
                        Artist: 1,
                        Group: "$_id",
                        AverageRankSize : {
                            $round: ['$RankSize',0]
                        },
        
                    }
                },
                {
                    $merge:{
                        into: "analytics",
                        on : ["chart","Group","Artist"],
                        whenMatched : "merge",
                        whenNotMatched: "insert"
                    }
                }
            ]
            break ;    
        }
        case 'naverChart' : {
            rankArrayAggregation =  
            [   
                {
                    $match:{
                        $text:{
                            $search: name
                        }
                    }
                },
                {
                    $project:{
                        Group: 1,
                        Artist:{
                            $cond:[
                                {$eq:[{$type:'$Artist'},'inputArray' ]},
                                name + ' - Various Artist' ,
                                '$Artist'
                            ]
                        },
                        Rank: 1,
                    }
                },
            
                {
                    $unwind: {
                      path: '$Rank',
                      includeArrayIndex: 'index',
                    }
                },
            
                {
                    $group:{
                        _id:{ Group : "$Group", index : "$index"},
                        Artist:{
                            $first: '$Artist'
                        },
                        Rank:{
                            $avg: {
                                $last: "$Rank"
                            }
                        },

                    },

                },
                {
                    $sort: {
                        "_id.index": 1
                    }
                }, 
            
                {
                    $group:{
                        _id:{Group: "$_id.Group"},
                        Artist:{
                            $first: '$Artist'
                        },
                        Group:{$first: "$_id.Group"},
                        averageRankArray: {
                            $push: {$round: ["$Rank",0]}
                        },

                    }
                },
                {
                    $project: {
                        _id: 0,
                        chart : 'naverChart',
                        Artist: 1,
                        Group: "$_id.Group",
                        averageRankArray: 1,

                    }
                },
                {
                    $merge:{
                        into: "analytics",
                        on : ['chart','Group','Artist'],
                        whenMatched : "merge",
                        whenNotMatched: "insert"
                    }
                }
           
            ]
            sizeAggregation = 
            [   
                {
                    $match:{
                        $text:{
                            $search: name
                        }
                    }
                },
                
                {
                    $addFields: {
                        RankSize: {
                            $size: "$Rank"
                        }
        
                    }
                },  
                {
                    $project:{
                        Group: 1,
                        Artist:{
                            $cond:[
                                {$eq:[{$type:'$Artist'},'inputArray' ]},
                                name + ' - Various Artist' ,
                                '$Artist'
                            ]
                        },
                        RankSize: 1,
                        _id:0
                    }
                },
                {
                    $group: {
                      _id: "$Group",
                      Artist:{
                        $first: '$Artist'
                      },
                      RankSize: {
                        $avg :"$RankSize"
                      }
                    }
                },
                {
                    $project: {
                        _id:0,
                        chart : 'naverChart',
                        Artist: 1,
                        Group: "$_id",
                        AverageRankSize : {
                            $round: ['$RankSize',0]
                        },
        
                    }
                },
                {
                    $merge:{
                        into: "analytics",
                        on : ['chart','Group','Artist'],
                        whenMatched : "merge",
                        whenNotMatched: "insert"
                    }
                }
                
            ]
            break;
        }
        case 'melonChart' : {
            rankArrayAggregation = [
                {
                    $match:{
                        $text:{
                            $search: name
                        }
                    }
                },
                {
                    $project:{
                        Group: 1,
                        Artist:{
                            $cond:[
                                {$eq:[{$type:'$Artist'},'inputArray' ]},
                                name + ' - Various Artist' ,
                                '$Artist'
                            ]
                        },
                        순위: 1,
                    }
                },
                
               
                {
                    $unwind: {
                      path: '$순위',
                      includeArrayIndex: 'index',
                    }
                },
               
                {
                    $group:{
                        _id:{ Group : "$Group", index : "$index"},
                        Artist:{
                            $first: '$Artist'
                        },
                        Rank:{
                            $avg: {
                               $toInt: {$last: "$순위"}
                            }
                        },
                        
                    },
                    
                },
                {
                    $sort: {
                        "_id.index": 1
                    }
                }, 
               
                {
                    $group:{
                        _id:{Group: "$_id.Group"},
                        Artist:{
                            $first: '$Artist'
                        },
                        Group:{$first: "$_id.Group"},
                        averageRankArray: {
                            $push: {$round: ["$Rank",0]}
                        },
                        
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chart : 'melonChart',
                        Artist: 1,
                        Group: "$_id.Group",
                        averageRankArray: 1,
                        
                    }
                },
                {
                    $merge:{
                        into: "analytics",
                        on : ['chart','Group','Artist'],
                        whenMatched : "merge",
                        whenNotMatched: "insert"
                    }
                }
               
            ]
            sizeAggregation = [
                {
                    $match:{
                        $text:{
                            $search: name
                        }
                    }
                },
                
                {
                    $addFields: {
                        RankSize: {
                            $size: "$순위"
                        }
        
                    }
                },  
                {
                    $project:{
                        Group: 1,
                        Artist:{
                            $cond:[
                                {$eq:[{$type:'$Artist'},'inputArray' ]},
                                name + ' - Various Artist' ,
                                '$Artist'
                            ]
                        },
                        RankSize: 1,
                        _id:0
                    }
                },
               
                {
                    $group: {
                      _id: "$Group",
                      Artist:{
                        $first: '$Artist'
                      },
                      RankSize: {
                        $avg :"$RankSize"
                      }
                    }
                },
                {
                    $project: {
                        _id:0,
                        chart : 'melonChart',
                        Group: "$_id",
                        Artist: 1,
                        AverageRankSize : {
                            $round: ['$RankSize',0]
                        },
        
                    }
                },
                {
                    $merge:{
                        into: "analytics",
                        on : ['chart','Group','Artist'],
                        whenMatched : "merge",
                        whenNotMatched: "insert"
                    }
                }
            ]
            break;
        }
    }
   await db.collection(collectionName).aggregate(rankArrayAggregation).toArray()
   await db.collection(collectionName).aggregate(sizeAggregation).toArray()
}


let data = await db.collection('analytics').find({simplifyArray:{$exists:false}}).toArray()

for(let i = 0; i < data.length;i++){
    let getArray =  simplifyArray(data[i].averageRankArray)
    await db.collection('analytics').findOneAndUpdate({Group: data[i].Group,chart: data[i].chart, Artist: data[i].Artist},{$set:{simplifyArray : getArray}})
}
function simplifyArray(inputArray){
    let denomiator_100based_array = Math.round(inputArray.length/100)
    let returnArray  =  []
    while(inputArray.length> 0){
        
        while(denomiator_100based_array <=  inputArray.length){
            let splice_array =inputArray.splice(0,denomiator_100based_array)
            let sum = splice_array.reduce((acc,curr) => acc + curr,0)
            let averageValue = Math.round(sum / denomiator_100based_array)
            returnArray.push(averageValue)
        }

        let remainingLength = inputArray.length
        let remainingArray = inputArray.splice(0,remainingLength)
        let lastSum = remainingArray.reduce((acc,curr) => acc+curr,0)
        let lastValue = Math.round(lastSum/remainingLength)
        returnArray.push(lastValue)
    }
    return returnArray
}
client.close()
// need to add Group field for new Song

/*
let circleChart = await db.collection('circleChart_Rank').aggregate(
    [   
        {
            $project:{
                Artist: 1,
                Group: 1,
                Rank: 1,
            }
        },
       
        {
            $unwind: {
              path: '$Rank',
              includeArrayIndex: 'index',
            }
        },
       
        {
            $group:{
                _id:{ Group : "$Group", index : "$index"},
                Rank:{
                    $avg: "$Rank.Rank"
                },
                
            },
            
        },
        {
            $sort: {
                "_id.index": 1
            }
        }, 
       
        {
            $group:{
                _id:{Group: "$_id.Group"},
                Group:{$first: "$_id.Group"},
                averageRankArray: {
                    $push: {$round: ["$Rank",0]}
                },
                
            }
        },
        {
            $project: {
                _id: 0,
                chart : 'circleChart_Rank',
                Artist: 'chartOverall',
                Group: "$_id.Group",
                averageRankArray: 1,
                
            }
        },
        {
            $merge:{
                into: "analytics",
                on : ["chart","Group","Artist"],
                whenMatched : "merge",
                whenNotMatched: "insert"
            }
        }
       
    ]
).toArray()

let circleChart_size = await db.collection('circleChart_Rank').aggregate(
    [
        {
            $addFields: {
                RankSize: {
                    $size: "$Rank"
                }

            }
        },  
        {
            $project:{
                Group: 1,
                RankSize: 1,
                _id:0
            }
        },
       
        {
            $group: {
              _id: "$Group",
              RankSize: {
                $avg :"$RankSize"
              }
            }
        },
        {
            $project: {
                _id:0,
                chart : 'circleChart_Rank',
                Artist: 'chartOverall',
                Group: "$_id",
                AverageRankSize : {
                    $round: ['$RankSize',0]
                },

            }
        },
        {
            $merge:{
                into: "analytics",
                on : ["chart","Group","Artist"],
                whenMatched : "merge",
                whenNotMatched: "insert"
            }
        }
    ]
).toArray()

let naverChart = await db.collection('naverChart').aggregate(
    [
        {
            $project:{
                Group: 1,
                Rank: 1,
            }
        },
       
        {
            $unwind: {
              path: '$Rank',
              includeArrayIndex: 'index',
            }
        },
       
        {
            $group:{
                _id:{ Group : "$Group", index : "$index"},
                Rank:{
                    $avg: {
                        $last: "$Rank"
                    }
                },
                
            },
            
        },
        {
            $sort: {
                "_id.index": 1
            }
        }, 
       
        {
            $group:{
                _id:{Group: "$_id.Group"},
                Group:{$first: "$_id.Group"},
                averageRankArray: {
                    $push: {$round: ["$Rank",0]}
                },
                
            }
        },
        {
            $project: {
                _id: 0,
                chart : 'naverChart',
                Artist: "chartOverall",
                Group: "$_id.Group",
                averageRankArray: 1,
                
            }
        },
        {
            $merge:{
                into: "analytics",
                on : ['chart','Group','Artist'],
                whenMatched : "merge",
                whenNotMatched: "insert"
            }
        }
       
    ]
).toArray()

let naverChart_size = await db.collection('naverChart').aggregate(
    [
        {
            $addFields: {
                RankSize: {
                    $size: "$Rank"
                }

            }
        },  
        {
            $project:{
                Group: 1,
                RankSize: 1,
                _id:0
            }
        },
       
        {
            $group: {
              _id: "$Group",
              RankSize: {
                $avg :"$RankSize"
              }
            }
        },
        {
            $project: {
                _id:0,
                chart : 'naverChart',
                Artist: "chartOverall",
                Group: "$_id",
                AverageRankSize : {
                    $round: ['$RankSize',0]
                },

            }
        },
        {
            $merge:{
                into: "analytics",
                on : ['chart','Group','Artist'],
                whenMatched : "merge",
                whenNotMatched: "insert"
            }
        }
    ]
).toArray()
let melonChart = await db.collection('melonChart').aggregate(
    [
        {
            $project:{
                Group: 1,
                순위: 1,
            }
        },
       
        {
            $unwind: {
              path: '$순위',
              includeArrayIndex: 'index',
            }
        },
       
        {
            $group:{
                _id:{ Group : "$Group", index : "$index"},
                Rank:{
                    $avg: {
                       $toInt: {$last: "$순위"}
                    }
                },
                
            },
            
        },
        {
            $sort: {
                "_id.index": 1
            }
        }, 
       
        {
            $group:{
                _id:{Group: "$_id.Group"},
                Group:{$first: "$_id.Group"},
                averageRankArray: {
                    $push: {$round: ["$Rank",0]}
                },
                
            }
        },
        {
            $project: {
                _id: 0,
                chart : 'melonChart',
                Artist: "chartOverall",
                Group: "$_id.Group",
                averageRankArray: 1,
                
            }
        },
        {
            $merge:{
                into: "analytics",
                on : ['chart','Group','Artist'],
                whenMatched : "merge",
                whenNotMatched: "insert"
            }
        }
       
    ]
).toArray()

let melonChart_size = await db.collection('melonChart').aggregate(
    [
        {
            $addFields: {
                RankSize: {
                    $size: "$순위"
                }

            }
        },  
        {
            $project:{
                Group: 1,
                RankSize: 1,
                _id:0
            }
        },
       
        {
            $group: {
              _id: "$Group",
              RankSize: {
                $avg :"$RankSize"
              }
            }
        },
        {
            $project: {
                _id:0,
                chart : 'melonChart',
                Group: "$_id",
                Artist: "chartOverall",
                AverageRankSize : {
                    $round: ['$RankSize',0]
                },

            }
        },
        {
            $merge:{
                into: "analytics",
                on : ['chart','Group','Artist'],
                whenMatched : "merge",
                whenNotMatched: "insert"
            }
        }
    ]
).toArray()
*/





