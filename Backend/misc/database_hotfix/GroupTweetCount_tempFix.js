import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
import dataDAO from '../../API/dataDAO.js'
import tweetCountFetch from '../../socialmediaAPI/FetchGroupTweetCount_tempFix.js'
import axio from 'axios'



dotenv.config({path:"Projects/K-meter/Backend/.env"})

const url = process.env.DB_URL 
const client = new MongoClient(url, { useNewUrlParser: true });
await client.connect();
console.log('Connected to MongoDB at', url);
const db = client.db();



const token = Buffer.from(`${process.env.twitter_APIkey}:${process.env.twitter_APIkeySecret}`, 'utf8').toString('base64')

let accessToken = await axio.post('https://api.twitter.com/oauth2/token?grant_type=client_credentials',
  null,
  {
      headers: {
      'Content-Type': `application/x-www-form-urlencoded;charset=UTF-8`,
      'authorization': `Basic ${token}`
    }}).then(response => {

      return response.data.access_token
     })

let collection = "GroupsTweetCount_December2022"
let fetchDocs = await db.collection(collection).find({}).toArray()
let currMnthChartBatch1 = fetchDocs.slice(0,130)
let currMnthChartBatch2 = fetchDocs.slice(130)
let fetchedTweet2
let promise1 = new Promise((resolve) => {
    setTimeout(async() => {
       fetchedTweet2 = await tweetCountFetch(accessToken,currMnthChartBatch2)
      resolve(fetchedTweet2);
    }, 1200* 1000);
  });

let fetchedTweet1 = await tweetCountFetch(accessToken,currMnthChartBatch1)

for(let i =0; i< fetchedTweet1.length; i++){
    console.log(i + ' / ' + fetchedTweet1.length)
    await db.collection(collection).findOneAndUpdate({group_EngFullName: fetchedTweet1[i].group_EngFullName},
    {$set: {tweetCount_Global : fetchedTweet1[i].tweetCount_Global, tweetCount_KR: fetchedTweet1[i].tweetCount_KR,sumTweetOfDay: fetchedTweet1[i].sumTweetOfDay,
    tweetCountTotal_KR:fetchedTweet1[i].tweetCountTotal_KR,tweetCountTotal_Global:fetchedTweet1[i].tweetCountTotal_Global}})
}


fetchedTweet2 = await promise1
for(let i =0; i< fetchedTweet2.length; i++){
    console.log('Updating TweetCount of Groups - Batch 2 ' + i + ' / ' + fetchedTweet2.length )
    await db.collection(collection).findOneAndUpdate({group_EngFullName: fetchedTweet2[i].group_EngFullName},
    {$set: {tweetCount_Global : fetchedTweet2[i].tweetCount_Global, tweetCount_KR: fetchedTweet2[i].tweetCount_KR,sumTweetOfDay: fetchedTweet2[i].sumTweetOfDay,
    tweetCountTotal_KR:fetchedTweet2[i].tweetCountTotal_KR,tweetCountTotal_Global:fetchedTweet2[i].tweetCountTotal_Global}})
}
client.close()


