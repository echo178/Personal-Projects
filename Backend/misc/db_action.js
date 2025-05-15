import mongodb from "mongodb"
import dotenv from 'dotenv'
import dataDAO from '../API/dataDAO.js'

dotenv.config({path: "/var/app/current/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
let promiseArray = new Array()
await dataDAO.injectDB(client)
await client.connect()
promiseArray.push(dataDAO.updateChart())
await Promise.allSettled(promiseArray)
console.log(promiseArray)
console.log('client closed')
client.close()
