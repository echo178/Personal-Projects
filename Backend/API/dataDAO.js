import circleChart_globalChart, {checkGlobalDate} from '../musicAPI/circleChart_globalChart.js'
import {fetchCircleChart_digital, fetchCircleChart_Stream} from '../musicAPI/circleChart_digital.js'
import {fetchCircleChart_dis, fetchCircleChart_offline} from '../musicAPI/circleChart_weeklySalesChart.js'
import fetchGaonCircle_hourly from '../musicAPI/circleChart_offline_hour.js'
import fetchNaverChart from '../musicAPI/Naver.js'
import fetchMelonChart from '../musicAPI/Melon.js'
import fetchBugsChart from '../musicAPI/Bugs.js'
import { fetchHanteo_DigitalChart,fetchHanteo_AlbumSalesChart } from '../musicAPI/Hanteo.js'
import comebackSchedule from '../musicAPI/kcomeback.js'
import tweetCountFetch from '../socialmediaAPI/FetchGroupTweetCount.js'
import axios from  'axios'
import fetchKtownChart from '../musicAPI/ktown.js';
import youtubeViewFetch, { collectionNameGenerate, DBupdatefunction} from '../musicAPI/utube_track_3mnth.js'
import BatchSplit from '../socialmediaAPI/BatchSplit_TwtCB.js'
import fetchKpopDB,{fetchSoloistDatabase} from '../socialmediaAPI/kpopDB.js'
import {JSDOM } from 'jsdom'
import fetchYoutubeView_v2 from '../musicAPI/youtube_fetch_v2.js'

let db,currentDateObj, lastMonthDateObj, nextMonthDateObj;
currentDateObj = new Date()

lastMonthDateObj = new Date()
lastMonthDateObj.setUTCMonth(currentDateObj.getUTCMonth()-1)

nextMonthDateObj = new Date()
nextMonthDateObj.setUTCMonth(currentDateObj.getUTCMonth()+1)


export default class dataDAO {

