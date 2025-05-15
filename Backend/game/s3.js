import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import fs from 'fs'
import {MongoClient} from 'mongodb'
import {spawn } from 'child_process'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

/*
const s3 = new AWS.S3({
    accessKeyId: process.env.s3_access_keyID,
    secretAccessKey: process.env.s3_secret_key
})

const blob = fs.readFileSync('D:/MV/edit_output/edit1.mp4')

const upload = await s3.upload({
    Bucket : process.env.Bucket,
    Key: 'edit1.mp4',
    Body: blob,
}).promise()

console.log(upload)
*/
function videoId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
const url = process.env.DB_URL 
const client = new MongoClient(url, { useNewUrlParser: true });
await client.connect();
console.log('Connected to MongoDB at', url);
const db = client.db();
const artistName = "ITZY"
let totalMV = await db.collection('mvDB').find({Artist:artistName}).toArray()
const s3 = new AWS.S3({
    accessKeyId: process.env.s3_access_keyID,
    secretAccessKey: process.env.s3_secret_key
})
for(let i = 1 ; i < totalMV[0].MV_links.length; i++){
    console.log(i)
    let url =  'https://www.youtube.com/watch?v='+totalMV[0].MV_links[i].youtube_id
    const pythonProcess = spawn('python',["E:\\Code\\Projects\\K-meter\\Backend\\game\\dl.py", url])
    pythonProcess.stdout.on('data',(data) => {
        console.log(data.toString())
        
    })
    await new Promise( (resolve) => {
        pythonProcess.on('close', resolve)
    })
    let id = videoId(6)
    const blob = fs.readFileSync('D:\\MV\\edit_output\\edit.mp4')
    const upload = await s3.upload({
        Bucket : process.env.Bucket,
        Key: id+'.mp4',
        Body: blob,
    }).promise()
    let document = {
        Artist: totalMV[0].Artist,
        Date: totalMV[0].MV_links[i].Date,
        Title : totalMV[0].MV_links[i].Title,
        link : upload.Location,
    }
    await db.collection('quizDB').insertOne(document)
    fs.rmSync('D:\\MV\\clip.mp4')
    fs.rmSync('D:/MV/edit_output/edit.mp4')
}
client.close()