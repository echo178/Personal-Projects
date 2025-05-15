import dotenv from 'dotenv'
import axios from "axios";

dotenv.config({path:"Projects/K-meter/Backend/.env"})

function dayInMonth(month,year){
    return new Date(year,month+1,0).getDate()
}

export default async function tweetCountFetch(accessToken,fetchChart){
let array = []
for(let i = 0; i < fetchChart.length; i++){
    if(i % 50 == 0){
        console.log('Group Tweet Count fetching in progress : ' + i + ' / ' + fetchChart.length)
    }
    
    let query = ''
    if(fetchChart[i].group_EngFullName){
        query += "\"" + fetchChart[i].group_EngFullName + "\" "
    }
    if(fetchChart[i].group_EngShortName){
        query += 'OR \"' + fetchChart[i].group_EngShortName + "\""
    }
    if(fetchChart[i].group_KRName){
        query +=  'OR \"' + fetchChart[i].group_KRName + "\""
    }
    query = "(" + query + ")"
    let tweetCountQuery_ko = query + ' lang:ko'
    let tweetCount_KR = await axios.get('https://api.twitter.com/2/tweets/counts/recent',{

                params: {
                    query: tweetCountQuery_ko
                }
            ,
            headers:{
                "User-Agent": "v2RecentTweetCountsJS",
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(
        response => {
            
            return response.data.data
        }
        )
    let tweetCount_Global = await axios.get('https://api.twitter.com/2/tweets/counts/recent',{

            params: {
                query: query
            }
        ,
        headers:{
            "User-Agent": "v2RecentTweetCountsJS",
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(
    response => {
        
        return response.data.data
    }
    )
    let localCurrentTime = new Date()
    let fetchArray_KR = new Set()
    let fetchArray_Global = new Set()
    let fetchObj_KR = {}
    let fetchObj_Global = {}

    for (let [index,obj] of tweetCount_KR.entries()){

        let time = new Date(obj.start)
        if(localCurrentTime.getUTCMonth() !== time.getUTCMonth()) {
            if(index === 0){
                let oldData = fetchChart[i].tweetCount_KR.find((obj) => obj.Date === time.getUTCDate())
                if(oldData){
                    obj.tweet_count = oldData['Hours '+time.getUTCHours()]
                }
                
                
            } 
            //used old Data for the first index of data as it is not an hour complete data, received from Twitter
            //occurance after 7 days of the month
             
            let currentDay = time.getUTCDate()  
            if(currentDay != fetchObj_KR.Date){
                fetchObj_KR = {}
            }
            fetchObj_KR['Date'] = currentDay
            if(obj.tweet_count > 0){ 
            fetchObj_KR['Hours ' + time.getUTCHours()] = obj.tweet_count
            }
            fetchArray_KR.add(fetchObj_KR)      
               
        }
    }
    if(fetchChart[i].tweetCount_KR){
    fetchArray_KR = [...fetchChart[i].tweetCount_KR,...fetchArray_KR]
    fetchArray_KR= fetchArray_KR.filter((value, index, self) =>{
        let indexFind = self.map(obj => 
         obj.Date === value.Date).lastIndexOf(true);
        return index == indexFind
        })
    }
    
    for (let [index,obj] of tweetCount_Global.entries()){
        let time = new Date(obj.start)
        if(localCurrentTime.getUTCMonth() !== time.getUTCMonth() ){
            if(index === 0){
                let oldData = fetchChart[i].tweetCount_Global.find((obj) => obj.Date === time.getUTCDate())
                if(oldData){
                    obj.tweet_count = oldData['Hours '+time.getUTCHours()]
                }
                
                
            }
            let currentDay = time.getUTCDate()
            if(currentDay != fetchObj_Global.Date){
                    fetchObj_Global = {}
            }
            fetchObj_Global['Date'] = currentDay
            if(obj.tweet_count > 0 ){ 
                fetchObj_Global['Hours ' + time.getUTCHours()] = obj.tweet_count
            }
            fetchArray_Global.add(fetchObj_Global)      
        }    
    }
    if(fetchChart[i].tweetCount_Global){
        fetchArray_Global = [...fetchChart[i].tweetCount_Global,...fetchArray_Global]
        fetchArray_Global= fetchArray_Global.filter((value, index, self) =>{
            let indexFind = self.map(obj => 
             obj.Date === value.Date).lastIndexOf(true);
            return index == indexFind
        })
    }
    
     let totalArray_KR = []
    for (let i = 0; i< fetchArray_KR.length; i++){
    let currValue = Object.values(fetchArray_KR[i]).slice(1)
    totalArray_KR = [...totalArray_KR,...currValue]

    }
    let tweetCountTotal_KR = totalArray_KR.reduce((a,b) =>  a+b, 0)
    let totalArray_Global = []
    for (let i = 0; i< fetchArray_Global.length; i++){
        let currValue = Object.values(fetchArray_Global[i]).slice(1)
        totalArray_Global = [...totalArray_Global,...currValue]
    
    }
    let tweetCountTotal_Global = totalArray_Global.reduce((a,b) =>  a+b, 0)

    let sumTweetArray = []
    for(let j =0; j< fetchArray_KR.length; j++){ 
        //used koreaTweet Array length but it is fine as always same length with globalArray coz even no data at that day, there is object with Date
        let sumTweetInDay = {}
        let globalSumTweet = 0
        let koreaSumTweet = 0
        for(const [key,value] of Object.entries(fetchArray_KR[j])){
            if(key !== 'Date'){
                koreaSumTweet += value
            }
        }
        for(const [key,value] of Object.entries(fetchArray_Global[j])){
            if(key !== 'Date'){
                globalSumTweet += value
            }
        }
        sumTweetInDay['Date'] = fetchArray_KR[j].Date
        sumTweetInDay['globalTweetTotal']  = globalSumTweet
        sumTweetInDay['koreaTweetTotal'] = koreaSumTweet
        sumTweetArray.push(sumTweetInDay)
    }

    let obj = {}
    obj['group_EngFullName'] = fetchChart[i].group_EngFullName
    obj['group_EngShortName'] = fetchChart[i].group_EngShortName
    obj['group_KRName'] = fetchChart[i].group_KRName
    obj['group_Fandom'] = fetchChart[i].group_Fandom
    obj['tweetCount_KR'] = fetchArray_KR
    obj['tweetCount_Global'] = fetchArray_Global
    obj['sumTweetOfDay'] = sumTweetArray
    obj['tweetCountTotal_KR'] = tweetCountTotal_KR
    obj['tweetCountTotal_Global'] = tweetCountTotal_Global
    array.push(obj)
    }
    return array
}

