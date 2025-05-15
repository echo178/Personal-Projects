let collListResult = await db.listCollections({},{nameOnly:true}).toArray()
let currentCollectionName = 'GroupsTweetCount_April2023'
collListResult = collListResult.filter((obj) => obj.name.includes('GroupsTweetCount_')).filter((obj) => obj.name !== currentCollectionName).map((elem) => elem.name)

let concatArrayObject = ['$sumTweetOfDay', ...collListResult.map((collectionName) => collectionName.split('_')[1]).map((name) => ({$ifNull : [{$first: '$'+ name + '.sumTweetOfDay'},[]]}))]

let lookupObjects = collListResult.map((collectionName) =>
    ({$lookup: {
        from : collectionName,
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
        as : collectionName.split('_')[1]
    }})
)
let CalculatingAverageTweetQuery =   [
    {
        $project: {
            group_EngFullName: 1,
            sumTweetOfDay: 1,
        }
    },
    lookupObjects,
    {
        $set : {
            sumTweetOfDay: {
                $concatArrays: concatArrayObject
            }
        }
        
    },
    {
        $project: {
            group_EngFullName: 1,
            sumTweetOfDay: 1,
        }
    },
    {
        $unwind : '$sumTweetOfDay'
    },
    {
        $group: {
            _id: {
                name : '$group_EngFullName', Date : '$sumTweetOfDay.Date'
            },
            averageGlobalTweet : {$avg : '$sumTweetOfDay.globalTweetTotal'},
            averageKoreaTweet : {$avg : '$sumTweetOfDay.koreaTweetTotal'}
        }
    },
    {
        $sort : {
            '_id.Date': 1
        }
    },
    {
        $group: {    
            _id : {name : '$_id.name'},
            groupName : {
                $first : '$_id.name'
            },
            averageTweetArray : {
                $push: {
                    Date: '$_id.Date',
                    averageGlobalTweet : {
                        $round: ['$averageGlobalTweet',0]
                    },
                    averageKoreaTweet : {
                        $round: ['$averageKoreaTweet',0]
                    },
                    averageTotalTweet : {
                        $round:[{$sum: ['$averageGlobalTweet','$averageKoreaTweet']},0]
                    }
                    
                }
            },
        }
    },
    {
        $addFields : {
            averageTweetPerDay : {
                $round: [{$avg : '$averageTweetArray.averageTotalTweet'},0] 
            }
        }
    },
    {
        $project:{
            _id: 0,
            Group: {
                $literal: true
            },
            Artist : '$groupName',
            chart : 'tweetVolume',
            averageTweetPerDay : 1,
            averageTweetArray : 1
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
].flat()


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

let KtownQueries = await db.collection('Ktown_2023').aggregate(
    [
        {
            $match:{
                $text:{
                    $search: "Blackpink"
                }
            }
        },
        {
            $lookup:{
                from : "Ktown_2022",
                localField : "Artist",
                foreignField : "Artist",
                as : 'prev',
                pipeline:[
                    {
                        $project:{
                            _id:0,
                            Albums: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                'newArray':{
                    $concatArrays:[{$first: '$prev.Albums'},'$Albums']
                }
            }
        },
        {
            $unwind: {
              path: '$newArray'
            }
        },
        {
            $group:{
                _id:{Album: '$newArray.Album',Artist:'$Artist'},       
                Today_Sales: {
                    $push: '$newArray.Sales.Today_Sales'
                },
                Total_Sales: {
                    $push: '$newArray.Sales.Total_Sales'
                },
                totalSales: {
                    $max : '$newArray.totalSales'
                }
                
            }
        },
        {
            $project: {
              "Today_Sales": {
                $reduce: {
                  input: '$Today_Sales',
                  initialValue: [],
                  in: {$concatArrays: ['$$value', '$$this']}
                }
              },

              "Total_Sales": {
                $reduce: {
                  input: '$Total_Sales',
                  initialValue: [],
                  in: {$concatArrays: ['$$value', '$$this']}
                }
              },
              totalSales: 1,
              AverageSales: {
                $avg : "$Today_Sales.Sales"
              }
            }
        },
        {
            $addFields: {
              groupValue: 
                {
                    $switch: {
                       branches: [
                          { case: { $lt: [ '$totalSales', 1000 ] }, then: "Below 1000" },
                          { case: { $and: [{$gte : ['$totalSales',1000]}
                                        ,{$lt : ['$totalSales',10000]}] }, then: "Between 1000 - 9999" },
                          { case: { $gte: ['$totalSales',10000] }, then: "Above 10000" }
                       ]
                    }
                }
            }  
        },
        {
            $unwind: {
                path: '$Today_Sales',
                includeArrayIndex: 'index',
            }
        },  
        
        {
            $group: {
              _id: {
                groupValue: '$groupValue',
                index: '$index'
              },
              Sales:{
                $avg : '$Today_Sales.Sales'
              }
            }
        },
        {
            $sort: {
                "_id.index": 1
            }
        }, 
        {
            $group: {
              _id: {
                groupValue: '$_id.groupValue',
              },
              albumSales : {$first: '$_id.groupValue'},
              averageAlbumSalesArray:{
                $push : {$round: ['$Sales',0]}
              }
            }
        },
        {
            $project:{
                _id: 0,
                averageAlbumSalesArray: 1,
                Group : {$concat: ['Album Sales ', '$albumSales']},
                chart: 'Ktown',
                Artist: 'chartOverall'
            }
        },
       
    ]
).toArray()
async function generateSpecificGroupAnalytics(name,collectionName){
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