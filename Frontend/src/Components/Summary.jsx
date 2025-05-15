import React from 'react'
import { useState,useEffect } from 'react'
import dataService from '../services/data.service'
import { Container,Row ,Col} from 'react-bootstrap'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-moment';
import Spinner from 'react-bootstrap/Spinner';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,  
    Legend,
    Filler,
    TimeScale
  } from 'chart.js';
import {Line,Bar} from 'react-chartjs-2'
import moment from 'moment'
import Indicator from './indicator.jsx'
import SearchBar from './searchBar.jsx'


export default function Brief({searchBarOption,setSearchWord}){
    ChartJS.register(TimeScale,CategoryScale,LinearScale,PointElement,LineElement,BarElement,Title,Tooltip,Legend,Filler,annotationPlugin);
    const [groupData,setGroupData] = useState({})
    const [groupIndicatorObj, setGroupIndicator] = useState({})
    const [comebackData,setComebackData] = useState({})
    const [comebackRelease_ChartData, setComebackRelease_ChartData] = useState({})
    const [comebackTweets_ChartData,setComebackTweets_ChartData] = useState({})
    const [groupChartData,setGroupChartData] = useState({})
    const [musicChartData,setMusicChartData] = useState({})
    const [comebackTextObj,setComebackTextObj] = useState({})
    
    const [musicChartTextObj,setMusicChartTextObj] = useState({})
    const [pageState, setPageState] = useState(false)

    useEffect(() => {
        dataFetch()
        document.title = ' Summary | Kpop Statistics'
    },[])
    
    useEffect(() => {
    if(Object.keys(groupData).length > 0) 
    {
        generateGroupText()
        generateGroupChart()
        setPageState(true)
    }
    
    if(Object.keys(comebackData).length > 0) 
    {
      
      generateComeBackChart()
      generateComeBackText()
    }
    
    if(Object.keys(musicChartData).length >0){
      generateMusicChartText()
    }
    
    },[groupData,comebackData,musicChartData])
    
    const groupChartOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Total Tweet Volume of Groups',
          },
        },
        elements:{
          point:{
              radius : 0,
          } 
      },
        scales: {
          x: {
            grid :{
              display: false
            }
          },
          y: {
            ticks: {
                stepSize : 5000000,
                callback: function(value) {
                    return (value/1000000) + ' M';
                }
              },
        }
        }
    }; 
    const comebackMapOptions = {
      scales: {
        x:{
          grid:{
            display: false
          }
        },
        y:{
          ticks:{
            display: false
          },
          grid:{
            display: false,
          },
          beginAtZero: true
        }
      },
      plugins:{
        legend:{
          display: false
        },
        datalabels:{
          align: 'end',
          anchor: 'start',
        },
        title:{
          display: true,
          position: 'bottom',
          text: 'Number of Comeback '
        }
      }
    }
    const generateComebackTweetsChartOption = () => {
      const annotationObj = (releaseDate,Artist) => {
        let string = releaseDate.split(',')[0]
        return  {
            label :{
              display: true,
              position:'end',
              content: Artist + ' comeback'
            },
            position: 'start',
            type: 'line',
            xMin: string,
            xMax: string
        
      }
    }
      return  {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'TweetCount Chart',
          },
            annotation:{
              annotations:{
                line1: annotationObj(comebackData.currMonth_highestTweet.Date,comebackData.currMonth_highestTweet.Artist),
                line2: annotationObj(comebackData.currMonth_secondHighestTweet.Date,comebackData.currMonth_secondHighestTweet.Artist)
              }
            }   
      },
      elements:{
        point:{
            radius : 0,
        } ,
      },
        scales: {
          x: {
            grid :{
              display: false
            }
          },
          y: {
            ticks: {
                stepSize : 200000,
                callback: function(value) {
                    return (value/1000) + ' K';
                }
          },
        }
        }
      };
    }    
      
    function generateGroupChart(){
        const date = new Date()
        let label = groupData.lastMonthTotalTweet_inDay.map((obj) => "Day " + obj.Day)
        let lastMonthData = groupData.lastMonthTotalTweet_inDay.map((obj) => obj.totalGlobalTweet + obj.totalKoreaTweet)
        let currMonthData = groupData.currMonthTotalTweet_inDay.map((obj) => obj.totalGlobalTweet + obj.totalKoreaTweet)
        
        const data = {
            labels : label,
            datasets: [
              {
                label: 'Prev Month',
                data: lastMonthData,
                borderColor: 'rgb(243, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
              },
              {
                label: 'Curr Month',
                data: currMonthData,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
            ],
        }
        setGroupChartData(data)
    }
    function generateGroupText(){
        const monthsName = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        let date = new Date()
       
        let currMonthName = monthsName[date.getMonth()]
        let currDayNo = date.getDate()
        let lastMonth_dateObj = new Date()
        lastMonth_dateObj.setMonth(date.getUTCMonth() -1,0)
 
        let lastMonth_Estimate_Global = groupData.lastMonthTotalTweet_inDay.filter((obj) => obj.Day < currDayNo).reduce((accu,curr) =>  accu + curr.totalGlobalTweet,0)
        let lastMonth_Estimate_KR =  groupData.lastMonthTotalTweet_inDay.filter((obj) => obj.Day < currDayNo).reduce((accu,curr) =>  accu + curr.totalKoreaTweet,0)

        let lastMonth_totalTweet = lastMonth_Estimate_Global + lastMonth_Estimate_KR
        let currMonth_totalTweet = groupData.currMonth_totalGlobalTweet + groupData.currMonth_totalKoreaTweet
      
        let positiveTweetGroupCount = 0;
        let negativeTweetGroupCount = 0;

        for(let obj of groupData.differenceInTweet){
            if(Math.sign(obj.tweetDifference) === 1){
                positiveTweetGroupCount++
            }
            else{
                negativeTweetGroupCount++
            }
        }
        let highest_negativeChange_Gp = groupData.differenceInTweet.find((obj) => obj.tweetDifference === Math.min(...groupData.differenceInTweet.map((obj) => obj.tweetDifference)))
        let highest_positiveChange_Gp = groupData.differenceInTweet.find((obj) => obj.tweetDifference === Math.max(...groupData.differenceInTweet.map((obj) => obj.tweetDifference)))
        let diff_percentage 

        currMonth_totalTweet > lastMonth_totalTweet ? 
        diff_percentage = Math.round((currMonth_totalTweet - lastMonth_totalTweet) / lastMonth_totalTweet * 100 ): 
        diff_percentage = Math.round((lastMonth_totalTweet -currMonth_totalTweet)/ lastMonth_totalTweet*100)
        
        let currMonthData = groupData.currMonthTotalTweet_inDay.map((obj) => obj.totalGlobalTweet + obj.totalKoreaTweet)
        let last_1_day, last_2_day
        if(date.getUTCDate() >= 3){
        last_1_day  = currMonthData.at(-1)
        last_2_day = currMonthData.at(-2)
        }
        else{
          let lastMonthData = groupData.lastMonthTotalTweet_inDay.map((obj) => obj.totalGlobalTweet + obj.totalKoreaTweet)
          if(date.getUTCDate() === 2){
            last_1_day  = currMonthData.at(-1)
            last_2_day = lastMonthData.at(-1)
          }
          if(date.getUTCDate() === 1){
            last_1_day = lastMonthData.at(-1)
            last_2_day = lastMonthData.at(-2)
          }
        }
        
        let daychange_pt
        last_1_day > last_2_day ? daychange_pt = Math.round((last_1_day - last_2_day)/last_2_day * 100) : daychange_pt = Math.round((last_2_day - last_1_day)/last_2_day * 100)

        let indicatorObj = {}
        let MonthChange = {
          heading :['Monthly Change Data','Value'],
          data : []
        } 
        let GroupTweet = {
          heading: ['Group Tweet Count',currMonthName],
          data: []
        }
        
        GroupTweet['data'].push({
          title: 'Tracked Groups' , value: groupData.currMonth_GroupCount
        })
        let totalTweet = groupData.lastMonth_totalGlobalTweet + groupData.lastMonth_totalKoreaTweet
        GroupTweet['data'].push({
          title: 'Last Month Total Tweet', value : totalTweet.toLocaleString()
        })
        GroupTweet['data'].push({
          title: 'Last Month MTD Tweet', value: lastMonth_totalTweet.toLocaleString()
        })
        GroupTweet['data'].push({
          title: 'Current Month MTD Tweet', value : currMonth_totalTweet.toLocaleString(), sign: signGenerate(currMonth_totalTweet, lastMonth_totalTweet)
        })
        GroupTweet['data'].push({
          title: 'Percentage Difference', value: diff_percentage,
        })
        GroupTweet['data'].push({
          title: 'Groups with more tweet Count', value: positiveTweetGroupCount, sign: '+'
        })
        GroupTweet['data'].push({
          title: 'Groups with less tweet Count', value: negativeTweetGroupCount, sign: '-'
        })
        let DayChange = {
          heading :['Day Change Data','Value'],
          data : []
        }   
        DayChange['data'].push({
          title : 'Day Change Percentage', value: daychange_pt + '%', sign: signGenerate(last_1_day,last_2_day )
        })
        DayChange['data'].push({
          title: 'Most Positive Change Group',value : groupData.dayChange_Data.most_positiveChange_gp.group_EngFullName,
        })
        DayChange['data'].push({
          title: 'Most Positive Change Group Percentage',value : Math.round((groupData.dayChange_Data.most_positiveChange_gp.prev_1_day - groupData.dayChange_Data.most_positiveChange_gp.prev_2_day)/ groupData.dayChange_Data.most_positiveChange_gp.prev_2_day *100) + '%', sign : '+'
        })
        DayChange['data'].push({
          title: 'Most Negative Change Group',value : groupData.dayChange_Data.most_negativeChange_gp.group_EngFullName,
        })
        DayChange['data'].push({
          title: 'Most Negative Change Group Percentage',value : Math.round((groupData.dayChange_Data.most_negativeChange_gp.prev_1_day - groupData.dayChange_Data.most_negativeChange_gp.prev_2_day)/ groupData.dayChange_Data.most_negativeChange_gp.prev_2_day *100) + '%' ,sign : '-'
        })
        MonthChange['data'].push({
          title : 'Group dropped most tweet volume', value : highest_negativeChange_Gp.group_EngFullName
        })
        let highest_Negative_tweetDifference = Math.abs(highest_negativeChange_Gp.tweetDifference)
        MonthChange['data'].push({
          title : 'dropped tweet Volume', value :highest_Negative_tweetDifference.toLocaleString()
        })
        MonthChange['data'].push({
          title : 'Group gainned most tweet volume', value :highest_positiveChange_Gp.group_EngFullName
        })
        let highest_Positive_tweetDifference =Math.abs(highest_positiveChange_Gp.tweetDifference)
        MonthChange['data'].push({
          title : 'gainned tweet volume', value :highest_Positive_tweetDifference.toLocaleString()
        })
        indicatorObj['groupTweet'] = GroupTweet
        indicatorObj['dayChange'] = DayChange
        indicatorObj['monthlyChange'] = MonthChange
        setGroupIndicator(indicatorObj)
        
    }
    function signGenerate(firstData,secondData){
       return firstData > secondData ? '+' : '-'
    }
    function generateComeBackChart(){
      let ReleaseChart_label = Object.keys(comebackData.comebackMap)
      let ReleaseChart_datasets = Object.values(comebackData.comebackMap)
      const data = {
        labels: ReleaseChart_label,
        datasets: [
          {
            label : 'Comeback Count',
            data : ReleaseChart_datasets,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgb(153, 102, 255)',
          }
        ]
      }
      function fillZeroArray(array,array2){
        let zeroArray = Array.from({length : array.length - array2.length}).fill(0)
        return zeroArray.concat(array2)
      }
      function addDate(array,StopDate){
        const month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        function dayInMonth(monthName,year){
          if(!year){
            year = new Date().getUTCFullYear()
          }
          let monthNo = month.indexOf(monthName)
          return new Date(year,monthNo+1,0).getDate()
        }

        let monthName = array.at(-1).split(' ')[0]
        let lastDayNo = parseInt(array.at(-1).split(' ')[1])
        let currMonthEndDay = dayInMonth(monthName)
        let i = lastDayNo + 1

        if(i > currMonthEndDay){
          if(month.indexOf(monthName) + 1 < 1 ){
            monthName = month[month.indexOf(monthName) + 1] 
          }else{
            monthName = month[0]
          }
          
          i = 1
          currMonthEndDay = dayInMonth(monthName)
        }
        
        let ToAddDate
        let tillDate = currMonthEndDay-2
        if(StopDate <= tillDate){
          ToAddDate = StopDate + 2
        }
        else{
          if((month.indexOf(monthName) +1) < 12){
            monthName = month[month.indexOf(monthName) + 1]
          }
          else{
            monthName = month[0]
          }
          ToAddDate = Math.abs(tillDate)
        }
        while(i <= ToAddDate){
            array.push(monthName +' '+ i)
            i++;
        }
        return array
      } // this function is to add date betweens last data point and release dates if there is gap, for visually appealing
      let comebackTweets_label = comebackData.comebackTweets_inDay.map((obj) => obj.Day)
      
      
      let comebackTweets_totalTweet_data = comebackData.comebackTweets_inDay.map((obj) => obj.totalGlobalTweet+ obj.totalKoreaTweet)
      
      let comebackTweets_highestTweetComeback_data = comebackData.currMonth_highestTweet.sumTweetOfDay.map((obj)=> obj.globalTweetTotal + obj.koreaTweetTotal)
      let comebackTweets_secondHighestTweetComeback_data = comebackData.currMonth_secondHighestTweet.sumTweetOfDay.map((obj)=> obj.globalTweetTotal + obj.koreaTweetTotal)

      if(comebackTweets_label.length !== comebackTweets_highestTweetComeback_data.length){
        comebackTweets_highestTweetComeback_data = fillZeroArray(comebackTweets_label,comebackTweets_highestTweetComeback_data)
      }
      if(comebackTweets_label.length !== comebackTweets_secondHighestTweetComeback_data.length){
        comebackTweets_secondHighestTweetComeback_data = fillZeroArray(comebackTweets_label,comebackTweets_secondHighestTweetComeback_data)
      }
      let latestReleaseDate 
      comebackData.currMonth_highestTweet.Day > comebackData.currMonth_secondHighestTweet.Day ? 
      latestReleaseDate = comebackData.currMonth_highestTweet.Day  :
      latestReleaseDate = comebackData.currMonth_secondHighestTweet.Day
      
      let condCheckArr = comebackTweets_label.map((obj) =>obj.split(' ')[0] )
      if(condCheckArr.includes('January') && condCheckArr.includes('December')){
        const months = {"January": 13,"December": 12};
        comebackTweets_label = comebackTweets_label.sort(function(a,b) {
          return months[a.split(' ')[0]] -months[b.split(' ')[0]] || parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])
        })
      }
      else{
        const months = {"January": 1,"February": 2,"March": 3,"April": 4,"May": 5,"June": 6,"July": 7,"August": 8,"September": 9,"October": 10,"November": 11,"December": 12}; 
        comebackTweets_label = comebackTweets_label.sort(function(a,b) {
          return months[a.split(' ')[0]] -months[b.split(' ')[0]] || parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])
        })
      }
      
      comebackTweets_label = addDate(comebackTweets_label,latestReleaseDate)
      
      const data2 = {
        labels: comebackTweets_label,
        datasets: [
          {
            label : 'Tweets about comebacks',
            data : comebackTweets_totalTweet_data,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgb(153, 102, 255)',
            
          },
          {
            label : comebackData.currMonth_highestTweet.Artist,
            data : comebackTweets_highestTweetComeback_data,
            backgroundColor: 'rgba(255, 153, 153, 0.2)',
            borderColor: 'rgb(255, 153, 153)',
            fill : 'origin'
          },
          {
            label : comebackData.currMonth_secondHighestTweet.Artist,
            data : comebackTweets_secondHighestTweetComeback_data,
            backgroundColor: 'rgba(143, 153, 153, 0.2)',
            borderColor: 'rgb(143, 153, 153)',
            fill : 'origin'
          }
        ]
      }
      setComebackTweets_ChartData(data2)
      
      setComebackRelease_ChartData(data)
    }
    function generateComeBackText(){

      const monthsName = ["January","February","March","April","May","June","July","August","September","October","November","December"]
      let date = new Date()
      let currMonthName = monthsName[date.getUTCMonth()]
      let first_period_comebackCount = 0
      let second_period_comebackCount = 0
      let third_period_comebackCount = 0
      for(const [index,[,value]] of Object.entries(Object.entries(comebackData.comebackMap))){
        if(index <= 10){
          first_period_comebackCount += value
        }
        else if(index > 10 && index <= 20){
          second_period_comebackCount += value
        }
        else{
          third_period_comebackCount += value
        }
      }
      let most_comeback_period_count = Math.max(first_period_comebackCount,second_period_comebackCount,third_period_comebackCount)
      let most_Comeback_Period_text = ' ';
      if(first_period_comebackCount === most_comeback_period_count ){
        most_Comeback_Period_text = <>As you can see at the chart, most of the comebacks are saturated at the first period of month (1st to 10th). There are a total of {most_comeback_period_count} at that first period</>
      }
      else if(second_period_comebackCount === most_comeback_period_count ){
        most_Comeback_Period_text = <>As you can see at the chart, most of the comebacks are saturated at the second period of month (11th to 20th). There are a total of {most_comeback_period_count} at that second period</>
      }
      else if(third_period_comebackCount === most_comeback_period_count){
        most_Comeback_Period_text = <>As you can see at the chart, most of the comebacks are saturated at the second period of month (21st to end of the month). There are a total of {most_comeback_period_count} at that third period</>
      }
      let comebackCount = comebackData.comebackCount;
      
      let comebackIntro = <p>
        There are {comebackCount} comebacks/debut at the {currMonthName}. They are expected to release as the follows, {most_Comeback_Period_text}
      </p>
      let comebackTextObj = {}
      let currMonth_comeback_highest_Tweet = comebackData.currMonth_highestTweet.tweetCountTotal_Global +comebackData.currMonth_highestTweet.tweetCountTotal_KR
      let currMonth_comeback_secondHighest_Tweet = comebackData.currMonth_secondHighestTweet.tweetCountTotal_Global +comebackData.currMonth_secondHighestTweet.tweetCountTotal_KR
      let comebackTweet = <p>
        As of {currMonthName + ' ' + date.getUTCDate()}, There are {comebackData.currMonth_totalTweet} tweets about those comebacks. Among them, {comebackData.currMonth_highestTweet.Artist} got the highest tweet [{currMonth_comeback_highest_Tweet } tweets] with "{comebackData.currMonth_highestTweet.Album}" Album which is around {Math.round((currMonth_comeback_highest_Tweet)/comebackData.currMonth_totalTweet * 100)}% of total Comeback tweets. Those tweets are {Math.round(comebackData.currMonth_highestTweet.tweetCountTotal_Global/(currMonth_comeback_highest_Tweet )*100)}% from Globally and {Math.round(comebackData.currMonth_highestTweet.tweetCountTotal_KR/(currMonth_comeback_highest_Tweet) * 100)}% from Korean Tweets. On the other hand, {comebackData.currMonth_secondHighestTweet.Artist} is rivaling to it with its comeback "{comebackData.currMonth_secondHighestTweet.Album}" currently. There are {
        currMonth_comeback_secondHighest_Tweet} tweets about them [{Math.round( comebackData.currMonth_secondHighestTweet.tweetCountTotal_Global/currMonth_comeback_secondHighest_Tweet * 100)}% tweets Globally and {Math.round( comebackData.currMonth_secondHighestTweet.tweetCountTotal_KR/currMonth_comeback_secondHighest_Tweet * 100)}% tweets in Korean]
      </p>

      let todayComebackArray = comebackData.todayComeback
      let indicatorData_todayComeback = todayComebackArray.map((obj) =>{
        let returnObj = {}
        returnObj['title'] = obj.Artist
        returnObj['value'] = obj.Song
        return returnObj
      })
      let indicatorObj = {
        heading : ['Artist','Song Name'],
        data : indicatorData_todayComeback
      }
      let todayComebackIndicator = <Row className='container_row'>
      <Container fluid>
      <Row style={{textAlign: 'center'}}>
        <p>The song planned to release today are as the follow</p>
      </Row>
      <Row className="justify-content-md-center" >
        <Col md="auto"><Indicator data={indicatorObj}/></Col>         
      </Row>    
      </Container>
    </Row>

      comebackTextObj['comebackIntro'] = comebackIntro
      comebackTextObj['tweetObj'] = comebackTweet
      comebackTextObj['todayComeback'] = todayComebackIndicator
      setComebackTextObj(comebackTextObj)
    }
    function setChartOption(ChartTitle,stepSize = 0,xAxisType){
      let optionObject = {  
        animations: {
          tension: {
            duration: 0,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: false
          }},
          responsive: true,
          maintainAspectRatio: false,
          elements:{
              point:{
                  radius : 0,
              } 
          },
          plugins: {
            legend: {
              position: 'bottom'
            },
            title: {
              display: true,
              text: ChartTitle,
            },
          },
          scales: {
              x: {
                  grid: {
                  display: false
                }
              },
              y: {
                min: 1,
                max: 30,
                reverse: true,
                ticks: {
                      stepSize: stepSize,
                    },
                grid: {
                  display: false
                }
              }
            },
           
        }
        if(xAxisType === 'time'){
          optionObject['scales']['x']['type']='time'
          optionObject['scales']['x']['time']={
                  unit: 'day',
                  stepSize: 2,
                }
        }         
        return optionObject
    }
    function setMusicChart_dataset(chart){  
   
      let label
      if(Array.isArray(chart[0]['Rank'][0])){
          if(chart[0].Rank.length > 0){
              label = chart[0]['Rank'].map((array) => new Date((array[0])).toISOString())
          }
          else{
              label = chart[0]['순위'].map((array) => new Date((array[0])).toISOString())
          }   
      }
      else{
        label = chart[0]['Rank'].map((obj) => moment(obj.year + '-' + obj.month.toString().padStart(2,'0') + '-' + obj.day.toString().padStart(2,'0'),'YYYY-MM-DD'))
      }
        let dataSet = []
        for(let i=0; i < chart.length; i++){
            let rankArrayName = Object.keys(chart[i]).includes('Rank') ? 'Rank' : '순위'
            let dataObj = {}
            dataObj['label'] = chart[i]['Song']
            if(Array.isArray(chart[i][rankArrayName][0])){
              dataObj['data'] = chart[i][rankArrayName].map((array) => array[1])
            }
            else{
              dataObj['data'] = chart[i][rankArrayName].map((obj) => obj.Rank)
            }
       
          dataObj['borderColor'] = 'rgba(255, 99, 132)'
          dataObj['backgroundColor'] = 'rgba(255, 99, 132)'
          dataSet.push(dataObj)           
        }
        let data = {
        labels: label,
        datasets: dataSet
        }
        return data  
    }
    function generateMusicChartText(){
      const naverChartData = musicChartData.naverChart
      const melonChartData = musicChartData.melonChart
      const circleChartData = musicChartData.circleChart
      function searchRank1(array,rankProperty){
        if(Array.isArray(array[0][rankProperty].at(-1))){
          return array.find((obj) => parseInt(obj[rankProperty].at(-1)[1]) === 1)
        }
        else{
          return array.find((obj) => obj[rankProperty].at(-1)['Rank'] === 1)
        }
      }
  
      function searchMostRankChange(chart,rankArrayName){
        let value,group
        if(Array.isArray(chart[0][rankArrayName][0])){
            value = chart.reduce((a,b) => {
                let lowestRank = Math.max(...b[rankArrayName].map((array) => (array[1])))
                let highestRank = Math.min(...b[rankArrayName].map((array) => (array[1])))
                let Rankdiff = lowestRank - highestRank
                return a > Rankdiff ? a : Rankdiff
            },0 )
            group = chart.find((obj) => {
                let lowestRank = Math.max(...obj[rankArrayName].map((array) => (array[1])))
                let highestRank = Math.min(...obj[rankArrayName].map((array) => (array[1])))
                let Rankdiff = lowestRank - highestRank
                return value === Rankdiff
            })
            return group
        }
        else{
            value = chart.reduce((a,b) => {
                let lowestRank = Math.max(...b[rankArrayName].map((obj) => (obj[rankArrayName])))
                let highestRank = Math.min(...b[rankArrayName].map((obj) => (obj[rankArrayName])))
                let Rankdiff = lowestRank - highestRank
                return a > Rankdiff ? a : Rankdiff
            },0)
            group = chart.find((obj) => {
                let lowestRank = Math.max(...obj[rankArrayName].map((obj) => (obj[rankArrayName])))
                let highestRank = Math.min(...obj[rankArrayName].map((obj) => (obj[rankArrayName])))
                let Rankdiff = lowestRank - highestRank
                return value === Rankdiff
            })
            return group
        }
    }
      
      
      const naverChart_Rank1 = searchRank1(naverChartData,'Rank')
      const melonChart_Rank1 = searchRank1(melonChartData,'순위')      
      const circleChart_Rank1 = searchRank1(circleChartData,'Rank')
      
      const naverChart_mostRankChange = searchMostRankChange(naverChartData,'Rank')
      const naverChart_mostRankChange_currRank = naverChart_mostRankChange.Rank.at(-1)[1]
      const naverChart_mostRankChange_lowestRank = Math.max(...naverChart_mostRankChange.Rank.map((array) => array[1]))
      const melonChart_mostRankChange = searchMostRankChange(melonChartData,'순위')
      const melonChart_mostRankChange_currRank = melonChart_mostRankChange.순위.at(-1)[1]
      const melonChart_mostRankChange_lowestRank = Math.max(...melonChart_mostRankChange.순위.map((array) => array[1]))
      const circleChart_mostRankChange = searchMostRankChange(circleChartData,'Rank')
      const circleChart_mostRankChange_currRank = circleChart_mostRankChange.Rank.at(-1).Rank
      const circleChart_mostRankChange_lowestRank = Math.max(...circleChart_mostRankChange.Rank.map((obj) => obj.Rank))
      let chartArray = [circleChart_mostRankChange,naverChart_mostRankChange,melonChart_mostRankChange]
      let musicChartTextObj = {}
      let rank1TextObj = <div>
        <p>
          For the 1st places
        </p>
        <ul>
          <li>At NaverChart, {naverChart_Rank1.Artist} with {naverChart_Rank1.Song} </li>
          <li>At MelonChart, {melonChart_Rank1.Artist} with {melonChart_Rank1.Song} </li>
          <li>At CircleChart, {circleChart_Rank1.Artist} with {circleChart_Rank1.Song}</li>
        </ul>
      </div>

      let mostRankChangeTextObj = <div>
        <p> 
         And, During last 10 days, the following group rises
        </p>
        <ul>
          <li>At NaverChart, {naverChart_mostRankChange.Artist} become Rank {naverChart_mostRankChange_currRank} from Rank {naverChart_mostRankChange_lowestRank} with {naverChart_mostRankChange.Song} </li>
          <li>At MelonChart, {melonChart_mostRankChange.Artist} become Rank {melonChart_mostRankChange_currRank} from Rank {melonChart_mostRankChange_lowestRank} with {melonChart_mostRankChange.Song} </li>
          <li>At CircleChart, {circleChart_mostRankChange.Artist} become Rank {circleChart_mostRankChange_currRank} from Rank {circleChart_mostRankChange_lowestRank} with {circleChart_mostRankChange.Song}</li>
        </ul>
        <div className='chart'>
          <Line  data={setMusicChart_dataset(chartArray)} options={setChartOption('Most Rank Change',0,'time') } />
        </div>
      </div>
      musicChartTextObj['rank1Text'] = rank1TextObj
      musicChartTextObj['rankChange'] = mostRankChangeTextObj
      setMusicChartTextObj(musicChartTextObj)
    }
    
    async function dataFetch(){

        let GroupData = await dataService.getGroupData()
        setGroupData(GroupData)

        let ComebackData = await dataService.getComebackData()
        setComebackData(ComebackData)
        
        let RankData = await dataService.getRankData()
        setMusicChartData(RankData)
       
    }
    function dataComponent(){
      return  <>
      <Row className='container_row'> 
      {Object.keys(groupChartData).length > 0 ? 
      <div className='chart'>
      <Line options={groupChartOptions} data={groupChartData}/>
      </div> 
      : <p> Loading ...</p>}
      {Object.keys(groupChartData).length > 0 ? 
      <Container fluid>
        <Row className="justify-content-md-center" >
          <Col md="auto"><Indicator data={groupIndicatorObj.groupTweet} /></Col>
        </Row>
        <Row > 
          <Col md="auto"><Indicator data={groupIndicatorObj.dayChange} />  </Col>     
          <Col md="auto" ><Indicator data={groupIndicatorObj.monthlyChange} /></Col>
        </Row>
      </Container> 
      : <p> Loading ...</p>}
      </Row>
      <Row>
      {comebackTextObj.comebackIntro}
      {
        Object.keys(comebackRelease_ChartData).length > 0 ? 
        <div >
        <Bar options={comebackMapOptions} plugins={[ChartDataLabels]} data={comebackRelease_ChartData}/>
        </div> : <p> Loading ...</p>
      }
      {comebackTextObj.todayComeback}
      {comebackTextObj.tweetObj}
      
      {
        Object.keys(comebackTweets_ChartData).length > 0 ?
        <div>
          <Line options={generateComebackTweetsChartOption()} data={comebackTweets_ChartData} />
        </div> : <div></div>
      }
      </Row>    
      <Row>
      {Object.keys(musicChartTextObj).length > 0 ? <div>{musicChartTextObj.rank1Text} {musicChartTextObj.rankChange}</div> : <p></p>}
      </Row>  
      <Row className='search_section'>
         <Row className='search_section_text'>Search Specific Data of Your Favorite Groups </Row>
         <Row> <SearchBar searchBarOption={searchBarOption} setSearchWord={setSearchWord}/>  </Row>
      </Row> 
    </>  
    } 
    function loadingComponent(){
      return <Row><Col><div className="spinner-div"><Spinner animation="border"/></div></Col></Row>
    }
    return (

      <Container className='mainPage' fluid>
      {pageState ? dataComponent(): loadingComponent()}
      </Container>
    
    )
}
