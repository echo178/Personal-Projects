import mongodb from "mongodb";
import dotenv from 'dotenv'
import fetchTweet from "../socialmediaAPI/FetchGroupTweetCount.js";
import axios from "axios";
import { generateGroupTweet } from '../marketingAPI/generateTweet.js'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

dotenv.config({path: "/var/app/current/.env"})
const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let fetchDocs = await db.collection('GroupsTweetCount_February2023').find({group_EngFullName:'BVNDIT'}).toArray()


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
  console.log('start fetching')
  let test = await fetchTweet(accessToken,fetchDocs)
  console.log(test[0])
client.close()