  static async injectDB(conn){
      try{
          db = await conn.db(process.env.DB_NAME)

      }
      catch(e){
          console.log(e)
      }
  }
  static async updateChart(){
      try{
        console.log('updating Bugs,Hanteo,Naver & Melon Chart')
        
        let melonChart = await fetchMelonChart()
        let naverChart = await fetchNaverChart()
        let bugsChart = await fetchBugsChart()
        let hanteoChart = await fetchHanteo_DigitalChart()
        
        
      
        for(let i=0;i< melonChart.length; i++)
        {
         
        await db.collection('melonChart').findOneAndUpdate(
        {Artist: melonChart[i]['Artist'],Song: melonChart[i]['Song']},
        {
          $push:{순위: melonChart[i]['순위'][0],좋아요: melonChart[i]['좋아요'][0]},
          $set:{앨범: melonChart[i]['앨범'],Img: melonChart[i]['Img'],Source: melonChart[i]['Source'],songId: melonChart[i]['songId']}
        },
         {upsert:true})
        }
        
        
        for(let i=0;i< naverChart.length; i++)
        {
          
        await db.collection('naverChart').findOneAndUpdate(
        {Artist: naverChart[i]['Artist'],Song: naverChart[i]['Song']},
        {
          $set:{Img:naverChart[i]['Img'],Source: naverChart[i]['Source'],Album: naverChart[i]['Album']}, 
          $push:{Rank: naverChart[i]['Rank'][0],}
        },
         {upsert:true})
        }
        
        for(let i=0; i< bugsChart.length;i++)
        {
          await db.collection('bugsChart').findOneAndUpdate(
            {Artist: bugsChart[i]['Artist'],Song: bugsChart[i]['Song']},
            {
             $set:{Img:bugsChart[i]['Img'],Source: bugsChart[i]['Source'],Album: bugsChart[i]['Album']}, 
             $push:{Rank: bugsChart[i]['Rank'][0]}
            },
            {upsert:true})
        }
        
        
        for(let i =0; i<hanteoChart.length;i++){
          await db.collection('hanteoChart').findOneAndUpdate(
            {Artist: hanteoChart[i]['Artist'],Song: hanteoChart[i]['Song']},
            {
             $set:{Album: hanteoChart[i]['Album'],Artist_KR: hanteoChart[i]['Artist_KR'],
              Company: hanteoChart[i]['Company'],Img:hanteoChart[i]['Img'],Source: hanteoChart[i]['Source'],}, 
             $push:{Rank: hanteoChart[i]['Rank'][0]}
            },
            {upsert:true})
        }
        console.log('Naver & Melon Chart Updated')
    }
  catch(e){
    console.log(e)
  }
  }
  static async updateCircleChart_daily(){
    console.log('updating CircleChart Daily')
    let defaultObj = await axios.post('https://circlechart.kr/data/api/chart_func/global/datelist',null,{
      params:{
          termGbn: 'week'
      }
  }).then(response => response.data.List[0])
  let weekStart = defaultObj.WeekStart
  let weekNo = parseInt(defaultObj.WeekNum)
  let year = weekStart.substring(0,4)
  

  let globalDateCheckObj = await checkGlobalDate()
  let checkGlobal = await db.collection('circleChart_Rank').find({Rank:{ $elemMatch : globalDateCheckObj}}).project({Rank: 0}).limit(5).toArray()
  if(!checkGlobal?.length){
    let globalChart = await circleChart_globalChart()
    console.log('Updating global Chart')
    for(let i = 0; i < globalChart.length; i++){
    await db.collection('circleChart_Rank').findOneAndUpdate(
        {'Artist': globalChart[i].Artist,'Song': globalChart[i].Song},
        {$set: {
                'Album': globalChart[i].Album, 'Company' : globalChart[i].Company, 'DisCompany' : globalChart[i].DisCompany, 
            },$push:{Rank: globalChart[i].Rank[0]}}
        ,
        {upsert:true})
    }
  }
       
  let checkDig = await db.collection('circleChart_Digital_'+year).find({'digital.week' : weekNo }).project({digital : 0}).limit(5).toArray()
  if(!checkDig?.length){
      console.log('Updating Digital Chart')
      let digitalChart = await fetchCircleChart_digital(weekNo,year)
      for(let i = 0; i < digitalChart.length; i++){
      await db.collection('circleChart_Digital_' + year).findOneAndUpdate(
              {Artist: digitalChart[i].Artist },
              {$push: {digital : digitalChart[i].digital[0]}},
              {upsert: true})
      }
  }
  
  let checkStream = await db.collection('circleChart_Stream_' + year).find({'stream.week' : weekNo}).project({stream: 0}).limit(5).toArray()
  if(!checkStream.length){
      console.log('Updating Stream Chart')
      let streamChart = await fetchCircleChart_Stream(weekNo,year)
      for(let i = 0; i < streamChart.length; i++){
      await db.collection('circleChart_Stream_' + year).findOneAndUpdate(
              {Artist: streamChart[i].Artist },
              {$push: {stream : streamChart[i].stream[0]}},
              {upsert: true})
      }
  }
  
  let checkWeeklySales = await db.collection('circleChart_weeklySales_' + year).find({'Albums.offlineSales.week' : weekNo}).project({Albums: 0}).limit(5).toArray()
  if(!checkWeeklySales?.length){
    console.log('Updating OfflineSales Chart')
      let weeklyOfflineSalesChart = await fetchCircleChart_offline()
      for(let i = 0; i < weeklyOfflineSalesChart.length; i++){
      await db.collection('circleChart_weeklySales_' + year).findOneAndUpdate(
          { Artist: weeklyOfflineSalesChart[i].Artist },
          [{
            $set:{
                Albums: {
                  $cond:[  
                    {$in:[weeklyOfflineSalesChart[i].Albums[0].Album,{ $ifNull: [ "$Albums.Album",[]]  }]},
                    {$map: {
                      input : "$Albums",
                      in :{
                        $cond:[  
                          {$eq:['$$this.Album', weeklyOfflineSalesChart[i].Albums[0].Album ]},
                          {offlineSales:{$concatArrays: [{$ifNull:['$$this.offlineSales',[]]},weeklyOfflineSalesChart[i].Albums[0].offlineSales]},Album:"$$this.Album",distribution:'$$this.distribution'},
                          '$$this'
                        ] 
                      } 
                   }},
                  {$concatArrays:[
                    {$ifNull: ["$Albums", []] },weeklyOfflineSalesChart[i].Albums]
                  }
                ]
                }
              } 
          }],
        { upsert: true } )
      }
  }
  
  let checkDistribution = await db.collection('circleChart_weeklySales_'+year).find({'Albums.distribution.week' : weekNo}).project({Albums: 0}).limit(5).toArray()
  if(!checkDistribution?.length){
    console.log('Updating Distribution Chart')
      let distributionChart = await fetchCircleChart_dis()
      for(let i = 0; i < distributionChart.length; i++){
      await db.collection('circleChart_weeklySales_' + year).updateOne(
          { Artist: distributionChart[i].Artist },
          [{
            $set:{
                Albums: {
                  $cond:[  
                    {$in:[distributionChart[i].Albums[0].Album,{ $ifNull: [ "$Albums.Album",[]]  }]},
                    {$map: {
                      input : "$Albums",
                      in :{
                        $cond:[  
                          {$eq:['$$this.Album', distributionChart[i].Albums[0].Album ]},
                          {distribution:{$concatArrays: [{$ifNull:['$$this.distribution',[]]},distributionChart[i].Albums[0].distribution]},Album:"$$this.Album",offlineSales:'$$this.offlineSales'},
                          '$$this'
                        ] 
                      } 
                   }},
                  {$concatArrays:[
                    {$ifNull: ["$Albums", []] },distributionChart[i].Albums]
                  }
                ]
                }
              } 
          }],
      { upsert: true }) } 
  }
      
  await db.collection('circleChart_weeklySales_'+year).updateMany({},
    [
      {
        $set: {
          Albums: {
            $map: {
              input: "$Albums",
              in: {
                $mergeObjects: [
                  "$$this",
                  {
                    totalDistribution: {
                      $sum: "$$this.distribution.distributionVol",
                    },
                    totalOfflineSales:{
                      $sum: "$$this.offlineSales.totalOfflineSales",
                    },
                    totalSales: {
                      $add : [{
                          $sum: "$$this.distribution.distributionVol",
                        },{
                          $sum: "$$this.offlineSales.totalOfflineSales",
                        }]
                    }
                  }]
              }
              }
            },
          }
      }
    ]
  )
  await db.collection('circleChart_weeklySales_'+year).updateMany({},
    [
      {
        $set:{TotalSales :{
          $sum : '$Albums.totalSales'
      }}
      }
  ])
  let rankIndex = await db.collection('circleChart_Rank').indexExists("Artist_text").catch(error => false)
  if(!rankIndex){
    await db.collection('circleChart_Rank').createIndex({Artist : "text"})
  }
  let digIndex = await db.collection('circleChart_Digital_'+year).indexExists("Artist_text").catch(error => false)
  if(!digIndex){
    await db.collection('circleChart_Digital_'+year).createIndex({Artist : "text"})
  }
  
  let streamIndex = await db.collection('circleChart_Stream_'+year).indexExists("Artist_text").catch(error => false)
  if(!streamIndex){
    await db.collection('circleChart_Stream_'+year).createIndex({Artist : "text"})
  }
  let weekSalesIndex = await db.collection('circleChart_weeklySales_'+year).indexExists("Artist_text").catch(error => false)
  if(!weekSalesIndex){
    await db.collection('circleChart_weeklySales_'+year).createIndex({Artist : "text"})
    }
  }
  static async circleChart_Hourly(){
  let dateObj = await axios.post('https://circlechart.kr/data/api/chart_func/retail/hour_time',null,{
    params:{
      termGbn: 'hour'
    }
  }).then(response => response.data)
  let dateNum = dateObj.YYYYMMDD
  let year = dateNum.substring(0,4)
  let hourRangeString = dateObj.Hour_Range.toString()
  let ListType = dateObj.ListType
  let circleOfflineHourSales = await fetchGaonCircle_hourly(dateNum,hourRangeString,ListType)
  console.log('Updating circleChart Hourly Sales')
  for(let i = 0 ; i < circleOfflineHourSales.length; i++ ){
  await db.collection('circleChart_offlineSales_' + year).findOneAndUpdate(
  {Artist: circleOfflineHourSales[i].Artist},
  [
    {$set:
      {
        Albums: 
          {
            $cond:[{$in:[circleOfflineHourSales[i].Albums[0].Album,{$ifNull:['$Albums.Album',[]]}]},
              {
                $map:
                {
                input: '$Albums',
                in: 
                {
                $cond:[{$eq:['$$this.Album',circleOfflineHourSales[i].Albums[0].Album]},
                        {$cond:[{$in:[circleOfflineHourSales[i].Albums[0].foreignSales[0].Date,{$ifNull:['$$this.foreignSales.Date',[]]}]},
                        {
                          foreignSales:{
                          $map:{
                            input:'$$this.foreignSales',
                            as: 'fs' ,
                            in :
                              {
                                $cond:[{$eq:['$$fs.Date',circleOfflineHourSales[i].Albums[0].foreignSales[0].Date]},
                                  {$mergeObjects:[
                                    '$$fs',circleOfflineHourSales[i].Albums[0].foreignSales[0]
                                  ]
                                  },
                                '$$fs'
                                  ]
                              }
                            }},
                          koreaSales:{
                          $map:{
                            input:'$$this.koreaSales',
                            as: 'ks' ,
                            in :
                              {
                                $cond:[{$eq:['$$ks.Date',circleOfflineHourSales[i].Albums[0].foreignSales[0].Date]},
                                {$mergeObjects:[
                                  '$$ks',circleOfflineHourSales[i].Albums[0].koreaSales[0]
                                ]
                                },
                                '$$ks'
                                ]
                            }
                          }},
                        Album: '$$this.Album'
                        },
                        {
                          foreignSales:{$concatArrays:[{$ifNull:['$$this.foreignSales',[]]},circleOfflineHourSales[i].Albums[0].foreignSales]},
                          koreaSales:{$concatArrays:[{$ifNull:['$$this.koreaSales',[]]},circleOfflineHourSales[i].Albums[0].koreaSales]},
                          Album:'$$this.Album'
                        }
                          ]
                            },
                      '$$this'
                      ]
                  }
                }
              },
              {$concatArrays:[{$ifNull:['$Albums',[]]},circleOfflineHourSales[i].Albums]}]    
          }
      }
    }
  ],
  {upsert:true}
    ) 
  }
  let result = await db.collection('circleChart_offlineSales_' +year).updateMany({},
    [
        {
          $set: {
            Albums: {
              $map: {
                input: "$Albums",
                in: {
                  $mergeObjects: [
                    "$$this",
                    {
                      'totalForeignSales': {
                        $sum: "$$this.foreignSales.sumForeignSales",
                      },
                      'totalKoreaSales':{
                        $sum: "$$this.koreaSales.sumKoreaSales",
                      },
                      'totalSales': {
                        $add : [{
                            $sum: "$$this.foreignSales.sumForeignSales",
                          },{
                            $sum: "$$this.koreaSales.sumKoreaSales",
                          }],
                      },
                      lastKoreaSales: {
                        $arrayElemAt: [
                          "$$this.koreaSales.sumKoreaSales",
                          -1
                        ]
                      },
                      lastForeignSales:{
                          $arrayElemAt: [
                              "$$this.foreignSales.sumForeignSales",
                              -1
                          ]
                      },
                      lastTotalSales:{
                          $add:[{$arrayElemAt: [
                              "$$this.koreaSales.sumKoreaSales",
                              -1
                            ]},{$arrayElemAt: [
                              "$$this.foreignSales.sumForeignSales",
                              -1
                          ]}]
                      }
                    }]
                }
                }
              },
            }
        }
          
      ]
  )
  await db.collection('circleChart_offlineSales_'+year).updateMany({},
    [
      {
        $set:{TotalSales :{
          $sum : '$Albums.totalSales'
      }}
      }
  ])   
  let offSalesIndex = await db.collection('circleChart_offlineSales_'+year).indexExists("Artist_text").catch(err => false) 
  if(!offSalesIndex){
    await db.collection('circleChart_offlineSales_'+year).createIndex({Artist : "text"})
  }
  }
  static async updateWatchlist(){
    try{
    console.log('updating Watchlist')
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const d = new Date()
    let nextMonth_dateObj = new Date()
    nextMonth_dateObj.setUTCMonth(d.getUTCMonth() + 1,1)
    let currMonthName = month[d.getUTCMonth()]
    let currYear = d.getUTCFullYear()
    let collectionName = "watchlist_" + currMonthName + currYear
    let nextMonth = month[nextMonth_dateObj.getUTCMonth()]
    let nextYear = nextMonth_dateObj.getUTCFullYear() 
    let nxtCollectionName = "watchlist_" + nextMonth + nextYear
    let nxtMonthURL = "https://kpopofficial.com/kpop-comeback-schedule-" + nextMonth +"-"+ currYear
    
    let url = "https://kpopofficial.com/kpop-comeback-schedule-"+currMonthName+"-"+currYear
    
    let fetchedSchedule = await comebackSchedule(url)
    let currentDayNo = d.getUTCDate()     
    for(let i=0; i< fetchedSchedule.length;i++){
        if(i === 0 || i%50 === 0 ){
          console.log( 'Updating ' + collectionName + ' ' + i + ' / ' + fetchedSchedule.length)
        } 
      
      await db.collection(collectionName).findOneAndUpdate(
        {Artist: fetchedSchedule[i]['Artist']},
        [{
        $project:{
        Date:{$cond:[{$ne:[ "$Date",fetchedSchedule[i]['Date']] },
            fetchedSchedule[i]['Date'],
            "$Date"
        ]},
        Album:{$cond:[{$or:[{$eq:[ "$Album",' ']},{$eq:[ "$Album",'']},{$not:[ "$Album"]}] },
             fetchedSchedule[i]['Album'],
            "$Album"
        ]},
        Day:{$cond:[{$or:[{$eq:[ "$Day",' ']},{$eq:[ "$Day",'']},{$not:[ "$Day"]}] },
            fetchedSchedule[i]['Day'],
            "$Day"
        ]},
        Song:{$cond:[{$or:[{$eq:[ "$Song",' ']},{$eq:[ "$Song",'']},{$not:[ "$Song"]}]},
            fetchedSchedule[i]['Song'],
            "$Song"]},
          Artist: 1,
          tweetCount_Global: 1,
          tweetCount_KR: 1,
          tweetCountTotal_KR: 1,
          tweetCountTotal_Global: 1,
          sumTweetOfDay:1,
          relatedGroups: 1,
          views_2: 1,
        }
        }],
        {upsert:true}
      )
    }
    if(currentDayNo >= 15){
      let nextMonthSchedule = await comebackSchedule(nxtMonthURL)
      for(let i=0; i< nextMonthSchedule.length;i++){
        if(i === 0 || i%50 === 0 ){
        console.log( 'Updating ' + nxtCollectionName + ' ' + i + ' / ' + nextMonthSchedule.length)
        }
        await db.collection(nxtCollectionName).findOneAndUpdate(
        {Artist: nextMonthSchedule[i]['Artist']},
        [{
        $project:{
        Date:{$cond:[{$ne:[ "$Date",nextMonthSchedule[i]['Date']] },
        nextMonthSchedule[i]['Date'],
            "$Date"
        ]},
        Album:{$cond:[{$ne:[ "$Album",nextMonthSchedule[i]['Album']] },
        nextMonthSchedule[i]['Album'],
            "$Album"
        ]},
        Day:{$cond:[{$ne:[ "$Day",nextMonthSchedule[i]['Day']] },
        nextMonthSchedule[i]['Day'],
            "$Day"
        ]},
        Song:{$cond:[{$ne:[ "$Song",nextMonthSchedule[i]['Song']] },
        nextMonthSchedule[i]['Song'],
            "$Song"]},
        Artist: 1,
        tweetCount_Global: 1,
        tweetCount_KR: 1,
        tweetCountTotal_KR: 1,
        tweetCountTotal_Global: 1,
        sumTweetOfDay:1,
        relatedGroups: 1,
        views_2: 1,
        }
    }],
        {upsert:true}
        )
      }
      let nxtIndex = await db.collection(nxtCollectionName).indexExists("nameSearch").catch(err => false)
      if(!nxtIndex){
      await db.collection(nxtCollectionName).createIndex({Artist : "text",relatedGroups: "text"},{name:"nameSearch"})
      console.log(nxtCollectionName + 'Search by Name index created')
      } 
    }
  
    let index = await db.collection(collectionName).indexExists("nameSearch").catch(err => false)
    if(!index){
      await db.collection(collectionName).createIndex({Artist : "text",relatedGroups: "text"},{name:"nameSearch"})
      console.log(collectionName + 'Search by Name index created')
    }

    console.log('Watchlist Checked and Updated')

}
catch(e){
  console.log(e)
}
  }
  static async updateKtownChart(){
    console.log('Updating Ktown Chart')
  let collectionName
  let year
    try{
      year =await axios.get('https://www.ktown4u.com/chart100_new').then(response => {
        const dom = new JSDOM(response.data)
        let dateArray = Array.from(dom.window.document.querySelectorAll('div.dateSelect option'),(nodes) => nodes.textContent)
        return dateArray[0].substring(0,4)
    })
      collectionName = 'Ktown_' + year
      let chart = await fetchKtownChart()
      for(let i = 0 ; i < chart.length; i ++){
        await db.collection(collectionName).findOneAndUpdate(
          {Artist: chart[i].Artist},
          [
            {$set:
              {
                Albums: 
                  {
                    $cond:[{$in:[chart[i].Albums[0].Album,{$ifNull:['$Albums.Album',[]]}]},
                      {
                        $map:
                        {
                        input: '$Albums',
                        in: 
                        {
                        $cond:[{$eq:['$$this.Album',chart[i].Albums[0].Album]},
                              {$cond:[{$in:[chart[i].Albums[0].Sales.Today_Sales[0].Date,{$ifNull:['$$this.Sales.Today_Sales.Date',[]]}]},
                                {
                                  $mergeObjects:[ '$$this',{Sales:{
                                  Today_Sales:{
                                  $map:{
                                    input:'$$this.Sales.Today_Sales',
                                    as: 'ts' ,
                                    in :
                                      {
                                        $cond:[{$eq:['$$ts.Date',chart[i].Albums[0].Sales.Today_Sales[0].Date]},
                                          chart[i].Albums[0].Sales.Today_Sales[0],
                                        '$$ts'
                                          ]
                                      }
                                    }},
                                  Total_Sales:{
                                  $map:{
                                    input:'$$this.Sales.Total_Sales',
                                    as: 'tts' ,
                                    in :
                                      {
                                        $cond:[{$eq:['$$tts.Date',chart[i].Albums[0].Sales.Total_Sales[0].Date]},
                                         chart[i].Albums[0].Sales.Total_Sales[0],
                                        '$$tts'
                                        ]
                                    }
                                  }}}}
                               ]
                                },
                                {$mergeObjects:['$$this',
                                  {Sales:{Today_Sales:{$concatArrays:[{$ifNull:['$$this.Sales.Today_Sales',[]]},chart[i].Albums[0].Sales.Today_Sales]},
                                  Total_Sales:{$concatArrays:[{$ifNull:['$$this.Sales.Total_Sales',[]]},chart[i].Albums[0].Sales.Total_Sales]}}},
                                 ]
                                }
                                  ]
                              },
                              '$$this'
                              ]
                          }
                        }
                      },
                      {$concatArrays:[{$ifNull:['$Albums',[]]},chart[i].Albums]}]    
                  }
              }
            }
          ],
          {upsert:true}
        )
      }
      await db.collection(collectionName).updateMany({},[
          {
            $set: {
              Albums: {
                $map: {
                  input: "$Albums",
                  in: {
                    $mergeObjects: [
                      "$$this",
                      {
                        totalSales: {
                          $arrayElemAt: [
                            "$$this.Sales.Total_Sales.Sales",
                            -1
                          ]
                        },
                      }
                    ]
                  }
                }
              }
            }
          }
      ])
      await db.collection(collectionName).updateMany({}, 
      [{
          $addFields:{
              TotalSales: {$sum: '$Albums.totalSales'}
          }
      }],
      )
    }
    catch(e){
      console.log(e)
    }
    let index = await db.collection('Ktown_' +year).indexExists("Artist_text").catch(err => false)
    if(!index){
      await db.collection('Ktown_'+year).createIndex({Artist : "text"})
    }
  }
  static async updateHanteoAlbumSalesChart(){
    console.log('Updating Hanteo Album Sales')
    let chart = await fetchHanteo_AlbumSalesChart()
    for(let i = 0; i < chart.length;i++){
      await db.collection('hanteoChart_albumSales').findOneAndUpdate(
          {Artist: chart[i].Artist},
          [
              {$set:
                  {
                      Artist_KR : chart[i].Artist_KR,
                      Company: chart[i].Company,
                      Source: chart[i].Source,
                      Albums: {
                          $cond:[{$in:[chart[i].Albums[0].Album,{$ifNull:['$Albums.Album',[]]}]},
                          {
                              $map:{
                                  input: '$Albums',
                                  in : {
                                      $cond:[{$eq:['$$this.Album',chart[i].Albums[0].Album]},
                                      {$mergeObjects: ['$$this',{Sales: { $concatArrays: [ '$$this.Sales',chart[i].Albums[0].Sales] }}]},
                                          '$$this'    
                                      ]
                                  }
                          }
                      },
                          {$concatArrays:[{$ifNull:['$Albums',[]]},chart[i].Albums]}]    
                      }
                  }
              }
          ],
          {upsert:true}
      )
    }
    
  }
  static async updateYoutubeView(){
    try{
      console.log('Youtube View Updating')
    let promiseArray = new Array()
    let currMonthSchedule, prev_1month_Schedule,prev_2month_Schedule
    let currTime = new Date()
    const [currMonth_collection, prev_1_Month_collection, prev_2_Month_collection] = collectionNameGenerate()
    

// request for the array to search     
      try {
        currMonthSchedule = await db.collection(currMonth_collection).find({}).project({tweetCount_Global: 0,tweetCount_KR: 0,Views:0,totalViewCount: 0,tweetCountTotal_KR: 0,tweetCountTotal_Global:0}).toArray()
      }
      catch(e){
              await this.updateWatchlist()
              console.log(e)
          }    

      try {
        prev_1month_Schedule = await db.collection(prev_1_Month_collection).find({}).project({tweetCount_Global: 0,tweetCount_KR: 0,Views:0,totalViewCount:0,tweetCountTotal_KR:0,tweetCountTotal_Global:0}).toArray()
        
      }
      catch(e){
          console.log(e)
      }
      try{
        prev_2month_Schedule = await db.collection(prev_2_Month_collection).find({Day: {$gt : currTime.getUTCDate()}}).project({tweetCount_Global: 0,tweetCount_KR: 0,Views:0,totalViewCount:0,tweetCountTotal_KR:0,tweetCountTotal_Global:0}).toArray()
      }
      catch(e){
          console.log(e)
      }

// youtube view fetching stage
      if(currMonthSchedule?.length){
        currMonthSchedule = await youtubeViewFetch(currMonthSchedule, true)
        promiseArray.push(DBupdatefunction(currMonthSchedule,currMonth_collection,db))
      }
    
      if(prev_1month_Schedule?.length){
        prev_1month_Schedule = await youtubeViewFetch(prev_1month_Schedule)
        promiseArray.push(DBupdatefunction(prev_1month_Schedule,prev_1_Month_collection,db))
      }
      if(prev_2month_Schedule?.length){
        prev_2month_Schedule = await youtubeViewFetch(prev_2month_Schedule)
        promiseArray.push(DBupdatefunction(prev_2month_Schedule,prev_2_Month_collection,db))
      }
    
    let index = await db.collection(currMonth_collection).indexExists("totalViewcount").catch(err => false)
    if(!index){
    await db.collection(currMonth_collection).createIndex({totalViewCount : -1},{name: 'totalViewcount'})
    console.log(currMonth_collection + ' youtube view count index created')
    }
  // uploading new data to db
    await Promise.allSettled(promiseArray)
    console.log('YoutubeView updated')
  }
catch(e){
  console.log(e)
}
  }
  static async updateKpopDB(){
  let chart = await fetchKpopDB()
  console.log('Updating KpopDB')
  for(let i = 0; i< chart.length; i++){
    if(chart[i].artistFullName_Eng !== 'TOO'){
      await db.collection('kpopDB').findOneAndUpdate(
        {artistFullName_Eng: chart[i].artistFullName_Eng,artistName_KR: chart[i].artistName_KR},
        {$set:{artistShortName_Eng: chart[i].artistShortName_Eng,Debut_Date: chart[i].Debut_Date,companyName: chart[i].companyName,currentMember: chart[i].currentMember,
        originalMember: chart[i].originalMember,Fandom_Name:chart[i].Fandom_Name,activeStatus: chart[i].activeStatus,index: i}},
        {upsert:true})
    } // cause tweet Count search Error when fetching daily tweetCount of groups
  }
  let chart2 = await fetchSoloistDatabase()
  for(let i = 0 ; i < chart2.length; i++){
    await db.collection('kpopDB_individual').findOneAndUpdate(
      {stageName: chart2[i].stageName,fullName: chart2[i].fullName},
      {$set:{
        krFullName: chart2[i].krFullName,krStageName: chart2[i].krStageName,dateOfBirth:chart2[i].dateOfBirth,
        group: chart2[i].group,country: chart2[i].country,height: chart2[i].height,birthplace: chart2[i].birthplace,
        otherGroup: chart2[i].otherGroup,position:chart2[i].position,IG: chart2[i].IG,gender: chart2[i].gender}
      },
      {upsert:true}
    )
  }
  }
  static async updateGroupTweetCount(){
      const token = Buffer.from(`${process.env.twitter_APIkey}:${process.env.twitter_APIkeySecret}`, 'utf8').toString('base64')

      let accessToken = await axios.post('https://api.twitter.com/oauth2/token?grant_type=client_credentials',
      null,
      {
          headers: {
          'Content-Type': `application/x-www-form-urlencoded;charset=UTF-8`,
          'authorization': `Basic ${token}`
        }}).then(response => 
        {
          return response.data.access_token
        })
       
      let currentDateObj = new Date()
      let lastmonth_DateObj = new Date()
      lastmonth_DateObj.setUTCDate(0)
      const month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
      let currMonthName = month[currentDateObj.getUTCMonth()]
      let lastMonthName = month[lastmonth_DateObj.getUTCMonth()]
      let lastYear = lastmonth_DateObj.getUTCFullYear()
      let currYear = currentDateObj.getUTCFullYear()
      let collectionName = 'GroupsTweetCount_'+ currMonthName + currYear
      let prevCollectionName = 'GroupsTweetCount_' + lastMonthName + lastYear
      let checkCollectionExist = await db.collection(collectionName).findOne({})
      if(!checkCollectionExist){
        let result = await db.collection('kpopDB').aggregate([ 
            {$match : {activeStatus : 'Yes'}},
            {$project: {
                group_EngFullName: "$artistFullName_Eng", 
                group_EngShortName: "$artistShortName_Eng",
                group_KRName: "$artistName_KR",
                group_Fandom: "$Fandom_Name",
                tweetCount_KR : [],
                tweetCount_Global : []

            }},{
                $out: collectionName
            }]).toArray()
        console.log('Collection created as ' + collectionName)
      }
      else{
        let documentsNotExistInCurrMonthCollection = await db.collection('kpopDB').aggregate([
          {
              "$lookup": {
                "from": collectionName,
                "localField": "artistFullName_Eng",
                "foreignField": "group_EngFullName",
                "as": "currentColl"
              }
          },
          {
              $match:{
                  $and:[{
                      'currentColl.group_EngFullName':{
                          $exists: false
                      }
                  },
                  {
                      activeStatus:'Yes'
                  }

                  ]

              }
          },
          {
              $project:{
                  'currentColl.tweetCount_Global':0,
                  'currentColl.tweetCount_KR':0,
                  'currentColl.sumTweetOfDay' : 0,

              }
          },
          {
            $project: {
              group_EngFullName: "$artistFullName_Eng", 
              group_EngShortName: "$artistShortName_Eng",
              group_KRName: "$artistName_KR",
              group_Fandom: "$Fandom_Name",
              tweetCount_KR : [],
              tweetCount_Global : []  
            }
          }
            ]).toArray()
            if(documentsNotExistInCurrMonthCollection.length > 0){
              let result = await db.collection(collectionName).insertMany(documentsNotExistInCurrMonthCollection)
              console.log(result.insertedCount + ' document has been inserted')
            }
      }
      let fetchedTweet2
      let fetchDocs = await db.collection(collectionName).find({}).toArray()
      let currMnthChartBatch1 = fetchDocs.slice(0,130)
      let currMnthChartBatch2 = fetchDocs.slice(130)
      let promise1 = new Promise((resolve) => {
          setTimeout(async() => {
             fetchedTweet2 = await tweetCountFetch(accessToken,currMnthChartBatch2)
            resolve(fetchedTweet2);
          }, 900* 1000);
        });
      let fetchedTweet1 = await tweetCountFetch(accessToken,currMnthChartBatch1)
      
      for(let i =0; i< fetchedTweet1.length; i++){
      
        if(i%50 == 0){
        console.log('Updating TweetCount of Groups - Batch 1 ' + i + ' / ' + fetchedTweet1.length )
        }
        if(currentDateObj.getUTCDate() === 1 && fetchedTweet1[i].lastMonthData){
          await db.collection(prevCollectionName).findOneAndUpdate(
            {
              group_EngFullName: fetchedTweet1[i].group_EngFullName,
              tweetCount_KR:{'$elemMatch':{Date : fetchedTweet1[i].lastMonthData[0].Date}},
              tweetCount_Global:{'$elemMatch':{Date : fetchedTweet1[i].lastMonthData[1].Date}},
              sumTweetOfDay: {'$elemMatch':{Date:fetchedTweet1[i].lastMonth_SumTweetOfDay.Date}}
            },
            {
              $set:{
              "tweetCount_KR.$": fetchedTweet1[i].lastMonthData[0],
              "tweetCount_Global.$": fetchedTweet1[i].lastMonthData[1],
              "sumTweetOfDay.$":fetchedTweet1[i].lastMonth_SumTweetOfDay
              }
            })
        }
          await db.collection(collectionName).findOneAndUpdate(
          {group_EngFullName: fetchedTweet1[i].group_EngFullName},
          {
            $set: {
              tweetCount_Global : fetchedTweet1[i].tweetCount_Global, 
              tweetCount_KR: fetchedTweet1[i].tweetCount_KR,
              sumTweetOfDay: fetchedTweet1[i].sumTweetOfDay,
              tweetCountTotal_KR:fetchedTweet1[i].tweetCountTotal_KR,
              tweetCountTotal_Global:fetchedTweet1[i].tweetCountTotal_Global
            }
          })
      }
    
      fetchedTweet2 = await promise1
      for(let i =0; i< fetchedTweet2.length; i++){
        if(i %50 == 0){
        console.log('Updating TweetCount of Groups - Batch 2 ' + i + ' / ' + fetchedTweet2.length )
        }
        if(currentDateObj.getUTCDate() === 1 && fetchedTweet2[i].lastMonthData){
          await db.collection(prevCollectionName).findOneAndUpdate(
            {
              group_EngFullName: fetchedTweet2[i].group_EngFullName,
              tweetCount_KR:{'$elemMatch':{Date : fetchedTweet2[i].lastMonthData[0].Date}},
              tweetCount_Global:{'$elemMatch':{Date : fetchedTweet2[i].lastMonthData[1].Date}},
              sumTweetOfDay: {'$elemMatch':{Date:fetchedTweet2[i].lastMonth_SumTweetOfDay.Date}}
            },
            {
            $set:{
              "tweetCount_KR.$": fetchedTweet2[i].lastMonthData[0],
              "tweetCount_Global.$": fetchedTweet2[i].lastMonthData[1],
              "sumTweetOfDay.$":fetchedTweet2[i].lastMonth_SumTweetOfDay
              }
            })
        }
          await db.collection(collectionName).findOneAndUpdate(
          {group_EngFullName: fetchedTweet2[i].group_EngFullName},
          {
            $set: {
              tweetCount_Global : fetchedTweet2[i].tweetCount_Global, 
              tweetCount_KR: fetchedTweet2[i].tweetCount_KR,
              sumTweetOfDay: fetchedTweet2[i].sumTweetOfDay,
              tweetCountTotal_KR:fetchedTweet2[i].tweetCountTotal_KR,
              tweetCountTotal_Global:fetchedTweet2[i].tweetCountTotal_Global
            }
          })
      }
      let index = await db.collection(collectionName).indexExists("totalTweetCount").catch(err => false)
      if(!index){
        await db.collection(collectionName).createIndex({tweetCountTotal_KR : -1,tweetCountTotal_Global: -1},{name: 'totalTweetCount'})
        console.log(collectionName + ' tweet Count index created')
        }
      let textIndex = await db.collection(collectionName).indexExists("nameSearch").catch(err => false)
      if(!textIndex){
        await db.collection(collectionName).createIndex({group_EngFullName:"text",group_EngShortName:"text",group_KRName:"text"},{name:"nameSearch"})
      }
      console.log('Updated TweetCount')
  }
  static async updateTweetCountComeback(){
  const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date()
  let nextMonth_dateObj = new Date()
  nextMonth_dateObj.setUTCMonth(d.getUTCMonth() +1,1)
  let currMonthName = month[d.getUTCMonth()]
  let currYear = d.getUTCFullYear()
  let collectionName = "watchlist_" + currMonthName + currYear
  let nxtMonthChart
  let nextMonth = month[nextMonth_dateObj.getUTCMonth()]
  let nextYear = nextMonth_dateObj.getUTCFullYear()
  let nxtCollectionName = 'watchlist_' + nextMonth + nextYear
  let currMnthChart = await db.collection(collectionName).find({relatedGroups:{$exists:true}}).project({Views: 0}).toArray()
  if(d.getUTCDate() >= 15){
      nxtMonthChart = await db.collection(nxtCollectionName).find({}).project({Views: 0}).toArray()
  }
  const token = Buffer.from(`${process.env.twitter_APIkey}:${process.env.twitter_APIkeySecret}`, 'utf8').toString('base64')
  let accessToken = await axios.post('https://api.twitter.com/oauth2/token?grant_type=client_credentials',
  null,
  {
      headers: {
      'Content-Type': `application/x-www-form-urlencoded;charset=UTF-8`,
      'authorization': `Basic ${token}`
    }}).then(response => {

      return response.data.access_token
     })
  if(nxtMonthChart?.length){
    await BatchSplit(currMnthChart,nxtMonthChart,db,accessToken,collectionName,nxtCollectionName)
  }
  if(!nxtMonthChart?.length){
    await BatchSplit(currMnthChart,false,db,accessToken,collectionName,false)
  }
  let index = await db.collection(collectionName).indexExists("totalTweetCount").catch(err => false)
  if(!index){
    await db.collection(collectionName).createIndex({tweetCountTotal_KR : -1,tweetCountTotal_Global: -1},{name: 'totalTweetCount'})
    console.log(collectionName + ' Tweet Count index created')
    }
    console.log(collectionName + ' tweetCount updated')
  }
  static async updateYoutubeView_2_focus(){
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let currentMonthName = months[currentDateObj.getUTCMonth()]
    

    let currentMonthCollectioName = 'watchlist_'+ currentMonthName + currentDateObj.getUTCFullYear()

    let currDate = currentDateObj.getUTCDate()
    let prev_1_day = new Date(currentDateObj)
    prev_1_day.setUTCDate(currentDateObj.getUTCDate() - 1)
    let prev_2_day = new Date(currentDateObj)
    prev_2_day.setUTCDate(currentDateObj.getUTCDate() - 2)
      
    let prev_days_Array = [ prev_2_day.getUTCDate(),prev_1_day.getUTCDate(),currDate]

    let currMonthFocusData = await db.collection(currentMonthCollectioName).find(
    {
        $and:
        [
            {
              views_2:{$exists:true}
            },
            {
            Day:{    
              $in: prev_days_Array                                                         
            }               
        }
        ]
    }).project({tweetCount_Global : 0,tweetCount_KR: 0, Views: 0,sumTweetOfDay: 0}).toArray()
    await fetchYoutubeView_v2(db,currentMonthCollectioName,currMonthFocusData)

    if(currentDateObj.getUTCDate() <= 2){
      let firstDayIndex = prev_days_Array.indexOf(1)
      prev_days_Array.splice(firstDayIndex,1) // remove first day from the array coz it matches with last month first day, occur on the 2nd of the month

      let lastMonthName = months[lastMonthDateObj.getUTCMonth()]
      let  lastMonthCollectionName = 'watchlist_'+ lastMonthName + lastMonthDateObj.getUTCFullYear()
      let lastMonthFocusData = await db.collection(lastMonthCollectionName).find(
        {
            $and:
            [
                {
                  views_2:{$exists:true}
                },
                {
                Day:{    
                  $in: prev_days_Array                                                         
                }               
            }
            ]
      }).project({tweetCount_Global : 0,tweetCount_KR: 0, Views: 0,sumTweetOfDay: 0}).toArray()
      await fetchYoutubeView_v2(db,lastMonthCollectionName,lastMonthFocusData)
    }
  }//deprecated coz not effective significantly more than hourly
  static async updateYoutubeView_2_regular_3_month(){
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      
    let currentDateObj = new Date()
      
    let prev_2_month_DateObj = new Date(currentDateObj)
    prev_2_month_DateObj.setUTCMonth(currentDateObj.getUTCMonth() - 2)
      
    let prev_1_month_DateObj = new Date(currentDateObj)
    prev_1_month_DateObj.setUTCMonth(currentDateObj.getUTCMonth() - 1)
      
    let prev_2_monthName = month[prev_2_month_DateObj.getUTCMonth()]
    let prev_1_monthName = month[prev_1_month_DateObj.getUTCMonth()]
    let current_monthName = month[currentDateObj.getUTCMonth()]
      
    let prev_2_month_collectionName = 'watchlist_' + prev_2_monthName + prev_2_month_DateObj.getUTCFullYear()
    let prev_1_month_collectionName = 'watchlist_' + prev_1_monthName + prev_1_month_DateObj.getUTCFullYear()
    let current_month_collectionName = 'watchlist_' + current_monthName + currentDateObj.getUTCFullYear()
      
    let prev_2_month_list = await db.collection(prev_2_month_collectionName).find(
      {$and:[
              {
                  views_2:{
                      $exists:true
                  }
              },
              {
                  Day:{
                      $lte:prev_2_month_DateObj.getUTCDate()
                  }
              }
          ]
      
    }).project({_id:0,tweetCount_Global : 0,tweetCount_KR: 0, Views: 0,sumTweetOfDay: 0}).toArray()
     
    await fetchYoutubeView_v2(db,prev_2_month_collectionName,prev_2_month_list)
    
    let prev_1_month_list = await db.collection(prev_1_month_collectionName).find({
          views_2:{
              $exists:true
          }
    }).project({_id:0,tweetCount_Global : 0,tweetCount_KR: 0, Views: 0,sumTweetOfDay: 0}).toArray()
      
    await fetchYoutubeView_v2(db,prev_1_month_collectionName,prev_1_month_list)

    let current_month_list = await db.collection(current_month_collectionName).find(
      {$and:[
        {
            views_2:{
                $exists:true
            }
        },
    ]
    }).project({_id:0,tweetCount_Global : 0,tweetCount_KR: 0, Views: 0,sumTweetOfDay: 0}).toArray()


    await fetchYoutubeView_v2(db,current_month_collectionName,current_month_list)
    await db.collection(current_month_collectionName).updateMany(
        {
            views_2:{$exists:true}
        }
       ,[{
        "$set": {
            "TotalView": {
                $reduce:
                {
                    input: "$views_2",
                    initialValue: 0,
                    in: { $add: ['$$value',{$last:'$$this.viewCount.viewCount'}] }
                }
            }
        }
      }]
    )
    let index = await db.collection(current_month_collectionName).indexExists("totalViewCount").catch(err => false)
    if(!index){
      await db.collection(current_month_collectionName).createIndex({TotalView : -1},{name: 'totalViewCount'})
      console.log(current_month_collectionName + ' youtube view count index created')
    }
  }
}
