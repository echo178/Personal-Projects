import dataserver from '../API/dataServer.js'
import TwitterClient from '../marketingAPI/twitterClient.js'
import mongodb from "mongodb"
import dotenv from 'dotenv'
import formData from 'form-data'
import { generateGroupTweet } from '../marketingAPI/generateTweet.js'
import generateChart  from '../marketingAPI/generateChart.js'

dotenv.config({path: "/var/app/current/.env"})
const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
await dataserver.injectDB(client)
let db = client.db()
let data = await dataserver.getMKTData_Group()
console.log('-------------------------------------------------------------')
console.log('Job started at ' + new Date())




let tweetTwitterClient = new TwitterClient('POST','https://api.twitter.com/2/tweets')
let imageTwitterClient = new TwitterClient('POST','https://upload.twitter.com/1.1/media/upload.json')

let currentDate = new Date().getUTCDate()

try{
    if(currentDate >= 3){
        let mostTweetedGroupChart = generateChart(data.mostTweetedGroup[0],data.compare_timeframe)
        let mostTweetedGroupChartForm = new formData()
        mostTweetedGroupChartForm.append('media_data',mostTweetedGroupChart)
        let mostTweetedGroupChart_MediaId = await imageTwitterClient.postImage(mostTweetedGroupChartForm)
        let positiveTweet = generateGroupTweet(data,'positive')
        let postedPositiveTweet = await tweetTwitterClient.postTweet({'text' : positiveTweet, 'media' : 
        {
            "media_ids" : [mostTweetedGroupChart_MediaId]
        }})
        console.log('Posted Tweet as ID ' , postedPositiveTweet.id)
    }else{
        let positiveTweet = generateGroupTweet(data,'positive')
        let postedPositiveTweet = await tweetTwitterClient.postTweet({'text' : positiveTweet})
        console.log('Posted Tweet as ID ' , postedPositiveTweet.id)
    }
    
    
}catch(e){
    console.log(e)
}

try{
    if(currentDate >= 3){
        let lessTweetedGroupChart = generateChart(data.lessTweetedGroup[0],data.compare_timeframe)
        let lessTweetedGroupChartForm = new formData()
        lessTweetedGroupChartForm.append('media_data',lessTweetedGroupChart)
        let lessTweetedGroupChart_MediaId = await imageTwitterClient.postImage(lessTweetedGroupChartForm)
        let negativeTweet = generateGroupTweet(data,'negative')
        let postedNegativeTweet = await tweetTwitterClient.postTweet({'text' : negativeTweet,'media':{
            "media_ids" :[lessTweetedGroupChart_MediaId]
        }})
        console.log('Posted Tweet as ID  ', postedNegativeTweet.id )
    }
    else{
        let negativeTweet = generateGroupTweet(data,'negative')
        let postedNegativeTweet = await tweetTwitterClient.postTweet({'text' : negativeTweet})
        console.log('Posted Tweet as ID  ', postedNegativeTweet.id )
    }
    
}catch(e){
    console.log(e)
} 

client.close()