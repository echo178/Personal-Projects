import ytdl from 'ytdl-core'

async function getYoutubeData(id){
    
    try{
        let result = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${id}`)
        let mvTitle = result.videoDetails.title
        let channelName = result.videoDetails.ownerChannelName
        let view = parseInt(result.videoDetails.viewCount)
        return {
            mvTitle : mvTitle,
            channelName : channelName,
            viewCount : view
        }
    }catch(e){
        console.log(e)
        console.log('The error occured at this ID ' + id)
        return false
    }
    
    
} //core function to fetch view using ytdl module

export default async function fetchFromDataArray(db,collectionName,dataArray){
    let date = new Date()
    for(let i = 0; i < dataArray.length; i++){
        if(i%50 === 0){
            console.log('Fetching View '+ i + ' / ' + dataArray.length)
        }
        
        for(let j = 0 ; j < dataArray[i].views_2.length; j++){
            try{
            let currVideoId = dataArray[i].views_2[j].videoId
            let fetchedData = await getYoutubeData(currVideoId)
            if(!fetchedData){
                throw "Error occured in fetching view of " + currVideoId
            }else{
                if(!dataArray[i].views_2[j].channelName){
    
                    let updateObject = {
                        channelName : fetchedData.channelName,
                        title : fetchedData.mvTitle,
                        viewCount : [{Date: date, viewCount: fetchedData.viewCount}]
                    }
                    await DBfunc(db,collectionName,dataArray[i].Artist,currVideoId,updateObject,'firstTime')
                }
                else{
                
                    let updateObject = {Date: date, viewCount: fetchedData.viewCount}
                    await DBfunc(db,collectionName,dataArray[i].Artist,currVideoId,updateObject,'exist')
                }
            }
            }
            catch(e){
                console.log(e)
               
            }
            
            
        }
    }
    return true
} //operate on the inserted database data and update it

async function DBfunc(db,collectionName,artistName,videoId,updateObj,updateType){
    if(updateType === 'firstTime'){
        await db.collection(collectionName).findOneAndUpdate(
            {
                Artist: artistName, 
                'views_2.videoId': videoId
            },{
                $set:{
                    'views_2.$.channelName' :updateObj.channelName,
                    'views_2.$.title' : updateObj.title,
                    'views_2.$.viewCount' : updateObj.viewCount
                }
        })
    }
    if(updateType === 'exist'){
        
        await db.collection(collectionName).findOneAndUpdate(
            {
                Artist: artistName, 
                'views_2.videoId': videoId
            },{
                $push:{
                    'views_2.$.viewCount' : updateObj
                }
        })
    }
    
}
