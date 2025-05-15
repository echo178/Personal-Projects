import mongodb from "mongodb";
import dotenv from 'dotenv'
import fetchBugsChart from "../musicAPI/Bugs.js";
import { fetchHanteo_AlbumSalesChart } from "../musicAPI/Hanteo.js";
dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let chart = await fetchBugsChart()

client.close()