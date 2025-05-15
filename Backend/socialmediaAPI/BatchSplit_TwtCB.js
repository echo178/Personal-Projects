import fetchTweetCountSchedule from "../socialmediaAPI/ComebackTweetCount.js";




export default async function BatchSplit(chart1,chart2,db,accessToken,collectionName1,collectionName2){
if(!chart2){
  if(chart1.length >= 130){
    console.log('Chart 2 don\'t exist and Chart 1 length excceds API call limit 130')
  let promiseArray = []
  let chart1Batch1 = chart1.slice(0,130)
  let chart1Batch2 = chart1.slice(130)
  chart1Batch1 = await fetchTweetCountSchedule(accessToken,chart1Batch1)
 promiseArray.push(DBoperation(db,chart1Batch1,collectionName1))
 let promise1 = new Promise((resolve) => {
  setTimeout(async() => {
    chart1Batch2 = await fetchTweetCountSchedule(accessToken,chart1Batch2)
   resolve(chart1Batch2);
 }, 1000* 1000);
})
  chart1Batch2 = await promise1
  promiseArray.push(DBoperation(db,chart1Batch2,collectionName1))
  await Promise.allSettled(promiseArray)
}
  else{
  console.log('Chart 2 don\'t exist and Chart 1 length doesn\'t excceds API call limit 130')
  let promiseArray = []
  chart1 = await fetchTweetCountSchedule(accessToken,chart1)
  promiseArray.push(DBoperation(db,chart1,collectionName1))
  await Promise.allSettled(promiseArray)
}
}
if(chart2 && collectionName2){
  if((chart1.length + chart2.length) <= 130){
    let promiseArray = []
    console.log('Batch Splitting level 1')
    chart1 = await fetchTweetCountSchedule(accessToken,chart1)
    promiseArray.push(DBoperation(db,chart1,collectionName1))
    chart2 = await fetchTweetCountSchedule(accessToken,chart2)
    promiseArray.push(DBoperation(db,chart2,collectionName2))
    await Promise.allSettled(promiseArray)
  }
  if((chart1.length + chart2.length) > 130 && (chart1.length + chart2.length) <= 260){
    console.log('Batch Splitting level 2')
    if(chart1.length > chart2.length){
      console.log('slice on ' + collectionName1)
    let promiseArray = []
    let chart1Batch1 = chart1.slice(0,130)
    let chart1Batch2 = chart1.slice(130)
    let promise1 = new Promise((resolve) => {
      setTimeout(async() => {
        chart1Batch2 = await fetchTweetCountSchedule(accessToken,chart1Batch2)
       resolve(chart1Batch2);
     }, 1000* 1000);
    })
    let promise2 = new Promise((resolve) => {
      setTimeout(async() => {
        chart2 = await fetchTweetCountSchedule(accessToken,chart2)
       resolve(chart1Batch2);
     }, 1000* 1000);
    })
    chart1Batch1 = await fetchTweetCountSchedule(accessToken,chart1Batch1)
    promiseArray.push(DBoperation(db,chart1Batch1,collectionName1))
    chart1Batch2 = await promise1
    chart2 = await promise2
    promiseArray.push(DBoperation(db,chart1Batch2,collectionName1))
    promiseArray.push(DBoperation(db,chart2,collectionName2))
    await Promise.allSettled(promiseArray)
  }
  if(chart1.length < chart2.length){
    console.log('slice on ' + collectionName2)
    let promiseArray = []
    let chart2batch1 = chart2.slice(0,130)
    let chart2batch2 = chart2.slice(130)
    let promise1 = new Promise((resolve) => {
      setTimeout(async() => {
        chart2batch1 = await fetchTweetCountSchedule(accessToken,chart2batch1)
       resolve(chart2batch1);
     }, 1000* 1000);
    })
    let promise2 = new Promise((resolve) => {
      setTimeout(async() => {
        chart2batch2 = await fetchTweetCountSchedule(accessToken,chart2batch2)
       resolve(chart2batch2);
     }, 1000* 1000);
    })
    chart1 = await fetchTweetCountSchedule(accessToken,chart1)
    promiseArray.push(DBoperation(db,chart1,collectionName1))
    chart2batch1 = await promise1
    chart2batch2 = await promise2
    promiseArray.push(DBoperation(db,chart2batch1,collectionName2))
    promiseArray.push(DBoperation(db,chart2batch2,collectionName2))
    await Promise.allSettled(promiseArray)
  }
  }
  if((chart1.length + chart2.length ) >260){
    console.log('Batch Splitting Level 3')
    let promiseArray = []
    let chart1Batch1 = chart1.slice(0,130)
    let chart1Batch2 = chart1.slice(130)
    
    let chart2Batch1 = chart2.slice(0,100)
    let chart2Batch2 = chart2.slice(100)
    let promise1 = new Promise((resolve)=>{
      setTimeout(async() => {
        chart1Batch2 = await fetchTweetCountSchedule(accessToken,chart1Batch2)
       resolve(chart1Batch2);
     }, 1000* 1000);
    })
    let promise2 = new Promise((resolve)=>{
      setTimeout(async() => {
        chart2Batch1 = await fetchTweetCountSchedule(accessToken,chart2Batch1)
       resolve(chart2Batch1);
     }, 1000* 1000);
    })
    let promise3 = new Promise((resolve)=>{
      setTimeout(async() => {
        chart2Batch2 = await fetchTweetCountSchedule(accessToken,chart2Batch2)
       resolve(chart2Batch2);
     }, 2000* 1000);
    })
    chart1Batch1 = await fetchTweetCountSchedule(accessToken,chart1Batch1)
    promiseArray.push(DBoperation(db,chart1Batch1,collectionName1))
    chart1Batch2 = await promise1
    promiseArray.push(DBoperation(db,chart1Batch2,collectionName1))
    chart2Batch1 = await promise2
    promiseArray.push(DBoperation(db,chart2Batch1,collectionName2))
    chart2Batch2 = await promise3
    promiseArray.push(DBoperation(db,chart2Batch2,collectionName2))
    await Promise.allSettled(promiseArray)
  }  
}
}

async function DBoperation(db,toUploadChart,collectionName){
  
  for(let i = 0; i < toUploadChart.length; i++){
    if(i % 30 == 0){
    console.log('Updating ' + collectionName + ' in progress ' + i + ' / ' +toUploadChart.length )
    }
    await db.collection(collectionName).findOneAndUpdate(
      {Artist: toUploadChart[i].Artist, Song: toUploadChart[i].Song, Day: toUploadChart[i].Day},
      {$set: {tweetCount_Global : toUploadChart[i].tweetCount_Global, tweetCount_KR: toUploadChart[i].tweetCount_KR,
        tweetCountTotal_KR:toUploadChart[i].tweetCountTotal_KR,tweetCountTotal_Global:toUploadChart[i].tweetCountTotal_Global,sumTweetOfDay:toUploadChart[i].sumTweetOfDay}}
    )
  }
}
