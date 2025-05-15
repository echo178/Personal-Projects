import mongodb from "mongodb";
import dotenv from 'dotenv'


dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

let KtownQueries = await db.collection('Ktown_2023').aggregate(
    [
        {
            $match:{
                $text:{
                    $search: "Blackpink"
                }
            }
        },
        {
            $lookup:{
                from : "Ktown_2022",
                localField : "Artist",
                foreignField : "Artist",
                as : 'prev',
                pipeline:[
                    {
                        $project:{
                            _id:0,
                            Albums: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                'newArray':{
                    $concatArrays:[{$first: '$prev.Albums'},'$Albums']
                }
            }
        },
        {
            $unwind: {
              path: '$newArray'
            }
        },
        {
            $group:{
                _id:{Album: '$newArray.Album',Artist:'$Artist'},       
                Today_Sales: {
                    $push: '$newArray.Sales.Today_Sales'
                },
                Total_Sales: {
                    $push: '$newArray.Sales.Total_Sales'
                },
                totalSales: {
                    $max : '$newArray.totalSales'
                }
                
            }
        },
        {
            $project: {
              "Today_Sales": {
                $reduce: {
                  input: '$Today_Sales',
                  initialValue: [],
                  in: {$concatArrays: ['$$value', '$$this']}
                }
              },

              "Total_Sales": {
                $reduce: {
                  input: '$Total_Sales',
                  initialValue: [],
                  in: {$concatArrays: ['$$value', '$$this']}
                }
              },
              totalSales: 1,
              AverageSales: {
                $avg : "$Today_Sales.Sales"
              }
            }
        },
        {
            $addFields: {
              groupValue: 
                {
                    $switch: {
                       branches: [
                          { case: { $lt: [ '$totalSales', 1000 ] }, then: "Below 1000" },
                          { case: { $and: [{$gte : ['$totalSales',1000]}
                                        ,{$lt : ['$totalSales',10000]}] }, then: "Between 1000 - 9999" },
                          { case: { $gte: ['$totalSales',10000] }, then: "Above 10000" }
                       ]
                    }
                }
            }  
        },
        {
            $unwind: {
                path: '$Today_Sales',
                includeArrayIndex: 'index',
            }
        },  
        
        {
            $group: {
              _id: {
                groupValue: '$groupValue',
                index: '$index'
              },
              Sales:{
                $avg : '$Today_Sales.Sales'
              }
            }
        },
        {
            $sort: {
                "_id.index": 1
            }
        }, 
        {
            $group: {
              _id: {
                groupValue: '$_id.groupValue',
              },
              albumSales : {$first: '$_id.groupValue'},
              averageAlbumSalesArray:{
                $push : {$round: ['$Sales',0]}
              }
            }
        },
        {
            $project:{
                _id: 0,
                averageAlbumSalesArray: 1,
                Group : {$concat: ['Album Sales ', '$albumSales']},
                chart: 'Ktown',
                Artist: 'chartOverall'
            }
        },
       
    ]
).toArray()

console.log(result)
function simplifyArray(inputArray){
    let denomiator_100based_array = Math.round(inputArray.length/100)
    let returnArray  =  []
    if(denomiator_100based_array > 1){ 
            while(denomiator_100based_array <=  inputArray.length){
                let splice_array =inputArray.splice(0,denomiator_100based_array)
                let sum = splice_array.reduce((acc,curr) => acc + curr,0)
                let averageValue = Math.round(sum / denomiator_100based_array)
                returnArray.push(averageValue)
            }
            if(inputArray.length > 0){
                let remainingLength = inputArray.length
                let remainingArray = inputArray.splice(0,remainingLength)            
                let lastSum = remainingArray.reduce((acc,curr) => acc+curr,0)            
                let lastValue = Math.round(lastSum/remainingLength)            
                returnArray.push(lastValue)
            }
        return returnArray
    }else{
        return inputArray
    }
   
    
}
client.close()

