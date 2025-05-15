import express from 'express'
import data from './API/data.route.js'
import cors from 'cors'
import http from 'http';

const app = express();
app.use(cors())
app.use(express.json())
app.use('/',express.static('public'))
app.use("/api/",data)
app.use('*',async(req,res)=>{
    let promise = new Promise((resolve) => {
        setTimeout(() =>
            {
                resolve(res.status(200).json({'response':"xD"}))
            },1
        )
    }) 
    await promise;
})
let httpServer = http.createServer(app)

export { httpServer };