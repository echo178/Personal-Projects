import mongodb from "mongodb";
import dotenv from 'dotenv'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()
async function searchTweetCount(keyword){
    keyword = parseInt(keyword)
    if(typeof(keyword) === 'number'){
      let searchGroup = await db.collection('kpopDB').findOne({index:keyword})
      let kpopDB_search_string = '\"'+searchGroup.artistFullName_Eng + '\" \"' +  searchGroup.artistName_KR + '\"'
      let other_search_string = searchGroup.artistFullName_Eng + ' ' +  searchGroup.artistName_KR 
      
      
      let currentMonthDateObj = new Date()
      let prev_1month_dateObj = new Date(new Date().setUTCMonth(currentMonthDateObj.getUTCMonth() - 1))
      let prev_2month_dateObj = new Date(new Date().setUTCMonth(currentMonthDateObj.getUTCMonth() - 2))
      
      const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
      let currentMonthCollectionName ='GroupsTweetCount_'+ monthsArray[currentMonthDateObj.getUTCMonth()] + currentMonthDateObj.getUTCFullYear()
      let prev_1month_CollectionName = 'GroupsTweetCount_'+ monthsArray[prev_1month_dateObj.getUTCMonth()] + prev_1month_dateObj.getUTCFullYear()
      let prev_2month_CollectionName= 'GroupsTweetCount_'+ monthsArray[prev_2month_dateObj.getUTCMonth()] + prev_2month_dateObj.getUTCFullYear()
      
      let collList = [currentMonthCollectionName,prev_1month_CollectionName,prev_2month_CollectionName,'kpopDB']
      
      let concatArray = collList.map((elem) => '$' + elem)
      let facetObject = {}
      let groupObject = {
          _id: "$_id",
      }
      let projectObject = {
        _id:0,
      }   
      for(let name of collList){
        facetObject[name] = [{
            "$lookup": {
                "from": name,
                "pipeline": [
                    { "$match": { $text: {$search: `${other_search_string}`}} },
                    { $addFields:{matchScore : {$meta: "textScore"}}},
                    {$match:{ matchScore: {$gt: 1} }},
                    {"$project": {_id: 0} },
                ],
                "as": name
              }
        }]
        groupObject[name] = {
            $push : "$" +name
        }
        projectObject[name] = {
            $first: "$" +name
        }
      }
      console.log(facetObject)
      let result = await db.collection('kpopDB').aggregate(
        [
            {
                $match:{
                    $text:
                    {
                        $search: `${kpopDB_search_string}`
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
            {
                "$facet": facetObject
            }, 
            { 
              "$project": {
                "data": {
                  "$concatArrays":concatArray
                }
              }
            },
            {
                $unwind: "$data"
            },
            {
                $replaceRoot:{newRoot: '$data'}
            },
            {
                $group: groupObject
            },
            {
                $project : projectObject
            }
          
        ]).toArray()
        
      result[0]['groupName'] = searchGroup.artistFullName_Eng
      console.log(result[0])
      return result[0]
    }
    else{
      return {
          status : 'ERROR : Invalid Input',
      
      }
    }
  }

  async function searchInCollections(kpopDB_search_word,other_search_word){
    let collListResult = await db.listCollections({},{nameOnly:true}).toArray()
    const filterList = [
        'kpopDB_individual','nameMap','mvDB','quizDB','analytics','tweetCollection','Group','GroupsTweetCount_'
    ]
    for(let i = 2022; i < 2023;i++){
      filterList.push('Ktown_'+i)
    }
    
    let collList = collListResult.map(obj => obj.name).filter(x =>
        filterList.every((element) => x !== element && !x.includes(element)))
    
    let concatArray = collList.map((elem) => '$' + elem)
    let facetObject = {}
    let groupObject = {
        _id: "$_id",
        }
    let projectObject = {
        _id:0,
        }   
    for(let name of collList){
        facetObject[name] = [{
            "$lookup": {
                "from": name,
                "pipeline": [
                    { "$match": { $text: {$search: `${other_search_word}`}} },
                    { $addFields:{matchScore : {$meta: "textScore"}}},
                    {$match:{ matchScore: {$gt: 1} }},
                    {"$project": {_id: 0} },
                ],
                "as": name
              }
        }]
        groupObject[name] = {
            $push : "$" +name
        }
        projectObject[name] = {
            $first: "$" +name
        }
    }

    let result = await db.collection('kpopDB').aggregate(
    [
        {
            $match:{
                $text:
                {
                    $search: `${kpopDB_search_word}`
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
        {
            "$facet": facetObject
        }, 
        { "$project": {
            "data": {
              "$concatArrays":concatArray
            }
        }},
        {
            $unwind: "$data"
        },
        {
            $replaceRoot:{newRoot: '$data'}
        },
        {
            $group: groupObject
        },
        {
            $project : projectObject
        }
       
    ]).toArray()
    
    return result[0]
  }
let test = await searchTweetCount(5)

async function dataSearch(keyword){
    console.time('search')
    keyword = parseInt(keyword)
    
    if(typeof(keyword) === 'number'){
      let searchGroup = await db.collection('kpopDB').findOne({index:keyword})

      let kpopDB_search_string = '\"'+searchGroup.artistFullName_Eng + '\" \"' +  searchGroup.artistName_KR + '\"'
      let other_search_string = searchGroup.artistFullName_Eng + ' ' +  searchGroup.artistName_KR 
      let searchGroupData = await searchInCollections(kpopDB_search_string,other_search_string)
      
        Object.filter = (obj, predicate) => 
        Object.keys(obj)
          .filter( key => predicate(obj[key]))//(obj[key] == array => (array).length> 0)
          .reduce( (res, key) => (res[key] = obj[key], res), {} );
          
        let filterObj = Object.filter(searchGroupData,(array)=> array.length > 0)
        filterObj['groupName'] = searchGroup.artistFullName_Eng 
        console.timeEnd('search') 
        return filterObj
    }
    else{
      console.timeEnd('search') 
        return {
            status : 'ERROR : Invalid Input',

        }
    }
    
}

let test2 = await dataSearch(6)

client.close()