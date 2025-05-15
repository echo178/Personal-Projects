import mongodb from "mongodb";
import dotenv from 'dotenv'
import moment from 'moment'
import {generateHashTag,generateTweet_NewlyEntered,generateTweet_PeakRank} from '../marketingAPI/generateTweet_RecentData.js'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let tweet = await generateTweet_PeakRank({
Artist: '윤하',
Song: '사건의 지평선',
Album: 'YOUNHA 6th Album Repackage `END THEORY : Final Edition`',
Company: 'C9엔터테인먼트',
DisCompany: 'Kakao Entertainment',
Group: false,
prevRank: 39,
currRank: 42,
allTimeHigh: 5,
rankDiff: -3,
allTimeHighAchievement: false},db)

console.log(tweet)
client.close()