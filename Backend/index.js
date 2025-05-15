import {httpServer} from './server.js'
import dotenv from 'dotenv'
import mongodb from "mongodb"
import dataServer from './API/dataServer.js'

async function main(){
    
    dotenv.config()
    console.time('serverStart')
    const client = new mongodb.MongoClient(process.env.DB_URL)
    var HttpPort = process.env.PORT || 8080
    await dataServer.injectDB(client)
    try {
        await client.connect()
        httpServer.listen(HttpPort,async()=> {
                console.log("server is running on port: " + HttpPort)      
        }) 
    } catch(e){
            console.error(e);
            process.exit(1)
    }
}

main().catch(console.error)