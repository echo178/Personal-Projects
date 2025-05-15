import axios from "axios";
import dotenv from 'dotenv'
dotenv.config({path:"Projects/K-meter/Backend/.env"})
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

let data = await axios.get('https://api.twitter.com/2/tweets/counts/recent',{
    
        params: {
            query: 'WJSN'
        }
    ,
    headers:{
        "User-Agent": "v2RecentTweetCountsJS",
        'Authorization': `Bearer ${accessToken}`
    }
}).then(
response => {
    console.log(response.data)
    return response.data
}
)

