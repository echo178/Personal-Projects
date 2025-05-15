import mongodb from "mongodb"
import dotenv from 'dotenv'
import dataDAO from '../API/dataDAO.js'
dotenv.config({path: "/var/app/current/.env"})
const client = new mongodb.MongoClient(process.env.DB_URL)
let promiseArray = new Array()
await dataDAO.injectDB(client)
await client.connect()

console.log('-------------------------------------------------------------')
console.log('Job started at ' + new Date())
promiseArray.push(dataDAO.updateChart())
promiseArray.push(dataDAO.updateYoutubeView_2_regular_3_month())
//promiseArray.push(dataDAO.updateTweetCountComeback()) 
promiseArray.push(dataDAO.circleChart_Hourly())
promiseArray.push(dataDAO.updateKtownChart())
promiseArray.push(dataDAO.updateHanteoAlbumSalesChart())

let result = await Promise.allSettled(promiseArray)
console.log(result)
console.log('Job closed at ' + new Date())
console.log('client closed')
client.close()

