import mongodb from "mongodb";
import dotenv from 'dotenv'
import { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()


let circleChartDateObj = await checkGlobalDate()

let keyword 
let kpopGP = await db.collection('kpopDB').findOne({index: keyword})
let artistName =  kpopGP.artistFullName_Eng + ' ' +  kpopGP.artistName_KR 


let naverChart_analytic = await db.collection('naverChart').aggregate(
    [
        {
            $match: {
                
                    $text: {
                        $search: artistName
                    }
            }
        },
        { 
            $addFields:
            {
                matchScore : {$meta: "textScore"}
            }
        },
        {
            $match:
            { 
                matchScore: {$gt: 1}
            }
        },
        {
            $facet: {
                'totalSongCount': [
                {
                    $group : 
                        { _id : '$Artist', 
                        SongName : {$push: '$Song'},
                        count : { $sum : 1  }
                    }
                },
                {
                    $project: {
                        _id: 0
                    }
                }
                ],
                'currentSongCount': [
                    {
                        $addFields: { 
                            compareDate : {
                                $dateFromString :{
                                    dateString : {$substr :[{$arrayElemAt : [{$arrayElemAt: [ "$Rank", -1 ] },0]},0,24]} ,  
                                }   
                            }
                        }
                    },
                    {
                      $match : {
                        compareDate : {
                          $gte : new Date(new Date().getTime() - 1000 * 60 * 60 * 2)
                        }
                      }
                    },
                    {
                        $group : 
                            { _id : '$Artist', 
                            SongName : {$push: '$Song'},
                            count : { $sum : 1  }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    }
                ],
                'peakRankSong': [
                    {
                        $addFields: {
                            peakRank : {
                                $min : {
                                    $map:{
                                        input: '$Rank',
                                        as : 'currArray',
                                        in : {$toInt: {$last : '$$currArray'}}
                                    }
                                }
                            },
                           
                        }
                    },
                    {
                        $addFields: {
                            peakRankTime : {
                                $dateFromString :{
                                    dateString : {$substr :[
                                    {
                                        $first : {
                                            $last :{
                                                $filter : {
                                                    input :  '$Rank',
                                                    as : 'currArray',
                                                    cond : {$eq : [{$toInt: {$last : '$$currArray'}}, '$peakRank']}
                                                }
                                            }
                                        }
                                    },0,24]}
                                
                                }
                                
                            }
                        }
                    },
                    {
                        $sort : {
                            peakRank : 1,
                            peakRankTime: -1
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            Rank : 0
                        }
                    },
                    {
                        $limit : 1
                    }
                ],
                'Album': [
                    {
                        $addFields: {
                            peakRank : {
                                $min : {
                                    $map:{
                                        input: '$Rank',
                                        as : 'currArray',
                                        in : {$toInt: {$last : '$$currArray'}}
                                    }
                                }
                            },
                            avgRank : {
                                $avg : {
                                    $map:{
                                        input: '$Rank',
                                        as : 'currArray',
                                        in : {$toInt: {$last : '$$currArray'}}
                                    }
                                }
                            }
                           
                        }
                    },
                    {
                        $sort : {
                            peakRank : 1
                        }
                    },
                    {
                        $group: {
                            _id: '$Album',
                            peakRankSong:{
                                $first : {
                                    Song : '$Song',
                                    peakRank : '$peakRank',
                                    avgRank : '$avgRank',
                                    Img : '$Img'
                                }
                            },
                            avgRank :{
                                $avg : '$avgRank'
                            },
                            songs : {
                                $push : '$Song'
                            },
                            chartedSong : {
                                $count: {}
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                          albumName : '$_id',
                          peakRankSong:1,
                          avgRank: {$round: ['$avgRank',0]},
                          songs : 1,
                          chartedSong: 1
                        }
                    },
                    {
                        $lookup:{
                            from : 'Ktown_'+circleChartDateObj.year,
                            let : {name : '$albumName'},
                            pipeline: [
                                {
                                    $match: {
                                        $text: {
                                            $search  : artistName
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Albums: {
                                            $filter: {
                                                input: '$Albums',
                                                as : 'currAlbum',
                                                cond: 
                                                    { 
                                                        $regexMatch: { input: "$$currAlbum.Album", regex: "$$name", options: "i" }  
                                                    } 
                                            }
                                        },
                                        
                                    }
                                },
                                {
                                    $project: {
                                        'Albums.Sales' : 0
                                    }
                                }
            

                            ],
                            as : 'Ktown'
                        }
                    },
                    {
                        $lookup:{
                            from : 'circleChart_weeklySales_'+circleChartDateObj.year,
                            let : {name : '$albumName'},
                            pipeline: [
                                {
                                    $match: {
                                        $text: {
                                            $search  : artistName
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Albums: {
                                            $filter: {
                                                input: '$Albums',
                                                as : 'currAlbum',
                                                cond: 
                                                    { 
                                                        $regexMatch: { input: "$$currAlbum.Album", regex: "$$name", options: "i" }  
                                                    } 
                                            }
                                        },
                                        
                                    }
                                },
                                {
                                    $project: {
                                        'Albums.Sales' : 0
                                    }
                                }
            

                            ],
                            as : 'circleChart_weeklySales'
                        }
                    }
                ]
            }
        }
    ]
).toArray()

let melonChart_analytic = await db.collection('melonChart').aggregate(
    [
        {
            $match: {
                
                    $text: {
                        $search: artistName
                    }
            }
        },
        { 
          $addFields:
          {
              matchScore : {$meta: "textScore"}
          }
        },
        {
            $match:
            { 
                matchScore: {$gt: 1}
            }
        },
        {
            $facet: {
                'totalSongCount': [
                {
                    $group : 
                        { _id : '$Artist', 
                        SongName : {$push: '$Song'},
                        count : { $sum : 1  }
                    }
                },
                {
                    $project: {
                        _id: 0
                    }
                }
                ],
                'currentSongCount': [
                    {
                        $addFields: { 
                            compareDate : {
                                $dateFromString :{  
                                    dateString : {$substr :[{$arrayElemAt : [{$arrayElemAt: [ "$순위", -1 ] },0]},0,24]} ,  
                                }   
                            }
                        }
                    },
                    {
                      $match : {
                        compareDate : {
                          $gte : new Date(new Date().getTime() - 1000 * 60 * 60 * 2)
                        }
                      }
                    },
                    {
                        $group : 
                            { _id : '$Artist', 
                            SongName : {$push: '$Song'},
                            count : { $sum : 1  }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    }
                ],
                'peakRankSong': [
                    {
                        $addFields: {
                            peakRank : {
                                $min : {
                                    $map:{
                                        input: '$순위',
                                        as : 'currArray',
                                        in : {$toInt: {$last : '$$currArray'}}
                                    }
                                }
                            },
                           
                        }
                    },
                    {
                        $addFields: {
                            peakRankTime : {
                                $dateFromString :{
                                    dateString : {$substr :[
                                    {
                                        $first : {
                                            $last :{
                                                $filter : {
                                                    input :  '$순위',
                                                    as : 'currArray',
                                                    cond : {$eq : [{$toInt: {$last : '$$currArray'}}, '$peakRank']}
                                                }
                                            }
                                        }
                                    },0,24]}
                                
                                }
                                
                            }
                        }
                    },
                    {
                        $sort : {
                            peakRank : 1,
                            peakRankTime: -1
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            순위 : 0,
                            좋아요: 0
                        }
                    },
                    {
                        $limit : 1
                    }
                ],
                'Album': [
                    {
                        $addFields: {
                            peakRank : {
                                $min : {
                                    $map:{
                                        input: '$순위',
                                        as : 'currArray',
                                        in : {$toInt: {$last : '$$currArray'}}
                                    }
                                }
                            },
                            avgRank : {
                                $avg : {
                                    $map:{
                                        input: '$순위',
                                        as : 'currArray',
                                        in : {$toInt: {$last : '$$currArray'}}
                                    }
                                }
                            }
                           
                        }
                    },
                    {
                        $sort : {
                            peakRank : 1
                        }
                    },
                    {
                        $group: {
                            _id: '$앨범',
                            peakRankSong:{
                                $first : {
                                    Song : '$Song',
                                    peakRank : '$peakRank',
                                    avgRank : '$avgRank',
                                    Img : '$Img'
                                }
                            },
                            avgRank :{
                                $avg : '$avgRank'
                            },
                            songs : {
                                $push : '$Song'
                            },
                            chartedSong : {
                                $count: {}
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                          albumName : '$_id',
                          peakRankSong:1,
                          avgRank: {$round: ['$avgRank',0]},
                          songs : 1,
                          chartedSong: 1
                        }
                    },
                    {
                        $lookup:{
                            from : 'Ktown_'+circleChartDateObj.year,
                            let : {name : '$albumName'},
                            pipeline: [
                                {
                                    $match: {
                                        $text: {
                                            $search  : artistName
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Albums: {
                                            $filter: {
                                                input: '$Albums',
                                                as : 'currAlbum',
                                                cond: 
                                                    { 
                                                        $regexMatch: { input: "$$currAlbum.Album", regex: "$$name", options: "i" }  
                                                    } 
                                            }
                                        },
                                        
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        'Albums.Sales' : 0
                                    }
                                }
            

                            ],
                            as : 'Ktown'
                        }
                    },
                    {
                        $lookup:{
                            from : 'circleChart_weeklySales_'+circleChartDateObj.year,
                            let : {name : '$albumName'},
                            pipeline: [
                                {
                                    $match: {
                                        $text: {
                                            $search  : artistName
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Albums: {
                                            $filter: {
                                                input: '$Albums',
                                                as : 'currAlbum',
                                                cond: 
                                                    { 
                                                        $regexMatch: { input: "$$currAlbum.Album", regex: "$$name", options: "i" }  
                                                    } 
                                            }
                                        },
                                        
                                    }
                                },
                                {
                                    $project: {
                                        'Albums.Sales' : 0
                                    }
                                }
            

                            ],
                            as : 'circleChart_weeklySales'
                        }
                    }
                ]
            }
        }
    ]
).toArray()


let circleChart_analytic = await db.collection('circleChart_Rank').aggregate(
    [
        {
            $match: {
                
                    $text: {
                        $search: artistName
                    }
            }
        },
        { 
            $addFields:
            {
                matchScore : {$meta: "textScore"}
            }
        },
        {
            $match:
            { 
                matchScore: {$gt: 1}
            }
        },
        {
            $facet: {
                'totalSongCount': [
                {
                    $group : 
                        { _id : '$Artist', 
                        SongName : {$push: '$Song'},
                        count : { $count : {}  }
                    }
                },
                {
                    $project: {
                        _id: 0
                    }
                }
                ],
                'currentSongCount': [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: [{$last : '$Rank.year'},circleChartDateObj.year]},
                                    {$eq: [{$last : '$Rank.month'},circleChartDateObj.month]},
                                    {$gte: [{$last : '$Rank.day'},circleChartDateObj.day]}
                                ]
                            }   
                        }
                    },
                    {
                        $group : 
                            { _id : '$Artist', 
                            SongName : {$push: '$Song'},
                            count : { $count : {}  }
                        }
                    },
                    {
                        $project: {
                            _id: 0
                        }
                    }
                ],
                'peakRankSong': [
                    {
                        $addFields: {
                            peakRank: {
                                    $min : '$Rank.Rank'
                            },
                                                   
                        }
                    },
                    {
                        $addFields: {
                            peakRankTime : {
                                $last : {
                                    $filter : {
                                        input : '$Rank',
                                        as : 'currData',
                                        cond : { 
                                                $eq: ['$$currData.Rank', '$peakRank']
                                            }
                                        
                                    }
                                }
                                
                            }  
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            Rank: 0
                        }
                    },
                    {
                        $sort: {
                            peakRank : 1,
                            'peakRankTime.year': -1,
                            'peakRankTime.month': -1,
                            'peakRankTime.day': -1
                        }
                    },
                    {
                        $limit: 1
                    }
                    
                ],
                'Album': [
                    {
                        $addFields: {
                            peakRank : {
                                $min : '$Rank.Rank'
                            },
                            avgRank : {
                                $avg : '$Rank.Rank'
                            }
                           
                        }
                    },
                    {
                        $sort : {
                            peakRank : 1
                        }
                    },
                    {
                        $group: {
                            _id: '$Album',
                            peakRankSong:{
                                $first : {
                                    Song : '$Song',
                                    peakRank : '$peakRank',
                                    avgRank : {$round: ['$avgRank',0]},
                                    Img : '$Img'
                                }
                            },
                            avgRank :{
                                $avg : '$avgRank'
                            },
                            songs : {
                                $push : '$Song'
                            },
                            chartedSong : {
                                $count: {}
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                          albumName : '$_id',
                          peakRankSong:1,
                          avgRank: {$round: ['$avgRank',0]},
                          songs : 1,
                          chartedSong: 1
                        }
                    },
                    {
                        $lookup:{
                            from : 'Ktown_'+circleChartDateObj.year,
                            let : {name : '$albumName'},
                            pipeline: [
                                {
                                    $match: {
                                        $text: {
                                            $search  : artistName
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Albums: {
                                            $filter: {
                                                input: '$Albums',
                                                as : 'currAlbum',
                                                cond: 
                                                    { 
                                                        $regexMatch: { input: "$$currAlbum.Album", regex: "$$name", options: "i" }  
                                                    } 
                                            }
                                        },
                                        
                                    }
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        'Albums.Sales' : 0
                                    }
                                }
            

                            ],
                            as : 'Ktown'
                        }
                    },
                    {
                        $lookup:{
                            from : 'circleChart_weeklySales_'+circleChartDateObj.year,
                            let : {name : '$albumName'},
                            pipeline: [
                                {
                                    $match: {
                                        $text: {
                                            $search  : artistName
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        Albums: {
                                            $filter: {
                                                input: '$Albums',
                                                as : 'currAlbum',
                                                cond: 
                                                    { 
                                                        $regexMatch: { input: "$$currAlbum.Album", regex: "$$name", options: "i" }  
                                                    } 
                                            }
                                        },
                                        
                                    }
                                },
                                {
                                    $project: {
                                        'Albums.Sales' : 0
                                    }
                                }
            

                            ],
                            as : 'circleChart_weeklySales'
                        }
                    }
                ]
                
            }
        }
    ]
).toArray()


client.close()