function changeNumberToShortUnit(number){
    number = Math.abs(number)
    function roundUp(value){
        let digitCount = Math.floor(Math.log10(value))
        let divisor 
        if(digitCount < 6){
            divisor = Math.pow(10,digitCount)/2
        }else{
            divisor = Math.pow(10,digitCount)/5
        }
        return Math.round(value/divisor)*divisor
    }
    number = roundUp(number)
    
    let digitCount = Math.floor(Math.log10(number))
    
    if(digitCount < 6){
        return (number/1000) + 'K'
    }
    else{
        return (number/1000000) +'M'
    }
}
function generateGroupTweet(data,GroupType){
   
    const activeGroup = data.brief.activeGroup
    let key 
    let compareTimeFrame = data.compare_timeframe
    if(GroupType === 'positive'){
        key = 'mostTweetedGroup'
    }
    else if (GroupType === 'negative'){
        key = 'lessTweetedGroup'
    }
    let groupData = data[key][0]
    let changePercentage 
    if(GroupType === 'positive'){
        changePercentage = (groupData.curr_totalTweet/groupData.prev_totalTweet)*100
    }
    else if (GroupType === 'negative'){
        changePercentage = (1-(groupData.curr_totalTweet/groupData.prev_totalTweet))*100
    }
    changePercentage = Math.round(changePercentage)
    let tweet 
    switch(compareTimeFrame){
        case 12:{
            switch(GroupType){
                case 'positive':{
                    tweet = `During last 12 hours, tweets about ${groupData.group_EngFullName.replaceAll(' ','')} has surged ${changePercentage}% ( about ${changeNumberToShortUnit(groupData.tweetDifference)} ). the total tweets at last 24 hour is about ${changeNumberToShortUnit(groupData.prev_totalTweet)} but tweet volume is increased to ${changeNumberToShortUnit(groupData.curr_totalTweet)} in recent 12 hours.\nSee more detail data of ${groupData.group_EngFullName.replaceAll(' ','')} at https:\/\/k-stats.com\/group\/${groupData.index} \n#${groupData.group_EngFullName.replaceAll(' ','')} #${groupData.group_KRName.replaceAll(' ','')} #kstats`
                   break
                }
                case 'negative':{
                    tweet = `During last 12 hours, tweets about ${groupData.group_EngFullName.replaceAll(' ','')} has dropped ${changePercentage}% ( about ${changeNumberToShortUnit(groupData.tweetDifference)} ). the total tweets at last 24 hour is about ${changeNumberToShortUnit(groupData.prev_totalTweet)} but tweet volume is decreased to ${changeNumberToShortUnit(groupData.curr_totalTweet)} in recent 12 hours.\nSee more detail data of ${groupData.group_EngFullName.replaceAll(' ','')} at https:\/\/k-stats.com\/group\/${groupData.index} \n #${groupData.group_EngFullName.replaceAll(' ','')} #${groupData.group_KRName.replaceAll(' ','')} #kstats`
                    break
                }       
            }
            break
        }       
        case 24:{
            switch(GroupType){
                case 'positive':{
                    tweet = `At last 24 hours, tweets about ${groupData.group_EngFullName.replaceAll(' ','')} has surged ${changePercentage}% ( about ${changeNumberToShortUnit(groupData.tweetDifference)} ). the total tweets at the day before yesterday is about ${changeNumberToShortUnit(groupData.prev_totalTweet)} but tweet volume is increased to ${changeNumberToShortUnit(groupData.curr_totalTweet)} at yesterday.\nSee more detail data of ${groupData.group_EngFullName.replaceAll(' ','')} at https:\/\/k-stats.com\/group\/${groupData.index} \n #${groupData.group_EngFullName.replaceAll(' ','')} #${groupData.group_KRName.replaceAll(' ','')} #kstats`
                    break
                } 
                case 'negative':{
                    
                    tweet = `At last 24 hours, tweets about ${groupData.group_EngFullName.replaceAll(' ','')} has dropped ${changePercentage}% ( about ${changeNumberToShortUnit(groupData.tweetDifference)} ). the total tweets at the day before yesterday is about ${changeNumberToShortUnit(groupData.prev_totalTweet)} but tweet volume is decreased to ${changeNumberToShortUnit(groupData.curr_totalTweet)} at yesterday.\nSee more detail data of ${groupData.group_EngFullName.replaceAll(' ','')} at https:\/\/k-stats.com\/group\/${groupData.index} \n #${groupData.group_EngFullName.replaceAll(' ','')} #${groupData.group_KRName.replaceAll(' ','')} #kstats`
                    break
                }
                   
            }
            break
        }           
    }
    return tweet
}

export { generateGroupTweet }