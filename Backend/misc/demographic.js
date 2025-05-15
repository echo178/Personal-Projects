import mongodb from "mongodb";
import dotenv from 'dotenv';
import Chart from 'chart.js'
import {createCanvas} from 'canvas'
import fs from 'fs'
import ChartDataLabel from 'chartjs-plugin-datalabels'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
await client.connect()
let db = client.db()

Chart.register(ChartDataLabel)
let result = await db.collection('kpopDB_individual').aggregate(
[
    {
        $lookup:{
            from : 'kpopDB',
            let :{name:"$group"},
            pipeline:[
                {
                        $match:{
                            $expr:{
                                $or:[
                                    {$eq:['$$name',"$artistFullName_Eng"]},
                                    {$eq:['$$name',"$artistShortName_Eng"]}
                                ]
                        }
                    }
                },
                {
                    $project:{
                        _id:0,
                        activeStatus:1,
                    }
                }

            ],
            as:'groupStatus'
        }
    },
    {
        $project:{
            stageName :1,
            groupStatus : 1,
            dateOfBirth:1,
            gender:1,
            group:1,
            age: {
                $dateDiff:{
                    startDate: {
                        $dateFromString:{
                            dateString:"$dateOfBirth"
                        }   
                    },
                    endDate: '$$NOW',
                    unit:'year'
                }
            }
        }
    },
    {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: [
                  "$groupStatus",
                  0
                ]
              },
              "$$ROOT"
            ]
          }
        }
      },
      {
        $project:{
            groupStatus: 0
        }
      },
      {
        $project:{
            stageName :1,
            activeStatus: {
                $cond:[{$ne:  [ { $type : "$activeStatus"}, 'missing'] },'$activeStatus','Unknown']
            },
            dateOfBirth:1,
            gender:1,
            group:1,
            age:1
        }
      },
]).toArray()
let maleArtistArray_Active = result.filter((obj) => obj.gender === 'M' && obj.activeStatus === 'Yes')
let maleArtistArray_NActive = result.filter((obj) => obj.gender === 'M' && obj.activeStatus !== 'Yes')
let femaleArtistArray_Active = result.filter((obj) => obj.gender === 'F' && obj.activeStatus === 'Yes')
let femaleArtistArray_NActive = result.filter((obj) => obj.gender === 'F' && obj.activeStatus !== 'Yes')

console.log(maleArtistArray_Active.map(obj => obj.group))
console.log(femaleArtistArray_Active.map(obj => obj.group))
/*
function AgeCount(arr) { 
    let countArray = arr.reduce(function(countArray, obj) {
     
        if(countArray.some((findObj) => findObj.y == obj.age)){       
            let returnObj = countArray.find(findObj =>findObj.y === obj.age)
            returnObj.x = returnObj.x+1
        }
        else{
            countArray.push({y:obj.age,x:1})
        }   
      return countArray;
    }, [])

    return countArray.sort((a,b) => a.y - b.y) ;
}
let result_1 = AgeCount(maleArtistArray_Active).map(function(obj) {return {...obj, x : -Math.abs(obj.x)} } )
let result_2 = AgeCount(femaleArtistArray_Active)


/*
 if(obj.age < 18){
        obj.age = 'Under 18'
      }
      else if(obj.age >= 18 && obj.age < 25){
        obj.age = '18 - 24'
      }
      else if(obj.age >= 25 && obj.age <30){
        obj.age = '25 - 29'
      }
      else if(obj.age >= 30){
        obj.age = '30 and Above'
      }
      

const canvas = createCanvas(1024, 512)
const ctx = canvas.getContext('2d')


let chartA =  new Chart(ctx, 
    {
      type: 'bar',

      data: {
        labels : labels,
        datasets : 
        [
        {
            label : 'Male',
            data: result_1,
            backgroundColor : 'rgb(54,162,235,0.1)'
        },
        {
          label : 'Female',
          data: result_2,
          backgroundColor : 'rgb(255,99,132,0.1)'
          
        },
        ]
      },
      options: {
              devicePixelRatio:2,
              indexAxis: 'y',
              animation:false,
              layout:{
                padding:50
              },
              interaction: {
                intersect: false,
              },
              scales: {
              y: {             
                stacked:true,                
              },
              x:{
                stacked: true,
                grid:{
                  display: false,
                },
                beginAtZero:true, 
                ticks:{
                  callback: function (value,index,values){
                    return Math.abs(value)
                  }
                }
              }
            },
            plugins:{
              title: {
                display: true,
                text: 'Demographic Pyramid for K-pop Industry'
              },
              subtitle: {
                display: true,
                position:'bottom',
                text: `Data based on ${maleArtistArray_Active.length} active male artist and ${femaleArtistArray_Active.length} active female artist © K-stats.com`,
                padding:{
                  top: '20'
                }
              },
              datalabels: {
                align: 'center',
                formatter: function(value, context) {
                  return Math.abs(value.x)
              },
              font :{
                weight: 'bold'
              }
              }
            }
      },
      plugins:[{
          id: 'customCanvasBackgroundColor',
          beforeDraw: (chart, args, options) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          }
        }
      ]
    }
  )
  let labels = [...new Set([...result_1.map(obj => obj.y),...result_2.map(obj => obj.y)])]
  labels = labels.sort((a,b) => b - a)

let base64string = canvas.toDataURL('image/jpeg')
var regex = /^data:.+\/(.+);base64,(.*)$/;
var matches = base64string.match(regex)
var img = matches[2]
var buffer = Buffer.from(img, 'base64');
fs.writeFileSync('demographic_population_detail.jpeg' , buffer);
*/
client.close()