let db, month, lastMonth, lastmonth_year, year, currDateobj, lastMonthDateObj
import axios from "axios";
import { JSDOM } from "jsdom";
import { checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'

async function searchInCollections(kpopDB_search_word,other_search_word){
  let collListResult = await db.listCollections({},{nameOnly:true}).toArray()
  const filterList = [
      'kpopDB_individual','nameMap','mvDB','quizDB','analytics','tweetCollection','Group','GroupsTweetCount_'
  ]
  for(let i = 2022; i < year;i++){
    filterList.push('Ktown_'+i)
  }
  
  let collList = collListResult.map(obj => obj.name).filter(x =>
      filterList.every((element) => x !== element && !x.includes(element)))
  
  let concatArray = collList.map((elem) => '$' + elem)
  let facetObject = {}
  let groupObject = {
      _id: "$_id",
      }
  let projectObject = {
      _id:0,
      }   
  for(let name of collList){
      facetObject[name] = [{
          "$lookup": {
              "from": name,
              "pipeline": [
                  { "$match": { $text: {$search: `${other_search_word}`}} },
                  { $addFields:{matchScore : {$meta: "textScore"}}},
                  {$match:{ matchScore: {$gt: 1} }},
                  {"$project": {_id: 0} },
              ],
              "as": name
            }
      }]
      groupObject[name] = {
          $push : "$" +name
      }
      projectObject[name] = {
          $first: "$" +name
      }
  }
  
  let result = await db.collection('kpopDB').aggregate(
  [
      {
          $match:{
              $text:
              {
                  $search: `${kpopDB_search_word}`
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
          "$facet": facetObject
      }, 
      { "$project": {
          "data": {
            "$concatArrays":concatArray
          }
      }},
      {
          $unwind: "$data"
      },
      {
          $replaceRoot:{newRoot: '$data'}
      },
      {
          $group: groupObject
      },
      {
          $project : projectObject
      }
     
  ]).toArray()
  
  return result[0]
}
async function getDataPoint(){
    let dataPointNumber  = 0;
    function getDataPointfromArray(array){
        return array.map((obj) => Object.values(obj)).flat().reduce((a,b) => a +b)
    }
    let collListResult = await db.listCollections({},{nameOnly:true}).toArray()
    const filterList = [
        'GroupsTweetCount_','watchlist_', 'Ktown_'
    ]
    let collList = collListResult.map(obj => obj.name).filter(x =>
        filterList.some((element) => x.includes(element)))
        
    
    for(let collectionName of collList){
        if(collectionName.includes('Ktown')){
            let result = await db.collection(collectionName).aggregate(
                [{
                    $project:{
                        '_id': 0,
                        'Rank_dataCount' :{ $reduce: {
                            input: "$Albums",
                            initialValue: 0,
                            in : {$add:["$$value", {$size: "$$this.Sales.Today_Sales"} ]}
                            }
                        },
                        
                    }
                }
                ]
            ).toArray() 
            result = getDataPointfromArray(result)
            dataPointNumber += result
        }
        else{
            let result = await db.collection(collectionName).aggregate(
                [{
                    $project:{
                        '_id': 0,
                        'tweetCount_KR_dataCount' :{ $reduce: {
                            input: "$tweetCount_KR",
                            initialValue: 0,
                            in : {$add:["$$value", {$size:{$objectToArray:"$$this" }} ]}
                            }
                        },
                        'tweetCount_Global_dataCount' :{ $reduce: {
                            input: "$tweetCount_Global",
                            initialValue: 0,
                            in : {$add:["$$value", {$size:{$objectToArray:"$$this" }} ]}
                            }
                        },
                    }
                }]
            ).toArray()
            result = getDataPointfromArray(result)
            dataPointNumber += result
        }
        
    }
    
    let melonChartPoint = await db.collection('melonChart').aggregate(
        [{
            $project:{
                '_id': 0,
                '순위_dataCount' :{ $size: "$순위"}
            }
        }]
    ).toArray()
    
    dataPointNumber += getDataPointfromArray(melonChartPoint)
    
    let naverChartPoint = await db.collection('naverChart').aggregate(
        [{
            $project:{
                '_id': 0,
                'Rank_dataCount' :{ $size: "$Rank"}
                },
                
            }
        ]
    ).toArray()
    dataPointNumber += getDataPointfromArray(naverChartPoint)
    
    let circleChart_Rank = await db.collection('circleChart_Rank').aggregate(
        [{
            $project:{
                '_id': 0,
                'Rank_dataCount' :{ $reduce: {
                    input: "$Rank",
                    initialValue: 0,
                    in : {$add:["$$value", {$size:{$objectToArray:"$$this" }} ]}
                    }
                },
                
            }
        }]
    ).toArray()
    dataPointNumber += getDataPointfromArray(circleChart_Rank)
    return dataPointNumber
}
async function getWatchlistArtistNames(){
    let collectionNames = await db.listCollections({name:{$regex : "watchlist_"}},{nameOnly:true},).toArray()
    collectionNames = collectionNames.map((obj) => obj.name)
    let returnDataObject = {}
    for(let i = 0 ; i < collectionNames.length; i++){
        let currentCollectionName = collectionNames[i]
        let currentNameList = await db.collection(currentCollectionName).find({Artist:{$exists: true,$ne:null}}).project({_id:0,Artist:1}).toArray()
        currentNameList = currentNameList.map((obj)=> obj.Artist)
        returnDataObject[currentCollectionName.replace('watchlist_','')] = currentNameList
    }
    return returnDataObject
  
}
async function searchWatchlistArtistNames(artist){
    let collectionNames = await db.listCollections({name:{$regex : "watchlist_"}},{nameOnly:true},).toArray()
    collectionNames = collectionNames.map((obj) => obj.name)
    let returnDataObject = {}
    for(let i = 0 ; i < collectionNames.length; i++){
        let currentCollectionName = collectionNames[i]
        let currentNameList = await db.collection(currentCollectionName).aggregate([{
            $match:{
                $text: {
                    $search: `\"${artist}\"`  
                }
            }
        }]).toArray()
        returnDataObject[currentCollectionName.replace('watchlist_','')] = currentNameList
    }
    
    return returnDataObject
  
}
function generatePortalCollectionName(){
  const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  let date = new Date()
  month = monthName[date.getMonth()]
  year = date.getFullYear()
  return 'watchlist_'+month+ year
}
export default class dataServer {

    //this is the function to connect with database and set current month and year for below functions to use
    static async injectDB(conn){
        try{
        db = await conn.db(process.env.DB_NAME)        
        const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        let date = new Date()
        currDateobj = date
        month = monthName[date.getMonth()]
        year = date.getFullYear()
        let lastMonth_dateObj = new Date()
        lastMonth_dateObj.setUTCDate(0)
        lastMonthDateObj = lastMonth_dateObj
        lastMonth = monthName[lastMonth_dateObj.getUTCMonth()]
        lastmonth_year = lastMonth_dateObj.getUTCFullYear()
        
        }
        catch(e){
            console.log(e)
        }
    }
    //this is the initial data which display how much database has been tracking
    static async briefData(){
        let totalCollection = await db.listCollections().toArray()
        totalCollection = totalCollection.map((obj) => obj.name)
        let watchlistCollection = totalCollection.filter((name) => name.includes('watchlist_'))
        let totalNumber = 0
        for(let name of watchlistCollection){
            totalNumber += await db.collection(name).countDocuments({})
        }
        let watchlistChart = await db.collection('watchlist_'+ month + year).countDocuments({})
        let GroupsTweetChart = await db.collection('GroupsTweetCount_' + month + year).countDocuments({})

        let totalDataPoint = await getDataPoint()

        let data = {
            totalComeBack : totalNumber,
            currMnthComeBack : watchlistChart,
            activeGroup : GroupsTweetChart,
            currDataPoint : totalDataPoint
        }
        return data
    }
    //this is to retrieve the tweet count data of monthly active groups and comeback 
    static async TweetCountData(){
        let GrouptweetCount_KR =  await db.collection('GroupsTweetCount_' + month + year).find().project({_id: 0,group_EngFullName:1,tweetCount_KR:1,tweetCountTotal_KR:1}).sort({tweetCountTotal_KR: -1}).limit(10).toArray()

        let GrouptweetCount_Global =  await db.collection('GroupsTweetCount_'+ month + year).find().project({_id: 0,group_EngFullName:1,tweetCount_Global: 1,tweetCountTotal_Global:1}).sort({tweetCountTotal_Global: -1}).limit(10).toArray()

        let comebackTweetCount_KR = await  db.collection('watchlist_' + month + year).find().project({_id: 0,Artist: 1,tweetCount_KR: 1,Date: 1, Album: 1,Song:1}).sort({tweetCountTotal_KR: -1}).limit(10).toArray()

        let comebackTweetCount_Global = await  db.collection('watchlist_'+ month + year).find().project({_id: 0,Artist: 1,tweetCount_Global: 1,Date: 1, Album: 1,Song:1}).sort({tweetCountTotal_KR: -1}).limit(10).toArray()
        let collectionName = await db.listCollections().toArray()
        collectionName = collectionName.map((obj) => obj.name).filter((name) => (name.includes('watchlist') || name.includes('GroupsTweetCount')))
        let totalDataArray = []
        for(let name of collectionName){
        let month_year = name.split('_')[1]
        let year = month_year.slice(-4)
        let month = month_year.slice(0,-4)
        let retrieveData = await db.collection(name).aggregate([{
            $group: {
                _id: '',
                tweetCountTotal_KR: { $sum: '$tweetCountTotal_KR' },
                tweetCountTotal_Global :{ $sum: '$tweetCountTotal_Global' }
            }
         }, {
            $project: {
                _id: 0,
                tweetCountTotal_KR: '$tweetCountTotal_KR',
                tweetCountTotal_Global: '$tweetCountTotal_Global'
            }
        }]).toArray()
        retrieveData = retrieveData[0]
        retrieveData['month'] = month + '_' + year
        let docCount = await db.collection(name).countDocuments()
        retrieveData['doc_count'] = docCount
        if(name.includes('watchlist')){
            retrieveData['doc_type'] = 'watchlist'
        }
        else{
            retrieveData['doc_type'] = 'group'
        }
        totalDataArray.push(retrieveData)
        }
        let data = {
            group_tweet_KR : GrouptweetCount_KR,
            group_tweet_Global : GrouptweetCount_Global,
            comeback_tweet_KR : comebackTweetCount_KR,
            comeback_tweet_Glboal : comebackTweetCount_Global,
            summary : totalDataArray
        }
        return data
    }
    //this is to retrieve the rank data from three music Charts 
    static async ChartData(){
        let melonChart = await db.collection('melonChart').find({$expr:{$lt:[{$toInt: {$last :{$last: "$순위"}}},11]}}).project({_id:0,songId:0,Source:0,'좋아요':0}).toArray()
        let naverChart = await db.collection('naverChart').find({$expr:{$lt:[{$toInt: {$last :{$last: "$Rank"}}},11]}}).project({_id:0,Source:0}).toArray()
        let circleChart = await db.collection('circleChart_Rank').find({$expr:{$lt:[{$last: "$Rank.Rank"},11]}}).project({_id:0}).toArray()
        function removeOldRankData(array,searchTerm){
            let latestDate = 0
            if(Array.isArray(array[0][searchTerm].at(-1))){
                for(let i =0; i< array.length ; i++){
                let currDate = new Date(array[i][searchTerm].at(-1)[0])
                if(latestDate < currDate.getTime())
                {
                latestDate = currDate.getTime()
                }
                }
                return  array.filter((obj) => new Date(obj[searchTerm].at(-1)[0]).getTime() === latestDate)
            }
            else{
                for(let i =0; i< array.length; i++){
                let currDateObj = array[i][searchTerm].at(-1)
                let currDate = new Date(currDateObj.year + '-'+ currDateObj.month+'-'+currDateObj.day)
                if(latestDate < currDate.getTime()){
                    latestDate = currDate.getTime()
                }
                return array.filter((obj) => new Date(array[i][searchTerm].at(-1).year + '-'+ array[i][searchTerm].at(-1).month+'-'+array[i][searchTerm].at(-1).day).getTime() === latestDate)
                }
            } 
        }
        melonChart = removeOldRankData(melonChart,'순위')
        naverChart = removeOldRankData(naverChart,'Rank')
        circleChart = removeOldRankData(circleChart,'Rank')
        let data = {
         melonChart : melonChart,
         naverChart : naverChart,
         circleChart : circleChart   
        }
        return data
    }
    static async ViewData(){
        let data = await db.collection('watchlist_September2022').find({Views:{$exists:true}}).sort({totalViewCount: -1}).limit(10).project({_id:0,Artist:1,Date:1,Album:1,Day:1,Song:1,Views:1}).toArray()
        return data
    }
    //this is to retrieve the sales data @deprecated
    static async salesData(){
        let date = new Date()
        let month = date.getMonth() + 1
        let dateString = date.getFullYear().toString() + month.toString().padStart(2,'0') + date.getDate().toString().padStart(2,'0')
        let KtownChart = await db.collection('Ktown_2022').find().sort({TotalSales: -1}).limit(10).toArray()
        let maxValue = await db.collection('circleChart_weeklySales_2022').aggregate(
            [{
             $project:{
                 Albums : {
                     $max:{$max:"$Albums.distribution.week"}
             }
            }},{
             $group: {
                 _id:0,
                 maxWeek : {$max: '$Albums'}
             }
            },{
             $project:{
                 _id: 0,
                 maxWeek: 1
             }
            }]
         ).toArray() 
        let latestWeek = maxValue[0].maxWeek
        
        let circleChartWeekly = await db.collection('circleChart_weeklySales_2022').find(
        {
            'Albums.distribution':{
             $elemMatch:{ 'week': latestWeek, 'distributionRank':{$lt:11}}
            }
        }
        ).toArray()

        let circleChart_offlineSales_FsHourly = await db.collection('circleChart_offlineSales_2022').aggregate(
           [{$match:
            {
                'Albums.foreignSales':{
                    $elemMatch:{ 
                        'Date': dateString,
                    }
                }
            }},
            {$project:
                {
                Artist:1,
                Albums: {$filter:{
                    input:'$Albums',
                    cond: {
                        $in:[dateString,'$$this.foreignSales.Date']
                    }
                }}
            }
            }
        ]
        ).sort({'Albums.lastForeignSales': -1}).limit(10).toArray()
        
        let circleChart_offlineSales_KsHourly = await db.collection('circleChart_offlineSales_2022').aggregate(
           [{$match:
            {
                'Albums.koreaSales':{
                    $elemMatch:{ 
                        'Date': dateString,
                    }
                }
            }},
            {$project:
                {
                Artist:1,
                Albums: {$filter:{
                    input:'$Albums',
                    cond: {
                        $in:[dateString,'$$this.koreaSales.Date']
                    }
                }}
            }
            }
        ]
        ).sort({'Albums.lastKoreaSales': -1}).limit(10).toArray()
        
        let circleChart_offlineSales_TotalHourly = await db.collection('circleChart_offlineSales_2022').aggregate(
           [{$match:
            {
                'Albums.koreaSales':{
                    $elemMatch:{ 
                        'Date': dateString,
                    }
                }
            }},
            {$project:
                {
                Artist:1,
                Albums: {$filter:{
                    input:'$Albums',
                    cond: {
                        $in:[dateString,'$$this.koreaSales.Date']
                    }
                }}
            }
            }
        ]
        ).sort({'Albums.lastTotalSales': -1}).limit(10).toArray()
        let SalesObj = {
            ktown : KtownChart,
            circle_weekly : circleChartWeekly,
            circle_hourly_fs : circleChart_offlineSales_FsHourly,
            circle_hourly_ks : circleChart_offlineSales_KsHourly,
            circle_hourly_total : circleChart_offlineSales_TotalHourly
        }
        return SalesObj
    } 
    //this is to get Index of group
    static async groupIndex(){
       let data = await db.collection('kpopDB').find({activeStatus:"Yes"}).project({_id: 0,artistFullName_Eng:1,artistName_KR:1,index:1}).toArray()
       return data
    }
    static async getWatchlistArtist(){
        let data = await getWatchlistArtistNames()
        return data
    }
    //this is to search keyword in the database collections
    
    static async searchTweetCount(keyword){
      keyword = parseInt(keyword)
      if(typeof(keyword) === 'number'){
        let searchGroup = await db.collection('kpopDB').findOne({index:keyword})
        let kpopDB_search_string = '\"'+searchGroup.artistFullName_Eng + '\" \"' +  searchGroup.artistName_KR + '\"'
        let other_search_string = searchGroup.artistFullName_Eng + ' ' +  searchGroup.artistName_KR 
        
        
        let collectionNames = await db.listCollections({name:{$regex : "GroupsTweetCount_"}},{nameOnly:true},).toArray()
        collectionNames = collectionNames.map((obj) => obj.name)
        const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
        let sortedCollection = collectionNames.sort((name1,name2) => {
            let monthYear1 = name1.replace('GroupsTweetCount_','')
            let year1 = parseInt(monthYear1.slice(-4))
            let month1 = monthYear1.substring(0,monthYear1.length - 4)
        
            let monthYear2 = name2.replace('GroupsTweetCount_','')
            let year2 = parseInt(monthYear2.slice(-4))
            let month2 = monthYear2.substring(0,monthYear2.length - 4)
            return  year2 - year1 ||  monthsArray.indexOf(month2) - monthsArray.indexOf(month1)
        })
        
        let collList = sortedCollection.slice(0,3)
        collList.push('kpopDB')
        
        let concatArray = collList.map((elem) => '$' + elem)
        let facetObject = {}
        let groupObject = {
            _id: "$_id",
        }
        let projectObject = {
          _id:0,
        }   
        for(let name of collList){
          facetObject[name] = [{
              "$lookup": {
                  "from": name,
                  "pipeline": [
                      { "$match": { $text: {$search: `${other_search_string}`}} },
                      { $addFields:{matchScore : {$meta: "textScore"}}},
                      {$match:{ matchScore: {$gt: 1} }},
                      {"$project": {_id: 0} },
                  ],
                  "as": name
                }
          }]
          groupObject[name] = {
              $push : "$" +name
          }
          projectObject[name] = {
              $first: "$" +name
          }
        }
        let result = await db.collection('kpopDB').aggregate(
          [
              {
                  $match:{
                      $text:
                      {
                          $search: `${kpopDB_search_string}`
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
                  "$facet": facetObject
              }, 
              { 
                "$project": {
                  "data": {
                    "$concatArrays":concatArray
                  }
                }
              },
              {
                  $unwind: "$data"
              },
              {
                  $replaceRoot:{newRoot: '$data'}
              },
              {
                  $group: groupObject
              },
              {
                  $project : projectObject
              }
            
          ]).toArray()
          
        result[0]['groupName'] = searchGroup.artistFullName_Eng
        return result[0]
      }
      else{
        return {
            status : 'ERROR : Invalid Input',
        
        }
      }
    }
    static async searchAnalytic(keyword){
      keyword = parseInt(keyword)
      if(typeof(keyword) === 'number'){
        let circleChartDateObj = await checkGlobalDate()
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

          return {
            naverChart: naverChart_analytic,
            melonChart : melonChart_analytic,
            circleChart: circleChart_analytic
          }
      }
      else{
        return {
            status : 'ERROR : Invalid Input',
        
        }
      }
    }
    static async dataSearch(keyword){
        console.time('search')
        keyword = parseInt(keyword)
        
        if(typeof(keyword) === 'number'){
          let searchGroup = await db.collection('kpopDB').findOne({index:keyword})

          let kpopDB_search_string = '\"'+searchGroup.artistFullName_Eng + '\" \"' +  searchGroup.artistName_KR + '\"'
          let other_search_string = searchGroup.artistFullName_Eng + ' ' +  searchGroup.artistName_KR 
          let searchGroupData = await searchInCollections(kpopDB_search_string,other_search_string)
          
            Object.filter = (obj, predicate) => 
            Object.keys(obj)
              .filter( key => predicate(obj[key]))//(obj[key] == array => (array).length> 0)
              .reduce( (res, key) => (res[key] = obj[key], res), {} );
              
            let filterObj = Object.filter(searchGroupData,(array)=> array.length > 0)
            filterObj['groupName'] = searchGroup.artistFullName_Eng 
            console.timeEnd('search') 
            return filterObj
        }
        else{
          console.timeEnd('search') 
            return {
                status : 'ERROR : Invalid Input',

            }
        }
        
    }
    //this is to search keyword in watchlist collections
    static async dataSearch_Watchlist(searchTerm,collectionName){   
        let searchedData = await searchWatchlistArtistNames(searchTerm) 
        return searchedData
    }    

    //this is to get the suggestion of answerOptions of quizz
    static async optionGenerate(){
        let totalMV = await db.collection('quizDB').find({}).project({_id:0,Title:1}).toArray()
        totalMV = totalMV.map((obj) => obj.Title)
        return totalMV
    }
    static async getQuiz(){
        let document = await db.collection('quizDB').aggregate([{$sample: {size: 1}}]).project({_id:0}).toArray()
        return document
    }
    static async getGroupData(){

    let currMonthGpData = await db.collection('GroupsTweetCount_' +month+year).find({}).project({_id:0,group_EngFullName:1,sumTweetOfDay:1,tweetCountTotal_Global:1,tweetCountTotal_KR:1}).toArray()

    let lastMonthGpData = await db.collection('GroupsTweetCount_'+lastMonth+lastmonth_year).find({}).project({_id:0,group_EngFullName:1,sumTweetOfDay:1,tweetCountTotal_Global:1,tweetCountTotal_KR:1}).toArray()

    let currMonthTotalTweet_inDay = await db.collection('GroupsTweetCount_' +month+year).aggregate([
        {
          $project : {
            sumTweetOfDay : 1
          }
        },
        {
          $unwind: '$sumTweetOfDay'
        },
        {
          $group:{
            _id: '$sumTweetOfDay.Date',
            totalGlobalTweet : {$sum : "$sumTweetOfDay.globalTweetTotal"},
            totalKoreaTweet : { $sum : "$sumTweetOfDay.koreaTweetTotal"}
          }
        },{
          $project:{
            'Day': '$_id',
            '_id' : 0,
            totalGlobalTweet : 1,
            totalKoreaTweet : 1,
          }
        }
    ]).toArray()
    currMonthTotalTweet_inDay = currMonthTotalTweet_inDay.sort((obj1,obj2) => obj1.Day - obj2.Day)

    let lastMonthTotalTweet_inDay = await db.collection('GroupsTweetCount_'+lastMonth+lastmonth_year).aggregate([
        {
          $project : {
            sumTweetOfDay : 1
          }
        },
        {
          $unwind: '$sumTweetOfDay'
        },
        {
          $group:{
            _id: '$sumTweetOfDay.Date',
            totalGlobalTweet : {$sum : "$sumTweetOfDay.globalTweetTotal"},
            totalKoreaTweet : { $sum : "$sumTweetOfDay.koreaTweetTotal"}
          }
        },{
          $project:{
            'Day': '$_id',
            '_id' : 0,
            totalGlobalTweet : 1,
            totalKoreaTweet : 1,
          }
        }
    ]).toArray()     
    lastMonthTotalTweet_inDay = lastMonthTotalTweet_inDay.sort((obj1,obj2) => obj1.Day - obj2.Day)
    
    currMonthGpData.forEach(obj => {
        obj['tweetCountTotal'] = obj.tweetCountTotal_Global + obj.tweetCountTotal_KR
    });
    lastMonthGpData.forEach(obj => {
        obj['tweetCountTotal'] = obj.tweetCountTotal_Global + obj.tweetCountTotal_KR
    });
    let currMonth_totalGlobalTweet = currMonthGpData.reduce((accu,curr) => accu + curr.tweetCountTotal_Global,0)
    let currMonth_totalKoreaTweet = currMonthGpData.reduce((accu,curr) => accu + curr.tweetCountTotal_KR,0)
    let lastMonth_totalGlobalTweet = lastMonthGpData.reduce((accu,curr) => accu + curr.tweetCountTotal_Global,0)
    let lastMonth_totalKoreaTweet = lastMonthGpData.reduce((accu,curr) => accu + curr.tweetCountTotal_KR,0)

    let currMonthGp_name = currMonthGpData.map((obj) => obj.group_EngFullName)
    let lastMonthGp_name = lastMonthGpData.map((obj) => obj.group_EngFullName)
    
    let differences
    if(currMonthGp_name.length > lastMonthGp_name){
        differences = currMonthGp_name.filter((name) => !lastMonthGp_name.includes(name))
    }
    else{
        differences = lastMonthGp_name.filter((name) => !currMonthGp_name.includes(name))
    }
    
    let currMonth_DayChange = currMonthGpData.map((obj) => {
        let returnObj = {}
        returnObj['group_EngFullName'] = obj.group_EngFullName
        returnObj['sumTweetOfDay'] = obj.sumTweetOfDay
        
        if(currDateobj.getUTCDate() < 3){
            if(currDateobj.getUTCDate() === 2){
                let lastMonthObj = lastMonthGpData.find((findObj) => findObj.group_EngFullName === obj.group_EngFullName)
                if(lastMonthObj){
                    if(lastMonthObj.sumTweetOfDay.at(-1)){
                        returnObj['prev_2_day'] = lastMonthObj.sumTweetOfDay.at(-1).globalTweetTotal + lastMonthObj.sumTweetOfDay.at(-1).koreaTweetTotal
                    }else{
                        returnObj['prev_2_day'] = 0
                    }
                    returnObj['prev_1_day'] = (obj.sumTweetOfDay.at(-2).globalTweetTotal + obj.sumTweetOfDay.at(-2).koreaTweetTotal)
                    returnObj['latestDayChange'] = returnObj['prev_1_day'] -returnObj['prev_2_day'] 
                }else{
                    returnObj['prev_2_day'] = 0
                    returnObj['prev_1_day'] = 0
                    returnObj['latestDayChange'] = 0
                }
                
            }
            if(currDateobj.getUTCDate() === 1){
                let lastMonthObj = lastMonthGpData.find((findObj) => findObj.group_EngFullName === obj.group_EngFullName)
                if(lastMonthObj){
                    if(lastMonthObj.sumTweetOfDay.at(-2)){
                        returnObj['prev_2_day'] = lastMonthObj.sumTweetOfDay.at(-2).globalTweetTotal + lastMonthObj.sumTweetOfDay.at(-2).koreaTweetTotal
                    }else{
                        returnObj['prev_2_day'] = 0
                    }
                    if(lastMonthObj.sumTweetOfDay.at(-1)){
                        returnObj['prev_1_day'] = lastMonthObj.sumTweetOfDay.at(-1).globalTweetTotal + lastMonthObj.sumTweetOfDay.at(-1).koreaTweetTotal
                    }else{
                        returnObj['prev_1_day'] = 0
                    }
                    returnObj['latestDayChange'] =  returnObj['prev_1_day'] - returnObj['prev_2_day']   
                }else{
                    returnObj['prev_2_day'] = 0
                    returnObj['prev_1_day'] = 0
                    returnObj['latestDayChange'] = 0
                }
                
            }
        }
        else{
            returnObj['prev_2_day'] = (obj.sumTweetOfDay.at(-3).globalTweetTotal + obj.sumTweetOfDay.at(-3).koreaTweetTotal)
            returnObj['prev_1_day'] = (obj.sumTweetOfDay.at(-2).globalTweetTotal + obj.sumTweetOfDay.at(-2).koreaTweetTotal)
            returnObj['latestDayChange'] =  (obj.sumTweetOfDay.at(-2).globalTweetTotal + obj.sumTweetOfDay.at(-2).koreaTweetTotal) - (obj.sumTweetOfDay.at(-3).globalTweetTotal + obj.sumTweetOfDay.at(-3).koreaTweetTotal) 
        }
        return returnObj
    })
    
    let differenceInTweet = currMonthGpData.map((obj) => {
        let search = obj.group_EngFullName
        let date = new Date()
        
        let lastMonth = lastMonthGpData.find((obj) => obj.group_EngFullName === search)
        
        let returnObj = {}
        if(lastMonth){
          lastMonth.sumTweetOfDay = lastMonth.sumTweetOfDay.filter((obj) => obj.Date <= date.getUTCDate())
          let sumTweet_MTD = 0
          for(let i=0; i< lastMonth.sumTweetOfDay.length ; i++){
            sumTweet_MTD += lastMonth.sumTweetOfDay[i].globalTweetTotal + lastMonth.sumTweetOfDay[i].koreaTweetTotal
          }
        returnObj['group_EngFullName'] = search
        returnObj['tweetDifference'] = obj.tweetCountTotal - sumTweet_MTD
        
        
        return returnObj
        }
        else{
          returnObj['group_EngFullName'] = search
          returnObj['tweetDifference'] = 0
          return returnObj
        }
    })
    
    let most_positiveChange_gp = currMonth_DayChange.find((obj) => obj.latestDayChange === Math.max(...currMonth_DayChange.map(obj => obj.latestDayChange)))
    let most_negativeChange_gp = currMonth_DayChange.find((obj) => obj.latestDayChange === Math.min(...currMonth_DayChange.map(obj => obj.latestDayChange)))
    let dayChange_Data = {}
    dayChange_Data['most_positiveChange_gp'] = most_positiveChange_gp
    dayChange_Data['most_negativeChange_gp'] = most_negativeChange_gp
    
    let data = {
        currMonth_GroupCount : currMonthGpData.length,
        lastMonth_GroupCount : lastMonthGpData.length,
        differences_GP : differences,
        differenceInTweet : differenceInTweet,
        dayChange_Data: dayChange_Data,
        currMonth_totalGlobalTweet : currMonth_totalGlobalTweet,
        currMonth_totalKoreaTweet : currMonth_totalKoreaTweet,        
        lastMonth_totalGlobalTweet : lastMonth_totalGlobalTweet,
        lastMonth_totalKoreaTweet : lastMonth_totalKoreaTweet,
        currMonthTotalTweet_inDay: currMonthTotalTweet_inDay,
        lastMonthTotalTweet_inDay : lastMonthTotalTweet_inDay,
    }
    return data
    }
    static async getComebackData(){

        const currMonthcomeback = await db.collection('watchlist_' +month+year).find({}).project({tweetCount_Global: 0,tweetCount_KR:0,views_2:0,_id:0}).toArray()
        let comebackMap = {}
        for(let obj of currMonthcomeback){
            if(!comebackMap['Day ' + obj.Day]){
                comebackMap['Day ' + obj.Day] = 1
            }
            else{
                comebackMap['Day ' + obj.Day] += 1
            }
        }
        comebackMap = Object.keys(comebackMap).sort((a,b) => a.split(' ')[1] - b.split(' ')[1]).reduce(
            (obj, key) => { 
              obj[key] = comebackMap[key]; 
              return obj;
            }, 
            {}
          );

        let currMonthData = await db.collection('watchlist_'+month+year).find({}).project({_id:0,tweetCount_Global:0,tweetCount_KR:0,views_2:0,sumTweetOfDay:0}).toArray()
        let currMonth_totalTweet = currMonthData.reduce((acc,current) => acc + current.tweetCountTotal_Global + current.tweetCountTotal_KR,0)


        let comebackTweets_inDay = await db.collection('watchlist_'+month+year).aggregate([
            {
              $project : {
                sumTweetOfDay : 1
              }
            },
            {
              $unwind: '$sumTweetOfDay'
            },
            {
              $group:{
                _id: '$sumTweetOfDay.Date',
                totalGlobalTweet : {$sum : "$sumTweetOfDay.globalTweetTotal"},
                totalKoreaTweet : { $sum : "$sumTweetOfDay.koreaTweetTotal"}
              }
            },{
              $project:{
                'Day': '$_id',
                '_id' : 0,
                totalGlobalTweet : 1,
                totalKoreaTweet : 1,
              }
            }
        ]).toArray()
        
        
        let currMonth_highestTweet_Data = await db.collection('watchlist_'+month+year).aggregate([
            {"$addFields":{ "sort_order":{"$add":["$tweetCountTotal_Global", "$tweetCountTotal_KR"]}}}, 
            {"$sort":{"sort_order":-1}},
            {"$project":{"sort_order":0,"views_2":0,"tweetCount_Global":0,"tweetCount_KR":0}}
            ]).limit(1).toArray()
        let currMonth_secondHighestTweet_Data = await db.collection('watchlist_'+month+year).aggregate([
            {"$addFields":{ "sort_order":{"$add":["$tweetCountTotal_Global", "$tweetCountTotal_KR"]}}}, 
            {"$sort":{"sort_order":-1}},
            {"$skip":1},
            {"$project":{"sort_order":0,"views_2":0,"tweetCount_Global":0,"tweetCount_KR":0}}
           ]).limit(1).toArray()
        let currentDay = currDateobj.getUTCDate()
        let todayComeback = await db.collection('watchlist_'+month+year).find({Day : currentDay}).project({Date: 1,Artist:1,Album:1,Day:1,Song:1,_id:0}).toArray()
        let topView = await db.collection('watchlist_'+month+year).find({}).project({tweetCount_Global: 0,tweetCount_KR:0,sumTweetOfDay:0}).sort({TotalView : -1}).limit(1).toArray()
        let data = {
            comebackCount : currMonthcomeback.length,
            comebackMap : comebackMap,
            currMonth_totalTweet : currMonth_totalTweet,
            comebackTweets_inDay : comebackTweets_inDay,
            currMonth_highestTweet : currMonth_highestTweet_Data[0],
            currMonth_secondHighestTweet : currMonth_secondHighestTweet_Data[0],
            todayComeback : todayComeback,
            currMonth_highestView : topView
        }
        return data;
    }
    static async getMKTData_Group(){
      const briefData = await this.briefData()
      const currentDate = currDateobj.getUTCDate()
      let returnDocument = await db.collection('GroupsTweetCount_'+month+year).countDocuments({$expr:{$gte:[{$size: {$objectToArray : {$last : '$tweetCount_Global'}}}, 13]}})
  
      let tweetCount_Array_selector = (Index,Timeframe,tweetRow) => ({
      
          $filter:
          {
             input: {$slice: [{$objectToArray : {$arrayElemAt: [tweetRow, Index]}}, Timeframe]},
             cond:{$ne:['$$field.k','Date']},
             as: 'field',
          }
      })
      
      let merge_tweetCout_obj = (curr_prev) => ({
          $arrayToObject:{
              $map: {
                  input: `$${curr_prev}_tweetCount_Global`,
                  in: {
                      
                          $mergeObjects:['$$this',{
                              'v':{
                              $add:["$$this.v",{$arrayElemAt:[`$${curr_prev}_tweetCount_KR.v`,{$indexOfArray:[`$${curr_prev}_tweetCount_Global`,"$$this"]}]}] 
                              } 
                          }]                                                               
                  }
              }
          }        
      })
      if(currentDate === 1){
        if(returnDocument > 0){
          let aggregateQuery_curr_12hour_Comparison = (sortType) => (
            [
              {
                $project:{
                    group_EngFullName : 1,
                    group_KRName : 1,
                    curr_sumTweetOfDay : {
                        $last:'$sumTweetOfDay'
                    },
                }
              },
              {
                $project:{
                    group_EngFullName : 1,
                    group_KRName : 1,
                    curr_totalTweet : {
                      $sum: ['$curr_sumTweetOfDay.globalTweetTotal', '$curr_sumTweetOfDay.koreaTweetTotal']
                    },
                }
              },
              {
                $lookup: {
                  from : 'GroupsTweetCount_'+lastMonth+lastmonth_year ,
                  localField: "group_EngFullName",
                  foreignField: "group_EngFullName",
                  pipeline:[ 
                    {
                      $project:{
                        _id: 0,
                        prev_tweetCount_Global:{
                          $arrayToObject: {$slice: [{$objectToArray : {$last: "$tweetCount_Global"}}, -12]}
                        },
                        prev_tweetCount_KR:{
                          $arrayToObject: {$slice: [{$objectToArray : {$last: "$tweetCount_KR"}}, -12]}
                        }
                      }
                    },
                    {
                      $project:{
                        prev_tweetCount_Global_total : {
                          $reduce:{
                            input : {$objectToArray: '$prev_tweetCount_Global'},
                            initialValue :  0,
                            in :  {$add : ["$$value", {$cond: {if: {$ne:['$$this.k','Date']},then: "$$this.v", else : 0 }}] },
                          },
                        },
                        prev_tweetCount_KR_total : {
                            $reduce:{
                            input : {$objectToArray: '$prev_tweetCount_KR'},
                            initialValue :  0,
                            in :  {$add : ["$$value", {$cond: {if: {$ne:['$$this.k','Date']},then: "$$this.v", else : 0 }}] },
                            }
                        },
                      }
                    },
                    {
                      $project:{
                        prev_totalTweet : {
                          $sum: ['$prev_tweetCount_Global_total', '$prev_tweetCount_Global_total']
                      },
                      }
                    }
                  ],
                  as : 'lastmonth'
                }
              },
              {
                $replaceRoot: {
                  newRoot: {
                    $mergeObjects: [
                      {
                        $arrayElemAt: [
                          "$lastmonth",
                          0
                        ]
                      },
                      "$$ROOT"
                    ]
                  }
                }
              },
              {
                $project:{
                  lastmonth: 0
                }
              },
              {
                $project:{
                    group_EngFullName: 1,
                    group_KRName : 1,
                    curr_totalTweet : 1,
                    prev_totalTweet : 1,
                    tweetDifference : {
                      $subtract: [ {$ifNull: [ "$prev_totalTweet", 0 ]},"$curr_totalTweet" ]
                    }
                }
              },
              { 
                $sort :{
                    tweetDifference: sortType
                }
              },
              {
                $limit: 1
              },
              {
                $lookup:{
                  from : 'kpopDB',
                  localField: "group_EngFullName",
                  foreignField: "artistFullName_Eng",
                  pipeline:[ 
                    {
                      $project:{
                        _id: 0,
                        index: 1
                      }
                    }
                  ],
                  as : 'kpop_index'
                }
              },
              {
                  $replaceRoot: {
                    newRoot: {
                      $mergeObjects: [
                        {
                          $arrayElemAt: [
                            "$kpop_index",
                            0
                          ]
                        },
                        "$$ROOT"
                      ]
                    }
                  }
              },
              {
                  $project:{
                    kpop_index: 0
                  }
              }
            ]
          )
          let mostTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_curr_12hour_Comparison(1)).toArray()
          let lessTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_curr_12hour_Comparison(-1)).toArray()
          return {
            brief: briefData,
            mostTweetedGroup : mostTweetedGroup,
            lessTweetedGroup : lessTweetedGroup,      
            compare_timeframe : 12    
            }
        }
        else{
          let aggregateQuery_last_24hour_Comparison = (sortType) => ([
            {
              $project:{
                  group_EngFullName : 1,
                  group_KRName : 1,
                  curr_sumTweetOfDay : {
                     $arrayElemAt:['$sumTweetOfDay', -2]
                  },
                  prev_sumTweetOfDay : {
                    $arrayElemAt:['$sumTweetOfDay', -3]
                 },
              }
            },
            {
              $project:{
                    group_EngFullName : 1,
                    group_KRName : 1,
                    curr_totalTweet : {
                      $sum: ['$curr_sumTweetOfDay.globalTweetTotal', '$curr_sumTweetOfDay.koreaTweetTotal']
                    },
                    prev_totalTweet : {
                      $sum: ['$prev_sumTweetOfDay.globalTweetTotal', '$prev_sumTweetOfDay.koreaTweetTotal']
                    }
              }
            },
            {
              $project:{
                  group_EngFullName: 1,
                  group_KRName : 1,
                  curr_totalTweet : 1,
                  prev_totalTweet : 1,
                  tweetDifference : {
                    $subtract: [ {$ifNull: [ "$prev_totalTweet", 0 ]} ,"$curr_totalTweet" ]
                  }
              }
            },
            { $sort :{tweetDifference: sortType}},
            {
              $limit: 1
            },
            {
              $lookup:{
                from : 'kpopDB',
                localField: "group_EngFullName",
                foreignField: "artistFullName_Eng",
                pipeline:[ 
                  {
                    $project:{
                      _id: 0,
                      index: 1
                    }
                  }
                ],
                as : 'kpop_index'
              }
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    {
                      $arrayElemAt: [
                        "$kpop_index",
                        0
                      ]
                    },
                    "$$ROOT"
                  ]
                }
              }
            },
            {
              $project:{
                kpop_index: 0
              }
            }
          ])
          let mostTweetedGroup = await db.collection('GroupsTweetCount_'+lastMonth+lastmonth_year).aggregate(aggregateQuery_last_24hour_Comparison(1)).toArray()
          let lessTweetedGroup = await db.collection('GroupsTweetCount_'+lastMonth+lastmonth_year).aggregate(aggregateQuery_last_24hour_Comparison(-1)).toArray()
          return {
            brief: briefData,
            mostTweetedGroup : mostTweetedGroup,
            lessTweetedGroup : lessTweetedGroup,    
            compare_timeframe : 24  
            }
        } 
      }
      else if(currentDate === 2){
          if(returnDocument > 0 ){
              let aggregateQuery_curr_12hour_Comparison = (sortType) => ([
                  {
                      $project:{
                          group_EngFullName : 1,
                          group_KRName : 1,
                          curr_sumTweetOfDay : {
                              $last:'$sumTweetOfDay'
                          },
                          prev_2day_tweetCount_Global : {
                              $arrayToObject: {$slice: [{$objectToArray : {$arrayElemAt: ["$tweetCount_Global", -2]}}, -12]}
                          },
                          prev_2day_tweetCount_KR : {
                              $arrayToObject: {$slice: [{$objectToArray : {$arrayElemAt: ["$tweetCount_KR", -2]}}, -12]}
                          }
                      }
                  },
                  {
                      $project:{
                          group_EngFullName : 1,
                          group_KRName : 1,
                          curr_totalTweet : {
                            $sum: ['$curr_sumTweetOfDay.globalTweetTotal', '$curr_sumTweetOfDay.koreaTweetTotal']
                          },
                          prev_2day_tweetCount_KR_total : {
                            $reduce:{
                              input : {$objectToArray: '$prev_2day_tweetCount_KR'},
                              initialValue :  0,
                              in :  {$add : ["$$value", {$cond: {if: {$ne:['$$this.k','Date']},then: "$$this.v", else : 0 }}] },
                            },
                          },
                          prev_2day_tweetCount_KR_Global_total : {
                              $reduce:{
                              input : {$objectToArray: '$prev_2day_tweetCount_Global'},
                              initialValue :  0,
                              in :  {$add : ["$$value", {$cond: {if: {$ne:['$$this.k','Date']},then: "$$this.v", else : 0 }}] },
                              }
                          },
                      }
                  },
                  {
                      $project:{
                      group_EngFullName: 1,
                      group_KRName : 1,
                      curr_totalTweet : 1,
                      prev_totalTweet : {
                          $sum: ['$prev_2day_tweetCount_KR_total', '$prev_2day_tweetCount_KR_Global_total']
                      },
                      }
                  },
                  {
                      $project:{
                          group_EngFullName: 1,
                          group_KRName : 1,
                          curr_totalTweet : 1,
                          prev_totalTweet : 1,
                          tweetDifference : {
                            $subtract: [ {$ifNull: [ "$prev_totalTweet", 0 ]} ,"$curr_totalTweet" ]
                          }
                      }
                  },
                  { 
                      $sort :{
                          tweetDifference: sortType
                      }
                  },
                  {
                      $limit: 1
                  },
                  {
                      $lookup:{
                        from : 'kpopDB',
                        localField: "group_EngFullName",
                        foreignField: "artistFullName_Eng",
                        pipeline:[ 
                          {
                            $project:{
                              _id: 0,
                              index: 1
                            }
                          }
                        ],
                        as : 'kpop_index'
                      }
                  },
                  {
                      $replaceRoot: {
                        newRoot: {
                          $mergeObjects: [
                            {
                              $arrayElemAt: [
                                "$kpop_index",
                                0
                              ]
                            },
                            "$$ROOT"
                          ]
                        }
                      }
                  },
                  {
                      $project:{
                        kpop_index: 0
                      }
                  }
                ])
                let mostTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_curr_12hour_Comparison(1)).toArray()
                let lessTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_curr_12hour_Comparison(-1)).toArray()
                return {
                  brief: briefData,
                  mostTweetedGroup : mostTweetedGroup,
                  lessTweetedGroup : lessTweetedGroup,      
                  compare_timeframe : 12    
                  }
          }
          else{
              let aggregateQuery_last_24hour_Comparison = (sortType) => (
                  [
                    {
                      $lookup: {
                        from : 'GroupsTweetCount_' + lastMonth + lastmonth_year,
                        localField: "group_EngFullName",
                        foreignField: "group_EngFullName",
                        pipeline:[ 
                          {
                            $project:{
                              _id: 0,
                              lastmonth_sumTweetOfDay:{
                                $last:'$sumTweetOfDay'
                              }
                            }
                          }
                        ],
                        as : 'lastmonth'
                      }
                    },
                    {
                        $project:{
                          lastmonth: 1,
                          group_EngFullName : 1,
                          group_KRName: 1,
                          sumTweetOfDay :{
                            $last: '$sumTweetOfDay'
                          }
                        }
                    },
                    {
                        $replaceRoot: {
                          newRoot: {
                            $mergeObjects: [
                              {
                                $arrayElemAt: [
                                  "$lastmonth",
                                  0
                                ]
                              },
                              "$$ROOT"
                            ]
                          }
                        }
                    },
                    {
                        $project:{
                          lastmonth: 0
                        }
                    },
                    {
                        $project: {
                          group_EngFullName: 1,
                          group_KRName: 1,
                          curr_totalTweet :{
                            $add : ["$sumTweetOfDay.globalTweetTotal","$sumTweetOfDay.koreaTweetTotal"]
                          },
                          prev_totalTweet : {
                            $add : ["$lastmonth_sumTweetOfDay.globalTweetTotal","$lastmonth_sumTweetOfDay.koreaTweetTotal"]
                          }
                        }
                    },
                    {
                        $project:{
                            group_EngFullName: 1,
                            group_KRName : 1,
                            curr_totalTweet : 1,
                            prev_totalTweet : 1,
                            tweetDifference : {
                              $subtract: [ {$ifNull: [ "$prev_totalTweet", 0 ]} ,"$curr_totalTweet" ]
                            }
                        }
                    },
                    { 
                      $sort :{
                          tweetDifference: sortType
                      }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $lookup:{
                          from : 'kpopDB',
                          localField: "group_EngFullName",
                          foreignField: "artistFullName_Eng",
                          pipeline:[ 
                            {
                              $project:{
                                _id: 0,
                                index: 1
                              }
                            }
                          ],
                          as : 'kpop_index'
                        }
                    },
                    {
                        $replaceRoot: {
                          newRoot: {
                            $mergeObjects: [
                              {
                                $arrayElemAt: [
                                  "$kpop_index",
                                  0
                                ]
                              },
                              "$$ROOT"
                            ]
                          }
                        }
                    },
                    {
                        $project:{
                          kpop_index: 0
                        }
                    }
                  ])
              let mostTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_last_24hour_Comparison(1)).toArray()
              let lessTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_last_24hour_Comparison(-1)).toArray()
              return {
                  brief: briefData,
                  mostTweetedGroup : mostTweetedGroup,
                  lessTweetedGroup : lessTweetedGroup,  
                  compare_timeframe : 24    
            }
          }
      }
      else{
          // 12 hour period
          if(returnDocument > 0 ){
            let aggregateQuery_curr_12hour_Comparison = (sortType,curr_Index,prev_Index,time_frame) => ([
              {
                  $project:{
                      group_EngFullName : 1,
                      group_KRName : 1,
                      curr_tweetCount_Global:tweetCount_Array_selector(curr_Index,time_frame,'$tweetCount_Global'),
                      curr_tweetCount_KR:tweetCount_Array_selector(curr_Index,time_frame,'$tweetCount_KR'),
                      prev_tweetCount_Global:tweetCount_Array_selector(prev_Index,time_frame,'$tweetCount_Global'),
                      prev_tweetCount_KR:tweetCount_Array_selector(prev_Index,time_frame,'$tweetCount_KR'),
                      curr_sumTweetOfDay : {
                          $last:'$sumTweetOfDay'
                      },
                      prev_2day_tweetCount_Global : {
                          $arrayToObject: {$slice: [{$objectToArray : {$arrayElemAt: ["$tweetCount_Global", -2]}}, -12]}
                      },
                      prev_2day_tweetCount_KR : {
                          $arrayToObject: {$slice: [{$objectToArray : {$arrayElemAt: ["$tweetCount_KR", -2]}}, -12]}
                      }
                  }
              },
              {
                  $project:{
                      group_EngFullName : 1,
                      group_KRName : 1,
                      curr_tweetCount_total: merge_tweetCout_obj('curr'),
                      prev_tweetCount_total: merge_tweetCout_obj('prev'),
                      curr_totalTweet : {
                        $sum: ['$curr_sumTweetOfDay.globalTweetTotal', '$curr_sumTweetOfDay.koreaTweetTotal']
                      },
                      prev_2day_tweetCount_KR_total : {
                          $reduce:{
                              input : {$objectToArray: '$prev_2day_tweetCount_KR'},
                              initialValue :  0,
                              in :  
                                  {$add : ["$$value", {$cond: {if: {$ne:['$$this.k','Date']},then: "$$this.v", else : 0 }}] },
                          },
                      },
                      prev_2day_tweetCount_KR_Global_total : {
                          $reduce:{
                          input : {$objectToArray: '$prev_2day_tweetCount_Global'},
                          initialValue :  0,
                          in :  {$add : ["$$value", {$cond: {if: {$ne:['$$this.k','Date']},then: "$$this.v", else : 0 }}] },
                          }
                      },
                  }
              },
              {
                  $project:{
                  group_EngFullName: 1,
                  group_KRName : 1,
                  curr_tweetCount_total:1,
                  prev_tweetCount_total:1,
                  curr_totalTweet : 1,
                  prev_totalTweet : {
                      $sum: ['$prev_2day_tweetCount_KR_total', '$prev_2day_tweetCount_KR_Global_total']
                  },
                  }
              },
              {
                  $project:{
                      group_EngFullName: 1,
                      group_KRName : 1,
                      curr_tweetCount_total:1,
                      prev_tweetCount_total:1,
                      curr_totalTweet : 1,
                      prev_totalTweet : 1,
                      tweetDifference : {
                        $subtract: [ {$ifNull: [ "$prev_totalTweet", 0 ]} ,"$curr_totalTweet" ]
                      }
                  }
              },
              { 
                  $sort :{
                      tweetDifference: sortType
                  }
              },
              {
                  $limit: 1
              },
              {
                  $lookup:{
                    from : 'kpopDB',
                    localField: "group_EngFullName",
                    foreignField: "artistFullName_Eng",
                    pipeline:[ 
                      {
                        $project:{
                          _id: 0,
                          index: 1
                        }
                      }
                    ],
                    as : 'kpop_index'
                  }
              },
              {
                  $replaceRoot: {
                    newRoot: {
                      $mergeObjects: [
                        {
                          $arrayElemAt: [
                            "$kpop_index",
                            0
                          ]
                        },
                        "$$ROOT"
                      ]
                    }
                  }
              },
              {
                  $project:{
                    kpop_index: 0
                  }
              }
            ])
            let mostTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_curr_12hour_Comparison(1,-1,-2,-12)).toArray()
            let lessTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_curr_12hour_Comparison(-1,-1,-2,-12)).toArray()
            return {
              brief: briefData,
              mostTweetedGroup : mostTweetedGroup,
              lessTweetedGroup : lessTweetedGroup,
              compare_timeframe : 12      
              }
          }
          // 0 hour period
          else{
            let aggregateQuery_last_24hour_Comparison = (sortType,curr_Index,prev_Index,time_frame) => ([
              {
                $project:{
                      group_EngFullName : 1,
                      group_KRName : 1,
                      curr_tweetCount_Global:tweetCount_Array_selector(curr_Index,time_frame,'$tweetCount_Global'),
                      curr_tweetCount_KR:tweetCount_Array_selector(curr_Index,time_frame,'$tweetCount_KR'),
                      prev_tweetCount_Global:tweetCount_Array_selector(prev_Index,time_frame,'$tweetCount_Global'),
                      prev_tweetCount_KR:tweetCount_Array_selector(prev_Index,time_frame,'$tweetCount_KR'),
                      curr_sumTweetOfDay : {
                       $arrayElemAt:['$sumTweetOfDay', -2]
                      },
                      prev_sumTweetOfDay : {
                      $arrayElemAt:['$sumTweetOfDay', -3]
                      },
                }
              },
              {
                $project:{
                      group_EngFullName : 1,
                      group_KRName : 1,
                      curr_tweetCount_total: merge_tweetCout_obj('curr'),
                      prev_tweetCount_total: merge_tweetCout_obj('prev'),
                      curr_totalTweet : {
                        $sum: ['$curr_sumTweetOfDay.globalTweetTotal', '$curr_sumTweetOfDay.koreaTweetTotal']
                      },
                      prev_totalTweet : {
                        $sum: ['$prev_sumTweetOfDay.globalTweetTotal', '$prev_sumTweetOfDay.koreaTweetTotal']
                      }
                }
              },
              {
                $project:{
                    group_EngFullName: 1,
                    group_KRName : 1,
                    curr_tweetCount_total:1,
                    prev_tweetCount_total:1,
                    curr_totalTweet : 1,
                    prev_totalTweet : 1,
                    tweetDifference : {
                      $subtract: [ {$ifNull: [ "$prev_totalTweet", 0 ]} ,"$curr_totalTweet" ]
                    }
                }
              },
              { $sort :{tweetDifference: sortType}},
              {
                $limit: 1
              },
              {
                $lookup:{
                  from : 'kpopDB',
                  localField: "group_EngFullName",
                  foreignField: "artistFullName_Eng",
                  pipeline:[ 
                    {
                      $project:{
                        _id: 0,
                        index: 1
                      }
                    }
                  ],
                  as : 'kpop_index'
                }
              },
              {
                $replaceRoot: {
                  newRoot: {
                    $mergeObjects: [
                      {
                        $arrayElemAt: [
                          "$kpop_index",
                          0
                        ]
                      },
                      "$$ROOT"
                    ]
                  }
                }
              },
              {
                $project:{
                  kpop_index: 0
                }
              }
            ])
            let mostTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_last_24hour_Comparison(1,-2,-3,-24)).toArray()
            let lessTweetedGroup = await db.collection('GroupsTweetCount_'+month+year).aggregate(aggregateQuery_last_24hour_Comparison(-1,-2,-3,-24)).toArray()
            return {
              brief: briefData,
              mostTweetedGroup : mostTweetedGroup,
              lessTweetedGroup : lessTweetedGroup,    
              compare_timeframe : 24  
            }
          }
      }
    }//an endpoint to post tweet

    //to edit documents without song
    static async getWatchlist_without_Song(){
        let portalCollectionName = generatePortalCollectionName()
        let result = await db.collection(portalCollectionName).find({}).project({_id:0,tweetCount_Global: 0,Views: 0,tweetCount_KR: 0,sumTweetOfDay: 0,'views_2.viewCount': 0}).toArray()
        return result
    }
    static async postWatchlist_update_song(data){
        let Artist = data.Artist
        let Date = data.Date
        let Album = data.Album
        let Song = data.Song
        let videoArray = data.newVideoID
        let relatedGroupArray = data.newRelatedGroup
            
        try{
            let portalCollectionName = generatePortalCollectionName()
            await db.collection(portalCollectionName).findOneAndUpdate({Artist: data.Artist},{$set:{Artist: Artist,Date: Date,Album: Album,Song : Song}})
               if(videoArray.length > 0){
                for(let i = 0; i < videoArray.length; i++){
                    if(videoArray[i] !== ''){
                        let result = await db.collection(portalCollectionName).findOneAndUpdate({Artist: data.Artist},
                            {$push:
                                {views_2:
                                    {
                                        videoId : videoArray[i]
                                    }    
                                }
                            }
                        )
                        
                    } 
                }               
            }
            if(relatedGroupArray.length > 0 && relatedGroupArray[0] !== ''){
            let portalCollectionName = generatePortalCollectionName()
            await db.collection(portalCollectionName).findOneAndUpdate({Artist: data.Artist},
                {$push:
                    {relatedGroups:
                        {
                            $each : relatedGroupArray
                        }    
                    }
                }
            )
            }
            return true
        }
        catch(e){
            console.log(e)
            return false
        }   
    } 
    static async insert_new_song(data){
        let videoIdArray
        if(data.newVideoID && data.newVideoID[0] !== ''){
            videoIdArray = data.newVideoID.map((elem) => {
                let returnObj = {}
                returnObj['videoId'] = elem
                return returnObj
            })
        }
        
        let relatedGroupArray
        if(data.newRelatedGroup[0] !== '' && data.newRelatedGroup.length > 0){
            relatedGroupArray =  data.newRelatedGroup
        }
        
        let Day = parseInt(data.Date.split(' ')[1].replace(',',''))
       
        let document = {
            Artist: data.Artist,
            Album: data.Album,
            Date: data.Date,
            Day: Day,
            Song: data.Song,
        }
        if(relatedGroupArray){
            document['relatedGroups'] = relatedGroupArray
        }
        if(videoIdArray){
            document['views_2'] = videoIdArray
        }
        try{
            let portalCollectionName =generatePortalCollectionName()
            await db.collection(portalCollectionName).insertOne(document)
            return true;
        }catch(e){
            console.log(e)
            return false
        }
    }  

    //to get the most recent data 
    static async recent_data(requestDate){
      let limitTime_millisecond = requestDate * 24 * 60 * 60 * 1000
      let curr_year = new Date().getUTCFullYear()
      let ktown_last_7days_sales = await db.collection('Ktown_'+curr_year).aggregate(
        [
        {
          $unwind : '$Albums'
        },
        {
          $unwind: "$Albums.Sales.Today_Sales"
        },
        {
          $project:{
            "Artist" : 1,
            "Album" : "$Albums.Album",
            "Date" : "$Albums.Sales.Today_Sales.Date",
            "Sales":"$Albums.Sales.Today_Sales.Sales",
          }
        },
        {
          $group: {
            _id: {
              Date : "$Date",
              Artist : "$Artist"
            },
            Artist: {
              $first : "$Artist"
            },
            "Sales_Data" : {
              $push : {
                "Album" : "$Album",
                "Sales" : "$Sales"
              }
            }
          }
        },
        {
          $group: {
            _id: "$_id.Date",
            "Artist_Sales":{
              $push:{
                "Artist" : "$Artist",
                "Sales_Data" : "$Sales_Data",
                "totalSales" : {
                  $sum : "$Sales_Data.Sales"
                }
              }
            
            }
          }
        },
        {
          $project:{
            Date : { 
              $dateFromString  : {
                dateString : "$_id"
              }
            },
            Artist_Sales : 1
          }
        },
        {
          $match: {
            "$expr": {
              $gte: [
                "$Date",
                new Date((new Date().getTime() - limitTime_millisecond))
              ]
            },
        }},
        { $sort: { Date : 1} }
      
      ]

      ).project({'_id':0}).toArray()


      let latestDateObj_circleChart = await axios.post('https://circlechart.kr/data/api/chart_func/global/datelist',null,{
        params:{
          termGbn: 'week'
        }
      }).then((response) => response.data.List[0])

      let latestCircleChart_date = latestDateObj_circleChart.WeekStart
      let latestCircleChart_year = latestCircleChart_date.slice(0,4)
      let latestCircleChart_WeekNum = parseInt(latestDateObj_circleChart.WeekNum)


      let latest_ktownDate = await axios.get('https://www.ktown4u.com/chart100_new').then(response => {
              const dom = new JSDOM(response.data)
              let dateArray = Array.from(dom.window.document.querySelectorAll('div.dateSelect option'),(nodes) => nodes.textContent)
              return dateArray.slice(0,requestDate)
      })
      let latest_ktownYear = latest_ktownDate[0].substring(0,4)
      let latestKtown_Sales = await db.collection('Ktown_' + latest_ktownYear).aggregate(
        [
          {
              $match: {
                "Albums.Sales.Total_Sales.0.Date": {
                  $in: latest_ktownDate
                }
            }
          },
        
          {
              $project: {
                Artist: 1,
                Albums: {
                  $filter:{
                    input : "$Albums",
                    as : "album",
                    cond : {

                      $in: [{"$ifNull":[{ $first:  "$$album.Sales.Total_Sales.Date" },-1]},latest_ktownDate]

                  }
                }
              }
            }
          }
        
        ]
      ).project({'_id':0}).toArray()


      let latestCircleChart_Sales_Distribution_weekly = await db.collection('circleChart_weeklySales_' +latestCircleChart_year ).aggregate(
      [
        {
            $match: {
            "Albums":{
              $elemMatch: {
                "distribution":{
                  $size: 1,
                },
                "distribution.week" : latestCircleChart_WeekNum
              }
            }
          }
        },
        {
          $project: {
            Artist: 1,
            Albums: {
              $filter:{
                input : "$Albums",
                as : "album",
                cond : {
                  $and : [
                    {
                      $eq : [{$size :  { "$ifNull": [ "$$album.distribution", [] ] }},  1]
                    },
                    {
                      $eq: [{"$ifNull":[{$last: "$$album.distribution.week"},-1]}, latestCircleChart_WeekNum]
                    }
                  ]
                }
              }
            }
          }
        }
      ]
      ).project({'_id':0}).toArray()

      let latestCircleChart_Sales_Distribution_weekly_Artist = latestCircleChart_Sales_Distribution_weekly.map((obj) => obj.Artist)

      let latestCircleChart_Sales_OfflineSales_weekly = await db.collection('circleChart_weeklySales_' +latestCircleChart_year ).aggregate(
      [
        {
            $match: {
            "Albums":{
              $elemMatch: {
                "offlineSales":{
                  $size: 1,
                },
                "offlineSales.week" : latestCircleChart_WeekNum
              }
            },
            "Artist": {
              $nin : latestCircleChart_Sales_Distribution_weekly_Artist
            }
          
          }
        },
      
        {
          $project: {
            Artist: 1,
            Albums: {
              $filter:{
                input : "$Albums",
                as : "album",
                cond : {
                  $and : [
                    {
                      $eq : [{$size :  { "$ifNull": [ "$$album.offlineSales", [] ] }},  1]
                    },
                    {
                      $eq: [{"$ifNull":[{$last: "$$album.offlineSales.week"},-1]}, latestCircleChart_WeekNum]
                    }
                  ]
                }
              }
            }
          }
        }
      ]
      ).project({'_id':0}).toArray()

      let latestCircleChart_Sales_offlineSales_daily = await db.collection('circleChart_offlineSales_' +latestCircleChart_year ).aggregate(
      [
        {
            $match: {
            "Albums":{
              $elemMatch: {
                "foreignSales":{
                  $size: 1,
                },
                "foreignSales.Date" : latestCircleChart_date
              }
            }
          }
        },
        {
          $project: {
            Artist: 1,
            Albums: {
              $filter:{
                input : "$Albums",
                as : "album",
                cond : {
                  $and : [
                    {
                      $eq : [{$size :  { "$ifNull": [ "$$album.foreignSales", [] ] }},  1]
                    },
                    {
                      $eq: [{"$ifNull":[{$last: "$$album.foreignSales.Date"},-1]}, latestCircleChart_date]
                    }
                  ]
                }
              }
            }
          }
        }
      ]
      ).project({'_id':0}).toArray()

      
      let search_dateObj = new Date()
      search_dateObj.setUTCDate(new Date().getUTCDate() - requestDate)

      let searchObj = {
          year : search_dateObj.getUTCFullYear(),
          month : search_dateObj.getUTCMonth() + 1,
          day : search_dateObj.getUTCDate()
      }
      
      let circleChart_prev_7 = await db.collection('circleChart_Rank').aggregate(
        [
            {
                $match: {
                  'Rank.0.year': searchObj.year,
                  'Rank.0.month' : searchObj.month,
                  'Rank.0.day' :{
                      $gte: searchObj.day
                      }
                }
            },
        ]
      ).project({'_id':0}).toArray()//change back to back after development 
    
      let naverChart_prev_7= await db.collection('naverChart').aggregate(
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
                    $gte : search_dateObj
                  }
                }
            },
            {
              $project:{
                  compareDate: 0
              }
            }
        ]
      ).project({'_id':0}).toArray()
    
      let melonChart_prev_7 = await db.collection('melonChart').aggregate(
       
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
                        $gte : search_dateObj
                      }
                    }
                },
                {
                    $project:{
                        compareDate: 0
                    }
                }
            ]
      ).project({'_id':0}).toArray()

      let returnData = {
        newly_entered_to_chart: {
           circleChart : circleChart_prev_7,
           naverChart : naverChart_prev_7,
           melonChart : melonChart_prev_7
        },
        ktown_last_7days_sales : ktown_last_7days_sales,
        ktown_new_last_7days_sales : latestKtown_Sales,
        circleChart_new_distribution_weekly : latestCircleChart_Sales_Distribution_weekly,
        circleChart_new_offlineSales_weekly : latestCircleChart_Sales_OfflineSales_weekly,
        circleChart_new_offlineSales_daily : latestCircleChart_Sales_offlineSales_daily,
      }
      return returnData
    }
}
 