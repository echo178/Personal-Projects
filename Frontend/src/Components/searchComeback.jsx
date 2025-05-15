import React from "react";
import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import dataService from "../services/data.service.js";
import {Chart as ChartJS, CategoryScale,  LinearScale,  PointElement, LineElement, Title, Tooltip, Legend, Filler,BarElement, TimeScale  } from 'chart.js';
import {Line,Bar} from 'react-chartjs-2'
import { Container,Row,Col} from 'react-bootstrap'
import moment from 'moment'
import 'chartjs-adapter-moment';
export default function ComebackSearch({searchedArtistName}){
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,BarElement,TimeScale,Title,Tooltip,Legend,Filler,);

    const [searchedData, setSearchedData] = useState({})
    const [textObj, setTextObj] = useState({})
    const params = useParams()
    useEffect(() => {
        async function getData(){
          if(searchedArtistName){
            dataService.abortSearch()
            let year = params.year
            let month = params.month
            let artistName = searchedArtistName
            let postObj = {
                artistName : artistName,
                year : year,
                month: month
            }
            let data = await dataService.searchComeback(postObj)
            data.artistName = artistName
            document.title = artistName + " Data | Kpop Statistics "
            setSearchedData(data)
          }       
        }
        getData()
    },[searchedArtistName])
    useEffect(()=> {
       if( Object.keys(searchedData).length > 0){
        generateTextObj()
       }
    },[searchedData])
    
    const watchlistTweetOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
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
            stepSize: 2,
            },
            grid :{
              display: false
            }
          },
        }
    };
    function generateChart_watchlist_tweet(dataObj){
    
        let datasets = []

        for(let key in dataObj){
            
            for(let i = 0; i < dataObj[key].length ; i++){
                
                let dataset_data = {}
                if(dataObj[key][i].Song === ' ' || dataObj[key][i].Song === ''){
                  dataset_data['label'] = 'Song released at ' + dataObj[key][i].Date 
                }else{
                  dataset_data['label'] =  dataObj[key][i].Song
                }
                if(dataObj[key][i].sumTweetOfDay){
                  dataset_data['data'] = dataObj[key][i].sumTweetOfDay.map((obj) => {
                    let returnObj = {}
                    returnObj['x'] = moment(obj.Date + ' '+key.slice(-4),'MMM DD YYYY' ).local()
                    returnObj['y'] = obj.koreaTweetTotal + obj.globalTweetTotal    
                    return returnObj
                  })
                }
                
               if(dataset_data.data !== undefined &&  dataset_data.data.length > 0){
               dataset_data['borderColor'] = 'rgb(243, 99, 132)'
               dataset_data['backgroundColor'] = 'rgba(255, 99, 132, 0.5)'
               datasets.push(dataset_data)
               }               
            }
        }
        return {
            datasets: datasets
        }
    }
    function generateChart_watchlist_view(dataObj){
      let dataset = []
      let colorArray = ['rgba(90,240,225)','rgba(235, 64, 52)','rgba(225,175,210)']
      for(let key in dataObj){
        for(let i = 0; i < dataObj[key].length ; i++){
          if(dataObj[key][i].hasOwnProperty('views_2') && dataObj[key][i]['views_2'][0]['viewCount']){
            for(let j = 0; j < dataObj[key][i]['views_2'].length ; j++){
              let dataset_dataObj = {}
              dataset_dataObj['label'] = dataObj[key][i]['views_2'][j]['channelName']
              dataset_dataObj['data'] = dataObj[key][i]['views_2'][j]['viewCount'].map((obj) => {
                let returnObj = {}
                returnObj['x'] = moment(obj.Date)
                returnObj['y'] = obj.viewCount
                return returnObj
              })
              dataset_dataObj['borderColor'] = colorArray[j]
              dataset_dataObj['backgroundColor'] = colorArray[j]
              dataset.push(dataset_dataObj)
            }
          }
        }
      }
      return {
        datasets: dataset
      }
      
    }
    function generateChart_watchlist_Text(dataObj,groupName){
      let watchlist_with_view_array = []
      for(let key in dataObj){
        for(let i = 0 ; i < dataObj[key].length; i++){
          if(dataObj[key][i].hasOwnProperty('views_2') && Object.keys(dataObj[key][i]['views_2'][0]).includes('viewCount') ){
            watchlist_with_view_array.push(dataObj[key][i])
          }
        }
      }
      let comebackCount = watchlist_with_view_array.length
     
      let comebackCount_Text = <p> There are <strong> {comebackCount} </strong> new song release by {groupName} group. </p>
      
      let textForEachComeback = watchlist_with_view_array.map((obj) => {
        let lastViewDataPoint = moment(obj.views_2[0].viewCount[obj.views_2[0].viewCount.length-1].Date).local().format('h:mm A Do MMM')
        let totalTweet = obj.tweetCountTotal_KR + obj.tweetCountTotal_Global
        let globalTweetPtr = (obj.tweetCountTotal_Global / totalTweet)
        
        let KRTweetPtr = (1-globalTweetPtr)
        let textString =   `At ${obj.Date}, ${obj.Artist} released a song named ${obj.Song} `
        if(obj.Album  && obj.Album !== ' ' ){
          textString += `for "${obj.Album}"`
        }
        textString += `The Music Video of the song is viewed ${obj.TotalView} times at ${lastViewDataPoint} and There are ${totalTweet} tweets talking about the song. Those tweets are ${Math.round((KRTweetPtr*100)*10)/10}% in korean and ${Math.round((globalTweetPtr*100)*10)/10}% globally`
        return <li key={obj.Song}>
        {textString}
        </li>    
        
    })
  
      return <>
          {comebackCount_Text}
          {textForEachComeback}
      </>
    }
    function generateTextObj(){
        let textObj = {}
        let watchlist_ChartData_Tweet = generateChart_watchlist_tweet(searchedData)
        let watchlist_ChartData_View = generateChart_watchlist_view(searchedData)
        let watchListChart_Compo , watchlistChart_ViewCompo, watchList_Text_Compo
        if(Object.keys(watchlist_ChartData_Tweet.datasets).length > 0){
          watchListChart_Compo = <div className="chart"> <Bar datasetIdKey="watchlist" data={watchlist_ChartData_Tweet} options={watchlistTweetOptions}/></div>
          watchList_Text_Compo = generateChart_watchlist_Text(searchedData,searchedData.artistName)
        }
        if(Object.keys(watchlist_ChartData_View.datasets).length > 0){
            watchlistChart_ViewCompo = <div className="chart"> <Line datasetIdKey="watchlist" data={watchlist_ChartData_View} options={watchlistTweetOptions}/></div>
        }
        textObj['intro'] = <p>Showing data for <strong>{searchedData.artistName}</strong> </p>
        textObj['watchlist_Text'] = watchList_Text_Compo
        textObj['watchListChart'] = watchListChart_Compo
        textObj['watchListChart_View'] = watchlistChart_ViewCompo
        
        setTextObj(textObj)
    }
    return <Container className='mainPage' fluid> 
              <Row>
                { textObj.intro}
              </Row>
              <Row>
                { textObj.watchlist_Text}  
              </Row> 
              <Row>
              { textObj.watchListChart}
              </Row> 
              <Row>
                { textObj.watchListChart_View}
              </Row>  
            </Container>
}