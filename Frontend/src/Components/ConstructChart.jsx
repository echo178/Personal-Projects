import React, { useEffect, useRef } from 'react';
import {Line} from 'react-chartjs-2'
import {Typeahead} from 'react-bootstrap-typeahead'
import {  Button, Form } from "react-bootstrap";
import moment from 'moment';
import { useState } from 'react';

var colorArray = ['#38DBFF', '#FFB443', '#FF5D5D', '#FFF503', '#00FF75', 
'#DD7DFF', '#000000', '#A77500','#0AB513','#9CC8A1',
'#FF8950','#ECE7E0','#80FA3C','#6FBEBA','#6F3F80',
'#CEBE72','#5B3819','#5B3819','#C7862A','#54A528',
'#38DF98','#56637D','#63517F','#382040','#B74E6F'];
function generateChart_naverChart(dataObj){
    let labelGenerator = function (){

        let label = new Set()
        for(let i = 0;i < dataObj.length ; i++){
            let currDateArray = dataObj[i].Rank.map((arr) => arr[0])
            currDateArray.forEach(element => {
                label.add(element)
            });
        }
        let returnArray = [...label]
        returnArray = returnArray.map((elem) => moment(new Date(elem)).local())
        return returnArray  
    }
    let datasets = []
    
    for(let i =0; i < dataObj.length ; i++){
      if(datasets.map((obj) => obj.label).includes(dataObj[i].Song)){
        let existingDatasetObj = datasets.find((obj) => obj.label === dataObj[i].Song)
        existingDatasetObj['data'] = [...existingDatasetObj['data'],...dataObj[i].Rank.map((arr) => {
          let returnObj = {}
          returnObj['x'] = moment(new Date(arr[0])).local()
          returnObj['y'] = arr[1]
          
          return returnObj
        })]
      }
      else{
        let dataset_data = {}
        dataset_data['label'] =  dataObj[i].Song
        dataset_data['data'] = dataObj[i].Rank.map((arr) => {
          let returnObj = {}
          returnObj['x'] = moment(new Date(arr[0])).local()
          returnObj['y'] = arr[1]
          
          return returnObj
        })
        dataset_data['borderColor'] = colorArray[i]
        dataset_data['backgroundColor'] = colorArray[i]
        datasets.push(dataset_data)
      }
        
    }
    let labels = labelGenerator(dataObj)
    return {
        labels : labels,
        datasets: datasets
    }
}

