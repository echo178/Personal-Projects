import axios from "axios";
import {JSDOM} from 'jsdom'
import { MongoClient } from "mongodb";
import dotenv from 'dotenv'

dotenv.config({path:"Projects/K-meter/Backend/.env"})
const url = process.env.DB_URL 
const client = new MongoClient(url, { useNewUrlParser: true });
await client.connect();
console.log('Connected to MongoDB at', url);
const db = client.db();

let links = await axios.get('https://dbkpop.com/db/k-pop-group-mvs-index/').then(
    response => {
        const dom = new JSDOM(response.data)
        let link = []
        dom.window.document.querySelectorAll('p a').forEach((nodes) => {
            link.push(nodes.href)
            
            return link
        })
        return link
    }
)
links = links.slice(-9)

for(const url of links){
let document = await axios.get(url).then(
    response => {
        const dom = new JSDOM(response.data)
        let newDoc = {}
        newDoc['Artist']=  dom.window.document.querySelectorAll('div.entry-content p a')[0].textContent
        if(newDoc.Artist == 'all Group MV Lists'){
            newDoc['Artist'] = dom.window.document.querySelectorAll('div.entry-content p strong')[0].textContent
        }
        let links = []
        dom.window.document.querySelectorAll('tbody tr').forEach((nodes) => {
            let currData = {}
           let dataArr = nodes.childNodes
           for(const [index,node] of dataArr.entries()){
            
            if(index == 3){
                currData['Date'] = node.textContent
            }
            else if(index == 5){
                currData['Title'] = node.textContent
            }
            else if(node.textContent == 'Youtube'){
                currData['youtube_id'] = node.firstChild.href.toString().slice(-11)
            }
           }
           links.push(currData)
           return links
        })
        newDoc['MV_links'] = links
        return newDoc
    }
)
await db.collection('mvDB').insertOne(document)
console.log('Uploaded ' + document.Artist)
}

client.close()