import mongodb from "mongodb"
import dotenv from 'dotenv'
import dataDAO from '../API/dataDAO.js'

dotenv.config({path: "/var/app/current/.env"})
const client = new mongodb.MongoClient(process.env.DB_URL)

await dataDAO.injectDB(client)
await client.connect()
let promiseArray = new Array()
console.log('-------------------------------------------------------------')
console.log('Job started at ' + new Date())
promiseArray.push(dataDAO.updateKpopDB())

//promiseArray.push(dataDAO.updateGroupTweetCount())
promiseArray.push(dataDAO.updateWatchlist())
promiseArray.push(dataDAO.updateCircleChart_daily())
let result = await Promise.allSettled(promiseArray)
console.log(result)
console.log('client closed')
client.close()