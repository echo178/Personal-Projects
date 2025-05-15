import { youtube } from "scrape-youtube";
import dotenv from 'dotenv'
dotenv.config({path:"Projects/K-meter/Backend/.env"})
export default async function youtubeViewFetch(schedule,filter=false){
    let promiseArray = new Array()
    let date = new Date()
    if(filter){
    const currentDayNo = date.getDate()
        function checkReleaseDate(obj){
            return obj.Day <= currentDayNo
        }
        schedule = schedule.filter(checkReleaseDate)
    }
        for(let i = 0; i< schedule.length;i++){
            let promise = new Promise((resolve,reject)=>{
                setTimeout(async() => {
                    if(i % 30 == 0){
                    console.log('Youtube view fetching in Progress | ' +i + ' / '+ schedule.length)
                    }
                    let viewChannel = {}
                    let searchTerm = schedule[i].Artist + ' ' + schedule[i].Song + ' MV Kpop'

                    await youtube.search(searchTerm).then(result =>{
                        if(result.videos.length > 0){
                        viewChannel[result.videos[0].channel.name] = result.videos[0].views             
                        viewChannel = Object.fromEntries(Object.entries(viewChannel).sort(([,a],[,b]) => b-a))
                        }
                       
                        if(!schedule[i]['Views']){
                            schedule[i]['Views'] = []
                        }
                        let totalView = Object.values(viewChannel).reduce((a,b) => a+b,0)
                        let obj ={
                        }
                        obj['Date'] = date
                        obj['channel'] = viewChannel
                        obj['sumViewCount'] = totalView
                        schedule[i]['Views'].push(obj)
                        resolve(schedule)
                        reject(new Error('Error occured at progress'+ i + '/'+schedule.length))
                })},
                800* i)
            })
            promiseArray.push(promise)
        }
        await Promise.allSettled(promiseArray)
        return schedule
        
    }

export function collectionNameGenerate(){
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let currMonth_collection,prev_1_Month_collection,prev_2_Month_collection
    let date = new Date()
    let prev_1_Month_dateObj = new Date()
    prev_1_Month_dateObj.setMonth(date.getUTCMonth()-1,1)
    let prev_2_Month_dateObj = new Date()
    prev_2_Month_dateObj.setMonth(date.getUTCMonth()-2,1)

    let currMonthName = month[date.getUTCMonth()]
    let prevMonthName = month[prev_1_Month_dateObj.getUTCMonth()]
    let prev2MonthName = month[prev_2_Month_dateObj.getUTCMonth()]

    let prev_1_Month_Year = prev_1_Month_dateObj.getUTCFullYear()
    let prev_2_Month_Year = prev_2_Month_dateObj.getUTCFullYear()
    let currYear = date.getFullYear()

    currMonth_collection = 'watchlist_'+ currMonthName + currYear
    prev_1_Month_collection = 'watchlist_' + prevMonthName + prev_1_Month_Year
    prev_2_Month_collection = 'watchlist_' + prev2MonthName + prev_2_Month_Year
        
    return [currMonth_collection, prev_1_Month_collection, prev_2_Month_collection]
}

export function findupdateObjGent(updateObject,updateField){
    let findObj = {}
    let updateObj = {}
    for (let key in updateObject){
        if(key != updateField){
            findObj[key] = updateObject[key]
        }
        if(key == updateField){
            updateObj[key] = updateObject[key][updateObject[key].length -1]
        }
    }
    return [findObj,updateObj]
    }
export async function DBupdatefunction(insertDoc,collectionName,db){
    
    await db.collection(collectionName).updateMany({"$expr":{$gte:[{$size: { "$ifNull": [ "$Views", [] ] }},250]}},{$pop: {Views : -1}})
    for(let i=0;i< insertDoc.length; i++){
        if( i % 30 == 0){
        console.log('Updating ' + collectionName + ' ViewCount in progress ' + i + '/' + insertDoc.length)
        }
        let [findObj,updateObj] = findupdateObjGent(insertDoc[i],'Views')
        await  db.collection(collectionName).findOneAndUpdate(
            findObj,
            {$push: updateObj,$set:{totalViewCount: updateObj.Views.sumViewCount}})
           }
        console.log(collectionName + " Updated")
    }