function generateChart_MelonChart(dataArr){
    let labelGenerator = function (dataArr){
        let label = new Set()
        for(let i = 0;i < dataArr.length ; i++){
            let currDateArray = dataArr[i].순위.map((arr) => arr[0])
            currDateArray.forEach(element => {
                label.add(element)
            });
        }
        let returnArray = [...label]
        returnArray = returnArray.map((elem) => moment(new Date(elem)).local())
        return returnArray  
    }
    let datasetArray = []

    for(let i = 0 ; i < dataArr.length ; i ++){
      if(datasetArray.map((obj) => obj.label).includes(dataArr[i].Song)){
        let existingDatasetObj = datasetArray.find((obj) => obj.label === dataArr[i].Song)
        existingDatasetObj['data'] = [...existingDatasetObj['data'],...dataArr[i].순위.map((arr) => {
          let returnObj = {}
          returnObj['x'] = moment(new Date(arr[0])).local()
          returnObj['y'] = arr[1]
          return returnObj
        })]
      }
      else{
        let datasetObj = {}
        datasetObj['label'] = dataArr[i].Song
        datasetObj['data'] = dataArr[i].순위.map((arr) => {
            let returnObj = {}
            returnObj['x'] = moment(new Date(arr[0])).local()
            returnObj['y'] = arr[1]
            return returnObj
        })
        datasetObj['borderColor'] = colorArray[i]
        datasetArray.push(datasetObj)
      }
    }
    let labelsArray = labelGenerator(dataArr)
    let returnChartDataObj = {
        labels: labelsArray,
        datasets: datasetArray
    }
    return returnChartDataObj
} 
function generateChart_CircleChart_Rank(dataObj){
    let labelGenerator = function (){

        let label = new Set()
        for(let i = 0;i < dataObj.length ; i++){
            let currDateArray = dataObj[i].Rank.map((obj) => obj.day + '-'+obj.month+ '-' +obj.year)
            currDateArray.forEach(element => {
                label.add(element)
            });
        }
        let returnArray = [...label]
        returnArray = returnArray.map((elem) => moment(elem,'DD-MM-YYYY').local())
        return returnArray  
    }
    let datasets = []
    for(let i = 0; i < dataObj.length ; i++){
      if(datasets.map((obj) => obj.label).includes(dataObj[i].Song)){
        let existingDatasetObj = datasets.find((obj) => obj.label === dataObj[i].Song)
        existingDatasetObj['data'] = [...existingDatasetObj['data'],...dataObj[i].Rank.map((arr) => {
          let returnObj = {}
          returnObj['x'] = moment(new Date(arr[0])).local()
          returnObj['y'] = arr[1]
          
          return returnObj
        })]
      }
      else{
        let dataset_data = {}
        dataset_data['label'] = dataObj[i].Song
        dataset_data['data'] = dataObj[i].Rank.map((obj) => {
            let returnObj = {}
            returnObj['x'] = moment(obj.day + '-'+obj.month+ '-' +obj.year,'DD-MM-YYYY').local()
            returnObj['y'] = obj.Rank
            return returnObj
           })
        dataset_data['borderColor'] = colorArray[i]
        dataset_data['backgroundColor'] = colorArray[i]
        datasets.push(dataset_data)
      }
    }
    const label = labelGenerator(dataObj)
   return {
    labels: label,
    datasets: datasets
   }
}
export default function ConstructChart_FromSongObject({songList,chartName}){
    
    const naverChartOptions = {
        responsive: true,
        maintainAspectRatio:false,
        spanGaps: 1000 * 60 * 60 * 6,
        plugins: {
          legend: {
            position: 'top',
            labels:{
              boxHeight: 0,
            }
          },
        },
        elements:{
          point:{
            radius : 0,
          } 
      },
        scales: {  
          x: {
            type: 'time',
            time : {
            unit: 'day',
           
            },
            grid :{
              display: false
            }
          },
          y: {
            reverse: true,
            min: 1,
            ticks:{
              stepSize : 50
            }
            
          }
        }
    };
    const dailyChartOptions = {
        responsive: true,
        maintainAspectRatio:false,
        spanGaps: 1000 * 60 * 60 * 24,
        plugins: {
          legend: {
            position: 'top',
            labels:{
              boxHeight: 0,
            }
          },
        },
        elements:{
          point:{
            radius : 0,
          } 
      },
        scales: {  
          x: {
            type: 'time',
            time : {
            unit: 'day',
           
            },
            grid :{
              display: false
            }
          },
          y: {
            reverse: true,
            min: 1,
            ticks:{
              stepSize : 50
            }
            
          }
        }
    };

    
    
    const typeaheadRef = useRef()
    let chartOption = (chartName === 'naverChart') ? naverChartOptions : dailyChartOptions
    let rankArrayName = (chartName === 'melonChart') ? '순위' : 'Rank' 
    let latestDate = (chartName === 'circleChart') ?  songList.map((obj) => new Date(obj[rankArrayName].at(0).year,obj[rankArrayName].at(0).month,obj[rankArrayName].at(0).day)).reduce((acc,curr) => acc > curr ? acc : curr) : songList.map((obj) => new Date(obj[rankArrayName].at(0)[0])).reduce((acc,curr) => acc > curr ? acc : curr)
    let latestSongIndex = (chartName === 'circleChart') ? songList.findIndex((obj) => new Date(obj[rankArrayName].at(0).year,obj[rankArrayName].at(0).month,obj[rankArrayName].at(0).day).getTime() === latestDate.getTime()): songList.findIndex((obj) => new Date(obj[rankArrayName].at(0)[0]).getTime() === latestDate.getTime())

    const [currChartDataObj,setChartDataObj] = useState([songList[latestSongIndex]])
    let chartDataSetGenerationFunc 
    if(chartName === 'melonChart'){
        chartDataSetGenerationFunc = generateChart_MelonChart
    }
    else if(chartName === 'naverChart'){
        chartDataSetGenerationFunc = generateChart_naverChart
    }
    else{
        chartDataSetGenerationFunc = generateChart_CircleChart_Rank
    }
    const [currChartDataSet,setChartDataSet] = useState(chartDataSetGenerationFunc([songList[0]]))
    const songNameArray = songList.map((obj) => obj.Song)
    function changeChartDataObj(e){
        e.preventDefault()
        let newDataObj_index = songNameArray.indexOf(e.target[0].value)
        let newDataObj = songList[newDataObj_index]
        setChartDataObj((prevState) => [...prevState,newDataObj])
        typeaheadRef.current?.clear()
    }
    
    useEffect(() => {
        let newDataSet =chartDataSetGenerationFunc(currChartDataObj)
        setChartDataSet(newDataSet)
    },[currChartDataObj])
    return <> 
        <div className='chart-control'>
            <Form  onSubmit={changeChartDataObj} >
                <Typeahead id="chart-typeahead" className='chart-typeahead' options={songNameArray} placeholder="Choose song ..." ref={typeaheadRef}/>
                <Button variant="outline-success" type="submit">Show</Button>
                <Button variant="outline-success" onClick={() => setChartDataObj(songList)}>Show all</Button>
                <Button variant="outline-success" onClick={() => setChartDataObj([])}>Clear</Button>    
            </Form>
            <p><small><i>{songList.length + ' song available '}</i></small></p>
            
        </div>
        <div className='chart'>
            <Line datasetIdKey={chartName} data={currChartDataSet} options={chartOption}/>
        </div>
       
    </>

}