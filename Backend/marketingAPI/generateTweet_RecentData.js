function returnRedirectText(Array){
    if(Array.length > 0){
        let redirect_Group = 'Check more data of \n'
        for(let i =0; i < Array.length;i++){
            redirect_Group += `${Array[i].name} : https:\/\/k-stats.com\/group/${Array[i].index}\n`
        }
        return redirect_Group
    }else{
        return  "Check more What's happening currently at https:\/\/k-stats.com\/recent.\n"
    }
   
}

export async function generateHashTag(array,db){
    
    let hashTagArray = []
    let groupIndexArray = []
    let searchArray = array.map((obj) => {
        if(typeof obj.Artist === 'string'){
            if(obj.Artist.includes('LE SSERAFIM')){
                return ['LESSERAFIM','르세라핌']   
            }
            return [obj.Artist.split(' '),obj.Artist.replace(' ','')]
        }else{ //some Artist field are multiple artist which come in array
            return obj.Artist
        }
    }).flat(2)
    searchArray = [...new Set(searchArray)]
    
    for(let i=0; i< searchArray.length ; i++){
        let searchObj = await db.collection('kpopDB_individual').findOne({
            $text:{
                $search:searchArray[i]
            }
        })
        let gpSearchArray = await db.collection('kpopDB').aggregate(
            [
            {
                $match:{
                    $text:{
                        $search:searchArray[i]
                    }
                }
               
            },
            { 
                $addFields:
                {
                    matchScore : {$meta: "textScore"}
                }
            },
            {
                $match:
                { 
                    matchScore: {$gt: 1}
                }
            },
        ]
        ).toArray()
        if(searchObj !== null ){
            hashTagArray.push(searchObj.group)
            
        }
        for(let i =0; i < gpSearchArray.length;i++){
            hashTagArray.push(gpSearchArray[i].artistFullName_Eng)
            hashTagArray.push(gpSearchArray[i].artistName_KR)
            hashTagArray.push(gpSearchArray[i].Fandom_Name)
            let groupDoc = {
                name : gpSearchArray[i].artistFullName_Eng,
                index :gpSearchArray[i].index,
            }
            groupIndexArray.push(groupDoc)
        }
    }
    
    
    hashTagArray = hashTagArray.filter((name) => name !== '' && name !== ' ').concat(searchArray)
    hashTagArray = [...new Set(hashTagArray.map((name) => name.replace(' ','').replace(/[()-.*]+/g,'')))]
    return {
        hashTagArray: hashTagArray,
        groupIndexArray : groupIndexArray
    }

}
export async function generateTweet_NewlyEntered(array,db){
    
    let chartType = array[0].source
    let chartName 
    switch(chartType){
        case 'circleChart':
            chartName = 'Circle Chart'
            break;
        case 'naverChart':
            chartName = 'Naver Chart'
            break;
        case 'melonChart':
            chartName = 'Melon Chart'
            break;
        default:
            chartName = ' '
    }
    
    let hashTag_indexGroupObj = await generateHashTag(array,db)
    let hashTagArray = hashTag_indexGroupObj.hashTagArray
    let redirectGroupArray = hashTag_indexGroupObj.groupIndexArray 
    let redirect_GroupText = returnRedirectText(redirectGroupArray)
    let tweetRankData = array.map((obj) => '#️⃣'+ obj.prevRank + ' 🎤' + obj.Artist + ' "🎵' + obj.Song + '"\n' ).join('')

    
    let introText =  '[ 📑 '+chartName +'] Newly Entered Song\n'
    let hashtagText = hashTagArray.map((name) => '#'+ name + ' ' ).join('')
    let finalTweet = introText +'\n\n'+ tweetRankData +'\n\n'+ redirect_GroupText + hashtagText
    return finalTweet
}
export async function generateTweet_PeakRank(obj,db){
    
    let chartType = obj.Source
    let chartName 
    switch(chartType){
        case 'CircleChart':
            chartName = 'Circle Chart'
            break;
        case 'NaverChart':
            chartName = 'Naver Chart'
            break;
        case 'MelonChart':
            chartName = 'Melon Chart'
            break;
        default:
            chartName = ' '
    }
    
    let hashTag_indexGroupObj = await generateHashTag([obj],db)
    let hashTagArray = hashTag_indexGroupObj.hashTagArray
    let redirectGroupArray = hashTag_indexGroupObj.groupIndexArray 
    let redirect_GroupText = returnRedirectText(redirectGroupArray)
   
    let tweet = ` 🎉 🎉 Congratulations ${obj.Artist} for achieving New Peak Rank (#${obj.allTimeHigh}) at ${chartName} with its new song ${obj.Song}  🎉 🎉`
    let hashtagText = hashTagArray.map((name) => '#'+ name + ' ' ).join('')
    let finalTweet = tweet +'\n\n'+ redirect_GroupText + hashtagText
    return finalTweet
}
function emoji_decrease_increase(prevRank,currRank){
    let rankDiff = parseInt(prevRank) - parseInt(currRank)
    if(Math.sign(rankDiff) === 1){
        return '📈'
    }
    else{
        return '📉'
    }
}
export async function generateTweet_rankDiff(array,date,source,dbconnection){
    
    let chartName 
    switch(source){
        case 'circleChart':
            chartName = 'Circle Chart'
            break;
        case 'naverChart':
            chartName = 'Naver Chart'
            break;
        case 'melonChart':
            chartName = 'Melon Chart'
            break;
        default:
            chartName = ' '
    }
    
    let hashTag_indexGroupObj = await generateHashTag(array,dbconnection)
    let hashTagArray = hashTag_indexGroupObj.hashTagArray
    let redirectGroupArray = hashTag_indexGroupObj.groupIndexArray 
    let redirect_GroupText = returnRedirectText(redirectGroupArray)

    let tweetRankData = array.map((obj) => '#️⃣'+ obj.prevRank + ' to #️⃣'+ obj.currRank +' '+ emoji_decrease_increase(obj.prevRank,obj.currRank) + ' ' + obj.Artist + ' "🎵' + obj.Song + '"\n' ).join('')
    
    let introText = '[ 📑 '+ chartName + '] - Recent Rank Changes\n'
    let hashtagText = hashTagArray.map((name) => '#'+ name + ' ' ).join('')

    let finalTweet = introText +'\n'+ tweetRankData + '\n\n'+ redirect_GroupText + hashtagText
   return finalTweet
    
}

