import React, { Fragment } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import dataService from "../services/data.service";
import { Container,Row,Col} from 'react-bootstrap'
import {Chart as ChartJS, CategoryScale,  LinearScale,  PointElement, LineElement, Title, Tooltip, Legend, Filler,BarElement, TimeScale  } from 'chart.js';
import {Line,Bar} from 'react-chartjs-2'
import moment from 'moment'
import Spinner from 'react-bootstrap/Spinner';
import 'chartjs-adapter-moment';
import Indicator from "./indicator.jsx";
import InfoTag from "./info-tag.jsx";
import BrowserBar from "./browserBar.jsx";
import AnalyticTable from "./group_analytic_chart.jsx";
import SearchBar from "./searchBar.jsx";
import {Helmet} from 'react-helmet'
import ConstructChart from "./ConstructChart.jsx";

export default function GroupSearch({searchBarOption,setSearchWord} ){
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,BarElement,TimeScale,Title,Tooltip,Legend,Filler,);
    const params = useParams()
    const [groupName,setGroupName] = useState('')
    const [pageState,setPageState] = useState(0)//0 for loading, 1 for loaded
    const [initialData, setInitialData] = useState({})
    const [analyticData, setAnalyticData] = useState({})
    const [groupTweet,setGroupTweet] = useState({})
    const [mainData, setMainData] = useState({})
    const [textObj,setTextObj] = useState({})
    const [Ktown,setKtown] = useState({})
    const [watchlistData,setWatchlistData] = useState({})
    const [naverChart,setNaverChart] = useState({})
    const [melonChartData, setMelonChartData] = useState({})
    const [circleChart_Rank,setCircleChart_Rank] = useState({})
    const [renderCompo,setRenderCompo] = useState()
    
    useEffect(() => {  
      async function getData(){
        let groupNumber = params.id
        dataService.abortSearch()
        setPageState(0)
        let groupTweetData = await dataService.searchTwtFunc(groupNumber)
        
        let currentGroupName = groupTweetData.groupName
        setInitialData(groupTweetData)
        
        let currentAnalyticData = await dataService.searchAnalytic(groupNumber)
        
        setAnalyticData(currentAnalyticData)

        if(groupTweetData){
          let groupTweet = getGroupTweetData(groupTweetData)
          setGroupTweet(groupTweet) 
          setGroupName(currentGroupName)
        }
        let data = await dataService.searchFunc(groupNumber)
        if(data){
          
          let ktownData = check_getDataKey(data,'Ktown')
          let watchListData = check_getDataKey(data,'watchlist')
          let naverchartData = check_getDataKey(data,'naverChart')
          let circleChart_RankData = check_getDataKey(data,'circleChart_Rank')
          let melonChartData = check_getDataKey(data,'melonChart')
          
          setMainData(data)
          setNaverChart(naverchartData)
          setKtown(ktownData)
          setWatchlistData(watchListData)
          setCircleChart_Rank(circleChart_RankData)
          setMelonChartData(melonChartData)         
        }
      }   
      getData()
    },[params.id])
    useEffect(() => {
        if(Object.keys(initialData).length > 0){ 
          generate_initialTextObj()
          setPageState(1)
        }
    },[groupTweet])

    useEffect(() => {
      if(Object.keys(analyticData).length > 0){
        generate_analyticTextObj()
        
      }
    },[analyticData])
    useEffect(() => {
      
      if(Object.keys(mainData).length > 0 ){
        
        generateTextObj()
        setPageState(2)
      }        
  },[mainData])
    useEffect(() => {
      renderSwitch(pageState)
    },[pageState])
    
    

    const watchlistTweetOptions = {
        responsive: true,
        maintainAspectRatio:false,
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

    /*
    Utility Functions
    */
    var colorArray = ['#38DBFF', '#FFB443', '#FF5D5D', '#FFF503', '#00FF75', 
		                  '#DD7DFF', '#000000', '#A77500','#0AB513','#9CC8A1',
                      '#FF8950','#ECE7E0','#80FA3C','#6FBEBA','#6F3F80',
                      '#CEBE72','#5B3819','#5B3819','#C7862A','#54A528',
                      '#38DF98','#56637D','#63517F','#382040','#B74E6F'];
    function roundUp(value){
      let digitCount = Math.floor(Math.log10(value))
      let divisor = Math.pow(10,digitCount)/2
      return Math.ceil(value/divisor)*divisor
    }
    function getUnitOfNumber(numberDigit){
      if(numberDigit <= 6){
        return 'K'
      }
      if(numberDigit > 6){
        return 'M'
      }
    }
    function check_getDataKey(dataObj,keyName){
      let key = Object.keys(dataObj).filter((key) => key.includes(keyName)).reduce((obj,currKey) =>{
          obj[currKey] = dataObj[currKey]
          return obj
      } ,{})
      return key
    }
    function groupBy(arr, property) {
      return arr.reduce(function(memo, x) {
  
        if (!memo[x[property]]) { memo[x[property]] = []; }
  
        memo[x[property]].push(x);
        return memo;
      }, {});
    }// this function is to separate array of objects to different array by its property [for the stream digital circleChart]     
    
    /*
    Main Function to generate elements and charts
    */
    function generate_initialTextObj(){
      let indicatorObj = {}
      if(Object.keys(groupTweet).length > 0){
        let averageTweetArray = []
        let maxTweet = 0
        let maxTweetKey = ''
        let maxTweetIndex = 0
        for(let key in groupTweet){
        /*
        calculate the average
        */
        
        let totalTweet = groupTweet[key].sumTweetOfDay.reduce((acc,curr) => acc + curr.globalTweetTotal + curr.koreaTweetTotal,0)
        let averageTweet = totalTweet/groupTweet[key].sumTweetOfDay.length
        averageTweetArray.push(averageTweet)

        /*
        calculate the max tweet of day
        */
        let currMaxTweet = Math.max(...groupTweet[key].sumTweetOfDay.map((obj) => obj.globalTweetTotal + obj.koreaTweetTotal))
        
        if(currMaxTweet > maxTweet){
          maxTweet = currMaxTweet
          maxTweetKey = key
          maxTweetIndex = groupTweet[key].sumTweetOfDay.findIndex((obj) => obj.globalTweetTotal + obj.koreaTweetTotal === currMaxTweet)
        }
        }

      let maxTweetObj = groupTweet[maxTweetKey].sumTweetOfDay[maxTweetIndex]
      let year = maxTweetKey.split('_')[1].slice(-4)
      let month = maxTweetKey.split('_')[1].slice(0,-4)
      let maxTweet_Date = maxTweetObj.Date + ' ' + month + ' ' + year
      let averageTweetofGroup = Math.round(averageTweetArray.reduce((acc,curr) => acc + curr, 0) / averageTweetArray.length)
      let groupTweetObj = {
        heading: ['Group Tweet','value'],
        data : []
      }

      groupTweetObj['data'].push({
        title: 'Average Tweets Per day', value: averageTweetofGroup.toLocaleString()
      })
      groupTweetObj['data'].push({
        title: 'Peaked Tweets Amount', value: maxTweet.toLocaleString()
      })
      groupTweetObj['data'].push({
        title: 'Peaked Tweets Date', value: maxTweet_Date
      })
      indicatorObj = {
        groupTweet :  groupTweetObj
      }
      
      
      }
      else{
        indicatorObj = {
          groupTweet : {
            'heading': ['Data for this group is not available', ''],
            'data' : [{title: 'Group Tweet ', value : 0}]
          }
        }
      }

        let tweetChart_Data = generateChart_Data_Last_N_month(groupTweet)
        let chartDataSet = tweetChart_Data.datasets[0].data
        let chartOption = generate_TweetChartOption(chartDataSet)
        let groupIntroText = generateGroupInfoText(check_getDataKey(initialData,'kpopDB'))

        const GroupIntro = <>
        <div className="data">
          Showing data for <strong>{groupName}</strong> <br/>
          <br/>
          {groupIntroText}
          <div className="chart">
            <Line data={tweetChart_Data} options={chartOption} />
          </div>
          <Indicator className="indicator-width-50" data={indicatorObj.groupTweet}/>
          <div className="info">
            <p>
              <small>Due to the recent changes in Twitter API, we are unavailable to collect Tweet Volume data of Groups after 25th of April 2023. So, this data is only available till then
              </small>
              </p>
          </div>
          
        </div>  
        </>
        let textObj = {}
        textObj['intro'] = GroupIntro
        setTextObj(textObj)
    }
    function generate_analyticTextObj(){    
      console.log(analyticData)
      const AnalyticCompo = <>
          <div className="data">
            <div className="chart_title"><h2>Music Charts snippet</h2></div>
            
            <div className="analyticDiv">
              <h4> Naver Chart</h4>
              <AnalyticTable dataObj={analyticData.naverChart[0]} chartName="naverChart"/>
            </div>
            <div className="analyticDiv">
              <h4> Melon Chart</h4>
              <AnalyticTable dataObj={analyticData.melonChart[0]} chartName="melonChart"/>
            </div>
            <div className="analyticDiv">
              <h4> Circle Chart</h4>
              <AnalyticTable dataObj={analyticData.circleChart[0]} chartName="circleChart"/>
            </div>

            <div className="analyticDiv">
              <h4> Hanteo Chart</h4>
              <AnalyticTable dataObj={analyticData.hanteoChart[0]} chartName="hanteoChart"/>
            </div>
            <div className="analyticDiv">
              <h4> Bugs Chart</h4>
              <AnalyticTable dataObj={analyticData.bugsChart[0]} chartName="bugsChart"/>
            </div>  
          </div>
      </>
      const textObj = {}
      textObj['analytic'] = AnalyticCompo
      setTextObj(prevTextObj => { return {...prevTextObj,...textObj}})
    }
    function generateTextObj(){
        
        const textObj = {}
        let ktownChart_Data = generateChart_Ktown()
        
        let watchlistChart_view_data = generateChart_watchlist_view(watchlistData)
        let watchlistChart_Data = generateChart_watchlist_tweet(watchlistData)

        let circleChart_Digital_Stream_Data = generate_circleChart_Digital_Stream_Dataset()

        let circleChart_weeklySales_Rank_chartData = generate_circleChart_weeklySales_Rank()
        let circleChart_WeeklySales_Vol_chartData = generate_circleChart_weeklySales_Volume()

        let naverChartDataSet,circleChartData, melonChartDataSet
        Object.keys(naverChart).length > 0 ? naverChartDataSet = generateChart_naverChart(naverChart['naverChart']) :  naverChartDataSet = {datasets :[]}
        Object.keys(circleChart_Rank).length > 0 ? circleChartData = generateChart_CircleChart_Rank(circleChart_Rank['circleChart_Rank']) :circleChartData = {datasets :[]}
        
        Object.keys(melonChartData).length > 0 ? melonChartDataSet = generateChart_MelonChart(melonChartData['melonChart']) : melonChartDataSet = {datasets: []}
        let ktownChart_Compo,watchListChart_Compo, naverChart_Compo, melonChart_Compo,
        circleChart_Rank_Compo,circleChart_Dig_Stream_Compo,circleChart_weekly_Rank_Compo,watchlistViewChart_Compo,circleChart_weeklySales_Vol_Compo
        
        let infoText = " Blue indicates Stream Chart. Red indicates Digital Chart"
        
        if(Object.keys(watchlistChart_Data.datasets).length > 0){
          
          let Watchlist_indicator_titleObj = {
            totalTitle : 'Total Tweet',
            averageTitle : 'Average Tweet'
          }
          let watchlist_Tweet_indicatorDataset =  generate_Generic_Indicator_Obj(watchlistChart_Data,'y',['Watchlist Tweet Chart','Value'],Watchlist_indicator_titleObj)

          watchListChart_Compo = <>
          <div className="data"> 
          <div className="chart">
            <Bar datasetIdKey="watchlist" data={watchlistChart_Data} options={watchlistTweetOptions}/>
          </div>
          
          <Indicator className="indicator-width-50" data={watchlist_Tweet_indicatorDataset} />
          </div>
          </>
        }
        
        if(Object.keys(watchlistChart_view_data.datasets).length > 0){
          let watchlistViewOptions = generateChart_watchlist_view_ChartOption(watchlistChart_view_data)
          let watchlistIndicatorDataArray = generate_View_Indicator_Obj(watchlistChart_view_data.datasets,'y')
          let watchlist_TextObj = generateChart_watchlist_Text(check_getDataKey(mainData,'watchlist'),mainData.groupName)

          let watchlistIndicatorCompo = watchlistIndicatorDataArray.map((obj,index) =>
          {
            let watchlistIndicatorKey = obj.heading[1] + '_watchlistView_ '+index
            return watchlistIndicatorDataArray.length === 1 ? <Col key={watchlistIndicatorKey}><Indicator className="indicator-width-70"  data={obj}/></Col> :  <Col key={watchlistIndicatorKey}><Indicator data={obj}/></Col>
          })
             
          watchlistViewChart_Compo = <div className="data"> 
          {watchlist_TextObj}
          <div className="chart">
          <Line datasetIdKey="watchlist_view" data={watchlistChart_view_data} options={watchlistViewOptions}/>
          </div>
          <Row key="watchlist_indicator_Row">{watchlistIndicatorCompo}</Row>
          </div>
        }  
        if(Object.keys(naverChartDataSet.datasets).length > 0){
          let NaverChartText_Compo
          if(naverChartDataSet.datasets.length > 1){
            NaverChartText_Compo= generate_ChartText(naverChartDataSet, 'Naver Chart')
          }else{
            if(naverChartDataSet.datasets.length === 1){
              NaverChartText_Compo = generate_ChartText_solo(naverChartDataSet,'Naver Chart')
            }
          }
          
          naverChart_Compo = <div className="data">
            <div className="chart-text">
              {NaverChartText_Compo}
            </div>           
            <ConstructChart songList={naverChart['naverChart']} chartName='naverChart' />              
          </div>
  
        } 
        if(Object.keys(melonChartDataSet.datasets).length > 0 ){
          let melonChartText_Compo 
          
          if(melonChartDataSet.datasets.length > 1){
            melonChartText_Compo = generate_ChartText(melonChartDataSet, 'Melon Chart')
          }else{
           if(melonChartDataSet.datasets.length === 1){
            melonChartText_Compo = generate_ChartText_solo(melonChartDataSet, 'Melon Chart')
          }
        }
          
          melonChart_Compo = <div className="data">
            {melonChartText_Compo}  
          <ConstructChart songList={melonChartData['melonChart']} chartName='melonChart' />
        </div>
        }
        if(Object.keys(circleChartData.datasets).length > 0){
          let circleChartText_Compo 
          if(circleChartData.datasets.length > 1){
            circleChartText_Compo= generate_ChartText(circleChartData, 'Circle Chart')
          }else{
            if(circleChartData.datasets.length === 1){
              circleChartText_Compo= generate_ChartText_solo(circleChartData, 'Circle Chart')
            }
          }
         
          circleChart_Rank_Compo = <div className="data">
            {circleChartText_Compo} 
            <ConstructChart songList={circleChart_Rank['circleChart_Rank']} chartName='circleChart' />
           
          </div> 
        }
        if(Object.keys(circleChart_Digital_Stream_Data.datasets).length > 0){
          let cicleChart_Digital_Stream_Options = generate_circleChart_Dig_Stream_ChartOption(circleChart_Digital_Stream_Data)
          let circleChart_Digital_Stream_Text = generate_circleChart_Dig_Stream_Text(circleChart_Digital_Stream_Data)

          circleChart_Dig_Stream_Compo = <div className="data"> 
            {circleChart_Digital_Stream_Text}
            <div className="chart">
              <Line datasetIdKey="circleChart_Digital_Stream" data={circleChart_Digital_Stream_Data} options={cicleChart_Digital_Stream_Options}/>
            </div>
            <InfoTag text={infoText} />
          </div> 
        }
        if(Object.keys(circleChart_weeklySales_Rank_chartData.datasets).length) {
          let circleChart_weeklySales_Rank_Options = generate_circleChart_Dig_Stream_ChartOption(circleChart_weeklySales_Rank_chartData)   
          let weeklySales_Text_Compo = generate_circleChart_WeeklySales_Text(circleChart_weeklySales_Rank_chartData)
          circleChart_weekly_Rank_Compo = <div className="data"> 
          {weeklySales_Text_Compo}
            <div className="chart">
              
              <Line datasetIdKey="circleChart_Weekly_Sales_Rank" data={circleChart_weeklySales_Rank_chartData} options={circleChart_weeklySales_Rank_Options}/>
            </div>
            
          </div> 
        }
        
        if(Object.keys(circleChart_WeeklySales_Vol_chartData.datasets).length > 0){
          let CircleChart_Weekly_indicator_titleObj = {
            totalTitle : 'Total Album Sales',
            averageTitle : 'Average Album Sales'
          }
          
          let CircleChart_Weekly_indicator_DataSet = generate_Generic_Indicator_Obj(circleChart_WeeklySales_Vol_chartData,'y',['CircleChart Weekly Sales Chart','Value'],CircleChart_Weekly_indicator_titleObj)
          
          
          let circleChart_weeklySales_Vol_Options = generate_circleChart_weeklySales_Volume_ChartOptions(circleChart_WeeklySales_Vol_chartData)
          let circleChart_Weekly_Sales_Text = generate_SalesChart_Text(circleChart_WeeklySales_Vol_chartData,'CircleChart Weekly Sales')
          circleChart_weeklySales_Vol_Compo = <><div className="data"> 
            {circleChart_Weekly_Sales_Text}
          <div className="chart">
            <Bar datasetIdKey="circleChart_Weekly_Sales_Vol" data={circleChart_WeeklySales_Vol_chartData} options={circleChart_weeklySales_Vol_Options}/>
          </div>
          <Indicator className="indicator-width-50" data={CircleChart_Weekly_indicator_DataSet} />
          </div> 
          </>
        }
        
        if(ktownChart_Data.datasets[0].data.length > 0){
          
          let KtownChart_Option = generate_KtownChartOption(ktownChart_Data)
          let KtownChart_TextCompo = generate_SalesChart_Text(ktownChart_Data,'K-Town Chart')
          let Ktown_indicator_titleObj = {
            totalTitle : 'Total Album Sales',
            averageTitle : 'Average Album Sales'
          }
          let Ktown_indicatorDataset = generate_Generic_Indicator_Obj(ktownChart_Data,'x',['Ktown Chart','Value'],Ktown_indicator_titleObj)
          
          ktownChart_Compo = <><div className="data"> 
          {KtownChart_TextCompo}
          <div className="chart">
            <Bar datasetIdKey="ktownChart" data={ktownChart_Data} options={KtownChart_Option}/>
          </div>
          <Indicator className="indicator-width-50" data={Ktown_indicatorDataset} />
          </div>          
          </>
         
        }
        
        
        textObj['ktownChart'] = ktownChart_Compo
        textObj['watchListChart'] = watchListChart_Compo
        textObj['watchListChart_View'] = watchlistViewChart_Compo
        textObj['naverChart'] = naverChart_Compo
        textObj['melonChart'] = melonChart_Compo
        textObj['circleChart_Rank_Chart'] = circleChart_Rank_Compo
        textObj['circleChart_Digital_Stream_Chart'] = circleChart_Dig_Stream_Compo
        textObj['circleChart_WeeklySales_Rank_Chart'] = circleChart_weekly_Rank_Compo
        textObj['circleChart_WeeklySales_Vol_Chart'] = circleChart_weeklySales_Vol_Compo
        setTextObj(prevTextObj => { return {...prevTextObj,...textObj}})
    }

    /*
    About Groups
    */
    function generateGroupInfoText(dataObj){
      
      let obj = dataObj.kpopDB.find((obj) => obj.matchScore === Math.max(...dataObj.kpopDB.map((obj) => obj.matchScore)))
      let debutDateInMoment = moment(obj.Debut_Date, 'YYYY-MM-DD').format('MMMM Do YYYY')
      let textArray = []
      let text = <p key={obj.artistName_KR + ' - ' + obj.currentMember}>
      <strong>{obj.artistFullName_Eng} </strong>, also known as <strong> {obj.artistName_KR} {obj.artistShortName_Eng} </strong>  is currently a {obj.currentMember}-member  group under {obj.companyName} Company. They debuted on {debutDateInMoment}.
      </p>
      textArray.push(text)
      if(obj.Fandom_Name && (obj.Fandom_Name !== ' ' || obj.Fandom_Name !== '' )){
        let text2 = <p key={obj.Fandom_Name }> The fandom of this group is known as " {obj.Fandom_Name} "</p>
        textArray.push(text2)
      }
      
      
      return <>{textArray}</>
  
    }

    /*  
    Monthly Tweet Count 
    */
    function generate_TweetChartOption(dataSet){

      let maxDataValue = Math.max(...dataSet)
      let maxChartValue = roundUp(maxDataValue)
      let digitCount = Math.floor(Math.log10(maxDataValue))
      let chartStepSize = roundUp(maxChartValue/2)
      
      
      return {
        responsive: true,
        maintainAspectRatio: false,
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
            
            grid :{
              display: false
            },
            ticks:{
              autoSkip: false,
              callback: function(value,index){
                if(typeof(this.getLabelForValue(value)) === 'string'|| ((this.getLabelForValue(value)% 5) === 0 && this.getLabelForValue(value) < 30 )){
                  return this.getLabelForValue(value)
                }
              }
            },
            
          },
          y: {
            ticks: {
                stepSize : chartStepSize,
                callback: function(value) {
                    return (value/(function(unit){
                      if(unit === 'K'){
                        return 1000
                      }
                      else if(unit === 'M'){
                        return 1000000
                      }
                    })(getUnitOfNumber(digitCount+1))) + getUnitOfNumber(digitCount+1);
                }
              },
        }
        }
      }; 
    }
    function getGroupTweetData(dataObj){
        let groupDataKeys = Object.keys(dataObj).filter((keyName) => keyName.includes('GroupsTweetCount'))
        const monthsName = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        
        groupDataKeys = groupDataKeys.sort(
            (a,b) =>  a.slice(-4) - b.slice(-4) || monthsName.indexOf(a.split('_')[1].substring(0 , a.split('_')[1].length - 4)) - monthsName.indexOf(b.split('_')[1].substring(0 , b.split('_')[1].length - 4))
        )
        let returnObj = {}
        for(let key of groupDataKeys){
          if(dataObj[key].length > 0){
            if(dataObj[key].length < 2){
                
              returnObj[key] = dataObj[key][0]
            }
            else{
              returnObj[key] = dataObj[key]
           }
          }
           
        }
        return returnObj
    } /*sort to latest to earliest and return the grouptweetCount data */
    function generateChart_Data_Last_N_month(dataObj,nMonth = 3){
        let labels = []
        let dataSets = []
        const shortMonthName = {
            January : "Jan",
            February : "Feb",
            March : "Mar",
            April : "Apr",
            May : "May",
            June : "Jun",
            July : "Jul",
            August: "Aug",
            September : "Sep",
            October : "Oct",
            November : "Nov",
            December : "Dec"
        }
        for(let [index,[key,value]] of Object.entries(Object.entries(dataObj))){
            let totalIndex = Object.keys(dataObj).length
            if(index >= totalIndex - nMonth){
            let monthName = key.split('_')[1].substring(0 , key.split('_')[1].length - 4)
            labels = [...labels,...value.sumTweetOfDay.map((obj,index) => index === 0 ? shortMonthName[monthName] +' ' +obj.Date : obj.Date)]
            dataSets = [...dataSets,...value.sumTweetOfDay.map((obj) => obj.globalTweetTotal + obj.koreaTweetTotal)]
            }
        }
        dataSets.pop()
        
        return {
            labels: labels,
            datasets:[
                {
                    label : 'Last 3 month Tweet Vol',
                    data : dataSets,
                    borderColor: 'rgb(243, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
            ]
        }
    }/* generate the datasets for tweet for N month*/
    
    /*
    K-Town
    */
    function generateChart_Ktown(){
        let dataRow = []

        for(let key in Ktown){
            for(let i=0; i < Ktown[key].length; i++){
                let artistName = Ktown[key][i].Artist  
                let data = Ktown[key][i].Albums.map(Album => 
                { 
                  let obj = {}
                  if(Album.Album.includes('[')){
                      let labelString = Album.Album.substring(Album.Album.indexOf('[')).replace(/[[|\]]+/g,'')                   
                      obj['y'] = labelString
                  }
                  else{
                      let labelString = Album.Album.replace(artistName+ ' - ','')
                      labelString = labelString.split('(')
                      obj['y'] = labelString
                      
                  }
                  obj['artistName'] = artistName
                  obj['color'] = colorArray[i]
                  obj['x'] = Album.totalSales
                  return obj
                }) 
                dataRow = [...dataRow,...data]
                
            }      
        }
        dataRow = dataRow.sort((a,b) => b.x - a.x)
        let labels = dataRow.map((obj) => obj.y)
        let chartColor = dataRow.map((obj) => obj.color)
        let datasetChart = [{
          barPercentage: 1,
          categoryPercentage: 0.5,
          maxBarThickness: 15,
          data : dataRow,
          backgroundColor: chartColor,
        }]
        
        
        return {
          labels: labels,
          datasets: datasetChart,
          chartDataType : 'sales'
      }
    }
    function generate_KtownChartOption(dataset){
      
      let dataSetArray = dataset.datasets[0].data.map(obj => obj.x)
      let maxDataValue = Math.max(...dataSetArray)
      
      let chartMaxValue = roundUp(maxDataValue)
      let chartStepSize = roundUp(chartMaxValue /5)
      let labelCount = dataset.labels.length
      let chartFontSize 
      labelCount > 30 ? chartFontSize = 10 : chartFontSize = 12
      return {
        responsive:true,
        maintainAspectRatio:false,
        indexAxis: 'y',
        plugins: {
            legend: {
            display: false,
             
            },
          },
        scales: {
          x:{
            grid:{
              display: false
            },
            ticks:{
              display: true,
              stepSize: chartStepSize,
            }
          },
          y:{
            grid:{
              display: false,
            },
            ticks:{
              crossAlign: "far",
              autoSkip: false,
              paddingBottom : 20,
              font: {
                size: chartFontSize,
               
               
              }
            },
            beginAtZero: true,       
          }
        }
      }
    }
    function generate_SalesChart_Text(dataObj,chartName){
      let chartDataArray = dataObj.datasets[0].data
      
      let AlbumCount = chartDataArray.length
      let ArtistNameList = new Set()
      chartDataArray.forEach(obj =>ArtistNameList.add(obj.artistName))
      
      ArtistNameList = [...ArtistNameList]
      let introText = <> There are {AlbumCount} Albums sold at the {chartName} </>
      
      let intro_ArtistText1, intro_ArtistText2
      if(ArtistNameList.length > 1){
          intro_ArtistText1 = <> of {ArtistNameList.length} sub-unit / sub-group [ {ArtistNameList.toString()} ]</>
      }else{
        if(ArtistNameList[0] !== undefined){
          intro_ArtistText2 = <> by {ArtistNameList.toString()}</>
        }       
      }
      
      let mostSellAlbum = chartDataArray[0]
      let mostSellAlbum_Text, subGroupName
      if(chartDataArray.length > 1){
          mostSellAlbum_Text = <> Among those {AlbumCount} albums, {mostSellAlbum.y}   </>
          if(ArtistNameList.length > 1){
            subGroupName =  <> by {mostSellAlbum.artistName} </>  
          }          
      }
  
      return <>
          <p key={chartName + ' 1'} > {introText}{intro_ArtistText2}{intro_ArtistText1}</p>
          <p key={chartName + ' 2'}> {mostSellAlbum_Text}{subGroupName} sells the most ({mostSellAlbum.x} Albums) on {chartName}</p>
      </>
    } 
    /*
    Watchlists
    */
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
                
               if(dataset_data.data !== undefined && dataset_data.data.length > 0 ){
               dataset_data['borderColor'] = colorArray[Math.floor(Math.random() * 10)]
               dataset_data['backgroundColor'] = colorArray[Math.floor(Math.random() * 10)]
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
      for(let key in dataObj){
        for(let i = 0; i < dataObj[key].length ; i++){
          if(dataObj[key][i].hasOwnProperty('views_2') && dataObj[key][i]['views_2'][0]['viewCount']){
            for(let j = 0; j < dataObj[key][i]['views_2'].length ; j++){
              let dataset_dataObj = {}
              dataset_dataObj['label'] =dataObj[key][i].Song + ' [ '+dataObj[key][i]['views_2'][j]['channelName'] + ' ]'
              dataset_dataObj['data'] = dataObj[key][i]['views_2'][j]['viewCount'].map((obj) => {
                let returnObj = {}
                returnObj['x'] = moment(obj.Date).local()
                returnObj['y'] = obj.viewCount
                return returnObj
              })
              dataset_dataObj['borderColor'] = colorArray[Math.floor(Math.random() * 10)]
              dataset_dataObj['backgroundColor'] = colorArray[Math.floor(Math.random() * 10)]
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
     
      let comebackCount_Text = <p key={groupName + ' comeback count'}> There are <strong> {comebackCount} </strong> new song release by {groupName} group. </p>
      
      let textForEachComeback = watchlist_with_view_array.map((obj,index) => {
        let lastViewDataPoint = moment(obj.views_2[0].viewCount[obj.views_2[0].viewCount.length-1].Date).local().format('h:mm A Do MMM')
        let totalTweet = obj.tweetCountTotal_KR + obj.tweetCountTotal_Global
        let globalTweetPtr = (obj.tweetCountTotal_Global / totalTweet)
        
        let KRTweetPtr = (1-globalTweetPtr)
        let textString =   `At ${obj.Date}, ${obj.Artist} released a song named ${obj.Song} `
        if(obj.Album  && obj.Album !== ' ' ){
          textString += `for "${obj.Album}"`
        }
        textString += `The Music Video of the song is viewed ${obj.TotalView} times at ${lastViewDataPoint} and There are ${totalTweet} tweets talking about the song. Those tweets are ${Math.round((KRTweetPtr*100)*10)/10}% in korean and ${Math.round((globalTweetPtr*100)*10)/10}% globally`
        return <li key={obj.Song + index}>
        {textString}
        </li>    
      })
  
      return <>
          {comebackCount_Text}
          {textForEachComeback}
      </>
    }
    function generateChart_watchlist_view_ChartOption(dataObj){
      let maxDataValue = 0
      for(let i = 0; i < dataObj.datasets.length; i++){
        
        let currMaxDataValue = Math.max(...dataObj.datasets[i].data.map((obj) => obj.y))
       
        if(maxDataValue < currMaxDataValue){
          maxDataValue = currMaxDataValue
        }
      }
      let maxChartValue = roundUp(maxDataValue)
      
      let digitCount = Math.floor(Math.log10(maxDataValue))
      let chartStepSize = roundUp(maxChartValue/4)
     
      return {
        responsive: true,
        maintainAspectRatio:false,
        plugins: {
            tooltip: {
              mode: 'index'
            },
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
            round: 'minute',
            
            },
            grid :{
              display: false
            }
          },
          y:{
            ticks:{
              stepSize: chartStepSize,
              callback: function(value) {
                return (value/(function(unit){
                  if(unit === 'K'){
                    return 1000
                  }
                  else if(unit === 'M'){
                    return 1000000
                  }
                })(getUnitOfNumber(digitCount+1))) + getUnitOfNumber(digitCount+1);
              }
            }
          }
        }
      };
    }

    /*
    Music Charts
    */
    function generateChart_naverChart(dataObj){
        let labelGenerator = function (param){

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
      let labelGenerator = function (param){
  
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
    function generate_ChartText(dataObj,chartName){
      
      let chartListedSongCount = dataObj.datasets.length
     
      let longestChartListedLength = Math.max(...dataObj.datasets.map((obj) => obj.data.length))
      let filterDataObj = dataObj.datasets
      let modifiedDataArray =  dataObj.datasets.map((obj) => { 
        obj['peakRank'] = Math.min(...obj.data.map((dataObj) => dataObj.y ))
        
        obj['peakRankTime'] = obj.data.find((dataY) =>   parseInt(dataY.y) === parseInt(obj.peakRank)).x
        
        obj['lowestRank'] = Math.max(...obj.data.map((dataObj) => dataObj.y ))
        obj['lowestRankTime'] = obj.data.find((dataY) =>   parseInt(dataY.y) === parseInt(obj.lowestRank)).x
        obj['timeDiff'] = Math.sign(moment(obj.peakRankTime).valueOf() - moment(obj['lowestRankTime']).valueOf())
        /*
         timeDiff is millisecond difference between peak rank time and lowest rank time. it determine which happen first,so we can decide it is a positive or negative chart based on that.  
          timeDiff positive sign means rank rised
          timeDiff negative sign means rank dropped
        */ 
        obj['maxRankDiff'] = obj['lowestRank'] - obj['peakRank']
        return obj
      })
      let longestListedSong = dataObj.datasets.find((obj) => obj.data.length === longestChartListedLength)     
      let mostAchieveSong = modifiedDataArray.find((song) => song.peakRank === Math.min(...modifiedDataArray.map((obj) =>obj.peakRank)))
      let mostRankDiffSong = modifiedDataArray.find((song) => song.maxRankDiff === Math.max(...modifiedDataArray.map((obj) =>obj.maxRankDiff)))
      let leastRankDiffSong = modifiedDataArray.find((song) => song.maxRankDiff === Math.min(...modifiedDataArray.map((obj) =>obj.maxRankDiff)))
      let notableSongList = {}
      function createObj(obj,addedObj, variableName){
          if(!obj[addedObj.label]){
              obj[addedObj.label] = []
          }
          
          obj[addedObj.label].push({[variableName]: addedObj})
      }
      /*
      This function is to create a obj with a song name and their achievement in music chart. So we can use pro-nouns to the songs with duplicate achievement in the text. It make more authentic than the repetitive song names which is more like machine generated.
      */
      function generate_ChartText_Text_Compo(dataObj,chartName){
          let elementList = []
          let songCount_Text = <p key={chartName + ' intro'}> There are {chartListedSongCount} songs ranked at the {chartName}. </p>
          elementList.push(songCount_Text)
          for(let key in dataObj){
              let songName = "\" " + key + " \" "
              let songElementList = [] 
             for(let i = 0 ; i < dataObj[key].length; i++){
              if(i > 0){
                songName = 'it'
              }
              let typeOfText = Object.keys(dataObj[key][i])[0]
              let searchDataObj = dataObj[key][i][typeOfText]
              let chartStatus = searchDataObj.timeDiff
              let songElement
              
              switch(typeOfText){
                  default: 
                  songElement = <Fragment key={chartName + '_' + typeOfText}></Fragment>
                  break;
                  case 'longestListedSong':
                    songElement = <p key={searchDataObj.label + '_' + chartName + '_' + typeOfText}> Among them, {songName} takes a spot on {chartName} longest. The song placed {searchDataObj.data[0].y} from {moment(searchDataObj.data[0].x).local().format('h:mm A Do MMM')} till {moment(searchDataObj.data[searchDataObj.data.length-1].x).local().format('h:mm A Do MMM')} and ended at {searchDataObj.data[searchDataObj.data.length - 1].y} place.
                      </p>
                    break;
                  case 'mostAchieveSong':
                    songElement = <p key={chartName + '_' + typeOfText}>{songName}  has the highest rank on {chartName} as they achieve {searchDataObj.peakRank} Rank at the {moment(searchDataObj.peakRankTime).local().format('h:mm A Do MMM')}.</p>
                    break;
                  case 'mostRankDiffSong':
                    switch(chartStatus){
                      case -1 :
                        songElement = <p key={chartName + '_' + typeOfText}> {songName} faced the most fluctuate rank as its peak rank is {searchDataObj.peakRank} and the rank has dropped till {mostRankDiffSong.lowestRank} </p>
                        break;
                      case 1 : 
                        songElement = <p key={chartName + '_' + typeOfText}> {songName} faced the most fluctuate rank as its lowest rank is at " {searchDataObj.lowestRank} "" but the rank has been peaked till {mostRankDiffSong.peakRank} </p>
                        break;
                      default: 
                        songElement = <Fragment key={chartName + '_' + typeOfText}></Fragment>
                    }
                    break;
                  case 'leastRankDiffSong':
                    switch(chartStatus){
                      case -1 :
                        songElement =  <p key={chartName + '_' + typeOfText}>
                        {songName}  has the most consistent rank among chart listed songs. it started at {leastRankDiffSong.peakRank} place but it dropped to {leastRankDiffSong.lowestRank} rank in {chartName} </p>
                        break;
                      case 1 :
                        songElement = <p key={chartName + '_' + typeOfText}>  {songName} has the most consistent rank among chart listed songs. it started at {searchDataObj.lowestRank} place but it raised to {searchDataObj.peakRank} rank in {chartName}
                        </p>
                        break;
                      default: 
                        songElement = <Fragment key={chartName + '_' + typeOfText}></Fragment>
                    }
                    break;

              }
              songElementList.push(songElement)
             }
             elementList.push(songElementList)

          }
          return <>
              {elementList}
          </>
      
      }
      createObj(notableSongList, longestListedSong, Object.keys({longestListedSong})[0])
      createObj(notableSongList, mostAchieveSong, Object.keys({mostAchieveSong})[0])
      createObj(notableSongList, mostRankDiffSong, Object.keys({mostRankDiffSong})[0])
      createObj(notableSongList, leastRankDiffSong, Object.keys({leastRankDiffSong})[0])
      let returnCompo = generate_ChartText_Text_Compo(notableSongList,chartName)
      return returnCompo
    }
    function generate_ChartText_solo(dataObj,chartName){
      let songName = dataObj.datasets[0].label
      let firstDataObj = dataObj.datasets[0].data.at(0)
      let firstListedTime = moment(firstDataObj.x).local().format('Do MMM h A ')
      let firstListedRank = firstDataObj.y
  
      let lastDataObj =  dataObj.datasets[0].data.at(-1)
  
      let lastListedTime = moment(lastDataObj.x).local().format('Do MMM h A')
      let lastListedRank = lastDataObj.y
  
      let rankArray = dataObj.datasets[0].data.map((obj) => obj.y)
      let averageRank = Math.round(rankArray.reduce((a, b) => parseInt(a) + parseInt(b)) / dataObj.datasets[0].data.length)
      let peakRank = Math.min(...rankArray)
      let lowestRank = Math.max(...rankArray)
  
  
      let textString = songName + ' song has entered to the ' + chartName + ' with Rank ' + firstListedRank  + ' from ' + firstListedTime + ' to ' + lastListedTime + ' with Rank ' + lastListedRank + '. It achieved the peak Rank of Rank ' + peakRank + ' & dropped till Rank ' + lowestRank +'. So, It has achieved the average rank of ' + averageRank + '.'
  
      return <>
      {textString}
      </>
  
    }

    /*
    Circle Chart Weekly Charts
    */
    function generate_circleChart_Digital_Stream_Dataset(){
      let circleChart_Stream = check_getDataKey(mainData,'circleChart_Stream')
      let circleChart_Digital = check_getDataKey(mainData,'circleChart_Digital')
      let dataset = []
      let labelDataSet = new Set()
      let colorArray = ['rgba(53, 162, 235, 0.5)','rgba(255, 99, 132, 0.5)']
      for(let key in circleChart_Stream){
          for(let i = 0; i < circleChart_Stream[key].length; i++){
              let groupArray = groupBy(circleChart_Stream[key][i].stream,'Song')
              for(let songName in groupArray){
                  let datasetObj = {}
                  datasetObj['label'] = songName
                  datasetObj['data'] = groupArray[songName].map((obj) => {
                      let returnObj = {}
                      returnObj['x'] = obj.week
                      labelDataSet.add('week ' + obj.week)
                      returnObj['y'] = obj.streamRank
                      return returnObj
                  })
                  datasetObj["backgroundColor"] = colorArray[0]
                  datasetObj["borderColor"] = colorArray[0]
                  datasetObj['chart_type'] = 'stream'
                  dataset.push(datasetObj)
              }
          }
      }

      for(let key in circleChart_Digital){
          for(let i = 0; i < circleChart_Digital[key].length; i++){
              let groupArray = groupBy(circleChart_Digital[key][i].digital,'Song')
              for(let songName in groupArray){
                  let datasetObj = {}
                  datasetObj['label'] = songName
                  datasetObj['data'] = groupArray[songName].map((obj) => {
                      let returnObj = {}
                      returnObj['x'] = obj.week
                      labelDataSet.add('week ' + obj.week)
                      returnObj['y'] = obj.digitalRank
                      return returnObj
                  })
                  datasetObj["backgroundColor"] = colorArray[1]
                  datasetObj["borderColor"] = colorArray[1]
                  datasetObj['chart_type'] = 'digital'
                  dataset.push(datasetObj)
          }
      }
      }

      let labels = [...labelDataSet]
      labels.sort((a,b) => a.split(' ')[1] - b.split(' ')[1])


      return {
          labels : labels,
          datasets: dataset
      }
    }
    function generate_circleChart_Dig_Stream_Text(dataset){
      let songDataArray = dataset.datasets

      let totalSong,songAtDigChart,songAtStreamChart
      totalSong = songAtDigChart = songAtStreamChart = 0
      let countedSong = []
  
      for(let i = 0; i < songDataArray.length; i++ ){
          let currentSongName = songDataArray[i].label
          if(!countedSong.includes(currentSongName)){
              totalSong += 1
              countedSong.push(currentSongName)
          }
          if(songDataArray[i].chart_type === 'stream'){
              songAtStreamChart += 1
  
          }else{
              songAtDigChart +=1
          }
      }
      
      let digChartArray = songDataArray.filter((obj) => obj.chart_type === 'digital')
      let streamChartArray = songDataArray.filter((obj) => obj.chart_type === 'stream')
  
      let song_achievement = {}
      let highestRankSongDigChart,lowestRankSongDigChart
      if(digChartArray.length > 0){
        highestRankSongDigChart = digChartArray.reduce((prevObj,currObj) => 
          Math.min(...prevObj.data.map((obj) => parseInt(obj.y))) <  Math.min(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj )
      /* < for min and math.min for data array and > for max and math.max for data array, have to align with each other */
        lowestRankSongDigChart = digChartArray.reduce((prevObj,currObj) => 
        Math.max(...prevObj.data.map((obj) => parseInt(obj.y))) >  Math.max(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj ) 
      }
         
      let highestRankSongstreamChart,lowestRankSongstreamChart
      if(streamChartArray.length){
        highestRankSongstreamChart=  streamChartArray.reduce((prevObj,currObj) => 
      Math.min(...prevObj.data.map((obj) => parseInt(obj.y))) <  Math.min(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj )
  
        lowestRankSongstreamChart = streamChartArray.reduce((prevObj,currObj) => 
      Math.max(...prevObj.data.map((obj) => parseInt(obj.y))) >  Math.max(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj ) 
      }
      
      
      function createObj(obj,...addedObjs){
        if(addedObjs.dataObj !== undefined){
          
          for(let addedObj of addedObjs){
            if(!obj[addedObj.dataObj.label]){
                obj[addedObj.dataObj.label] = []
            }
            obj[addedObj.dataObj.label].push({[addedObj.variableName]: addedObj.dataObj})
          }
        }  
      }
      
      createObj(
          song_achievement,
          {dataObj : highestRankSongDigChart,variableName : Object.keys({highestRankSongDigChart})[0]},
          {dataObj : lowestRankSongDigChart,variableName : Object.keys({lowestRankSongDigChart})[0]},
          {dataObj : highestRankSongstreamChart,variableName : Object.keys({highestRankSongstreamChart})[0]},
          {dataObj : lowestRankSongstreamChart,variableName : Object.keys({lowestRankSongstreamChart})[0]}
      )
      function generate_ChartText_Text_Compo(dataObj,chartName){
          let elementList = []
          let songCount_Text = <p key="circleChart_Dig_Stream_Intro"> There are a total of {totalSong} songs listed at the Circle Chart Digital & Stream Chart. There are {songAtDigChart} songs at the digital Chart and {songAtStreamChart} at the stream Chart </p>
          elementList.push(songCount_Text)
          for(let key in dataObj){
              let songName = "\" " + key + " \" "
              let songElementList = [] 
              for(let i = 0 ; i < dataObj[key].length; i++){
                  if(i > 0){
                    songName = 'it'
                  }
                  let typeOfText = Object.keys(dataObj[key][i])[0]
                  let searchDataObj = dataObj[key][i][typeOfText]
                  let songElement
                  
                  switch(typeOfText){
                  default: songElement = <Fragment key={chartName + '_' + typeOfText}></Fragment>
                  break;
                  case 'highestRankSongDigChart':
                    songElement = <p key={searchDataObj.label + '_' + chartName + '_' + typeOfText}>  The highest rank Song on the digital Chart is <strong>{searchDataObj.label} </strong> as the highest rank is {Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The lowest rank of it is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) =>parseInt(obj.y)))).x}. </p>
                    break;
                  case 'lowestRankSongDigChart':
                    switch(songName) {
                      case 'it': 
                        songElement = <p key={chartName + '_' + typeOfText}>It is also the lowest rank song at the Digital Chart The lowest rank Song on the digital Chart is <strong>{searchDataObj.label} </strong> as the lowest rank is {Math.max(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y)=== Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}.</p>
                        break;
                      default: 
                        songElement = <p key={chartName + '_' + typeOfText}>  The lowest rank Song on the digital Chart is <strong>{searchDataObj.label} </strong> as the lowest rank is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj)  => parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y)=== Math.min(...searchDataObj.data.map((obj) =>  parseInt(obj.y)))).x}.</p>
                        break;
                    }    
                    break;
                  case 'highestRankSongstreamChart':
                    switch(songName){
                      case 'it': songElement = <p key={chartName + '_' + typeOfText}> It is also the highest rank song at Stream Chart is as the highest rank is {Math.min(...highestRankSongstreamChart.data.map((obj) =>  parseInt(obj.y)))} at week {highestRankSongstreamChart.data.find((obj) => parseInt(obj.y) === Math.min(...highestRankSongstreamChart.data.map((obj) =>  parseInt(obj.y)))).x}. The lowest rank of it is {Math.max(...highestRankSongstreamChart.data.map((obj) => parseInt(obj.y)))} at week {highestRankSongstreamChart.data.find((obj) => parseInt(obj.y) === Math.max(...highestRankSongstreamChart.data.map((obj) => parseInt(obj.y)))).x}..</p>
                      break;
                      default : songElement = <p key={chartName + '_' + typeOfText}> The highest rank Song on the stream Chart is <strong>{highestRankSongstreamChart.label} </strong> as the highest rank is {Math.min(...highestRankSongstreamChart.data.map((obj) =>parseInt(obj.y)))} at week {highestRankSongstreamChart.data.find((obj) => parseInt(obj.y) === Math.min(...highestRankSongstreamChart.data.map((obj) => parseInt(obj.y)))).x}. The lowest rank of it is {Math.max(...highestRankSongstreamChart.data.map((obj) => parseInt(obj.y)))} at week {highestRankSongstreamChart.data.find((obj) =>parseInt(obj.y) === Math.max(...highestRankSongstreamChart.data.map((obj) => parseInt(obj.y)))).x}..</p>
                      break;
                      }
                      
                  break;
                  case 'lowestRankSongstreamChart':
                    switch(songName){
                      case 'it': songElement = <p key={chartName + '_' + typeOfText}> It is also the lowest rank song at the Stream Chart as the lowest rank is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. </p>
                      break;
                      default: songElement = <p key={chartName + '_' + typeOfText}> The lowest rank Song on the stream Chart is <strong>{searchDataObj.label} </strong> as the lowest rank is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. </p>

                      break;
                    }               
                    break;
                  }
                  songElementList.push(songElement)
              }
             elementList.push(songElementList)
            }
          return <>
              {elementList}
          </>
      
      }
      let returnTextData = generate_ChartText_Text_Compo(song_achievement,'Circle Chart')
  
      return returnTextData
    }
    function generate_circleChart_WeeklySales_Text(dataset){
      let songDataArray = dataset.datasets
  
      let totalSong,songAtDistribution,songAtOfflineSales
      totalSong = songAtDistribution = songAtOfflineSales = 0
      let countedSong = []
  
      for(let i = 0; i < songDataArray.length; i++ ){
          let currentSongName = songDataArray[i].label
          if(!countedSong.includes(currentSongName)){
              totalSong += 1
              countedSong.push(currentSongName)
          }
          if(songDataArray[i].chart_type === 'offlineSales'){
              songAtOfflineSales += 1
  
          }else{
              songAtDistribution +=1
          }
      }
  
      let distributionChartArray = songDataArray.filter((obj) => obj.chart_type === 'offlineSales')
      let offlinesalesChartArray = songDataArray.filter((obj) => obj.chart_type === 'distribution')
      let song_achievement = {}
      if(distributionChartArray.length > 0){
        let highestRankSongDistributionChart = distributionChartArray.reduce((prevObj,currObj) => 
      Math.min(...prevObj.data.map((obj) => parseInt(obj.y))) <  Math.min(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj )
      /* < for min and math.min for data array and > for max and math.max for data array, have to align with each other */
      let lowestRankSongDistributionChart = distributionChartArray.reduce((prevObj,currObj) => 
      Math.max(...prevObj.data.map((obj) => parseInt(obj.y))) >  Math.max(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj ) 
      createObj( {dataObj : highestRankSongDistributionChart,variableName : Object.keys({highestRankSongDistributionChart})[0]},
                {dataObj : lowestRankSongDistributionChart,variableName : Object.keys({lowestRankSongDistributionChart})[0]},)
      }
         
  
      if(offlinesalesChartArray.length > 0){
        let highestRankSongofflinesalesChart=  offlinesalesChartArray.reduce((prevObj,currObj) => 
      Math.min(...prevObj.data.map((obj) => parseInt(obj.y))) <  Math.min(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj )
        let lowestRankSongofflinesalesChart = offlinesalesChartArray.reduce((prevObj,currObj) => 
        Math.max(...prevObj.data.map((obj) => parseInt(obj.y))) >  Math.max(...currObj.data.map((obj) => parseInt(obj.y))) ? prevObj : currObj )
        createObj({dataObj : highestRankSongofflinesalesChart,variableName : Object.keys({highestRankSongofflinesalesChart})[0]},
        {dataObj : lowestRankSongofflinesalesChart,variableName : Object.keys({lowestRankSongofflinesalesChart})[0]})
      }
       
      
      function createObj(obj,...addedObjs){
          for(let addedObj of addedObjs){
              if(!obj[addedObj.dataObj.label]){
                  obj[addedObj.dataObj.label] = []
              }
              
              obj[addedObj.dataObj.label].push({[addedObj.variableName]: addedObj.dataObj})
          }
        
      }
      
      createObj(song_achievement)
      function generate_ChartText_Text_Compo(dataObj,chartName){
          let elementList = []
          let songCount_Text = <p key="circleChart_Distribution_Offline Sales_Intro"> There are a total of {totalSong} songs listed at the Circle Chart Weekly Sales Rank Chart. There are {songAtDistribution} songs at the distribution Chart and {songAtOfflineSales} at the offline sales Chart </p>
          elementList.push(songCount_Text)
          for(let key in dataObj){
              let songName = "\" " + key + " \" "
              let songElementList = [] 
              for(let i = 0 ; i < dataObj[key].length; i++){
                  if(i > 0){
                    songName = 'it'
                  }
                  let typeOfText = Object.keys(dataObj[key][i])[0]
                  let searchDataObj = dataObj[key][i][typeOfText]
                  let songElement
                  
                  switch(typeOfText){
                  default: songElement = <Fragment key={chartName + '_' + typeOfText}></Fragment>
                  break;
                  case 'highestRankSongDistributionChart':
                    songElement = <p key={searchDataObj.label + '_' + chartName + '_' + typeOfText}>  The highest rank Song on the Distribution Chart is <strong>{searchDataObj.label} </strong> as the highest rank is {Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The lowest rank of it is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) =>parseInt(obj.y)))).x}. </p>
                    break;
                  case 'lowestRankSongDistributionChart':
                    switch(songName) {
                      case 'it': 
                        songElement = <p key={chartName + '_' + typeOfText}>It is also the lowest rank song at the Distribution Chart The lowest rank Song on the distribution Chart is <strong>{searchDataObj.label} </strong> as the lowest rank is {Math.max(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y)=== Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}.</p>
                        break;
                      default: 
                        songElement = <p key={chartName + '_' + typeOfText}>  The lowest rank Song on the distribution Chart is <strong>{searchDataObj.label} </strong> as the lowest rank is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj)  => parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y)=== Math.min(...searchDataObj.data.map((obj) =>  parseInt(obj.y)))).x}.</p>
                        break;
                    }    
                    break;
                  case 'highestRankSongofflinesalesChart':
                    switch(songName){
                      case 'it': songElement = <p key={chartName + '_' + typeOfText}> It is also the highest rank song at Offline Sales Chart is as the highest rank is {Math.min(...searchDataObj.data.map((obj) =>  parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) =>  parseInt(obj.y)))).x}. The lowest rank of it is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}..</p>
                      break;
                      default : songElement = <p key={chartName + '_' + typeOfText}> The highest rank Song on the Offline Sales Chart is <strong>{searchDataObj.label} </strong> as the highest rank is {Math.min(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The lowest rank of it is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}..</p>
                      break;
                      }
                      
                  break;
                  case 'lowestRankSongofflinesalesChart':
                    switch(songName){
                      case 'it': songElement = <p key={chartName + '_' + typeOfText}> It is also the lowest rank song at the Offline Sales Chart as the lowest rank is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) =>parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. </p>
                      break;
                      default: songElement = <p key={chartName + '_' + typeOfText}> The lowest rank Song on the Offline Sales Chart is <strong>{searchDataObj.label} </strong> as the lowest rank is {Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) =>parseInt(obj.y) === Math.max(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. The highest rank of it is {Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))} at week {searchDataObj.data.find((obj) => parseInt(obj.y) === Math.min(...searchDataObj.data.map((obj) => parseInt(obj.y)))).x}. </p>
  
                      break;
                    }               
                    break;
                  }
                  songElementList.push(songElement)
              }
             elementList.push(songElementList)
            }
          return <>
              {elementList}
          </>
      
      }
      let returnTextData = generate_ChartText_Text_Compo(song_achievement,'Circle Chart')
  
      return returnTextData
    }
    function generate_circleChart_weeklySales_Rank(){
      let circleChart_WeeklySales = check_getDataKey(mainData,'circleChart_weeklySales')
     
      let dataset = []
      let labelDataSet = new Set()
      for(let key in circleChart_WeeklySales){
          for(let i = 0; i < circleChart_WeeklySales[key].length; i++){
              
              for(let j = 0 ; j < circleChart_WeeklySales[key][i].Albums.length; j++ ){
                  let dataSetObj = {}
                  let dataSetObj_2 = {}
                  dataSetObj['label'] = dataSetObj_2['label'] = circleChart_WeeklySales[key][i].Albums[j].Album
                  if(circleChart_WeeklySales[key][i].Albums[j].offlineSales){
                      
                      dataSetObj['data'] = circleChart_WeeklySales[key][i].Albums[j].offlineSales.map((obj) => {
                      let returnObj = {}
                      returnObj['x'] = obj.week
                      labelDataSet.add('week ' +obj.week)
                      returnObj['y'] = parseInt(obj.offlineSalesRank)
                      return returnObj
                  })
                      dataSetObj['backgroundColor'] = 'rgba(255, 99, 132, 0.5)'
                      dataSetObj['borderColor'] = 'rgba(255, 99, 132, 0.5)'
                      dataSetObj['chart_type'] = 'offlineSales'
                  }
                  
                  if(circleChart_WeeklySales[key][i].Albums[j].distribution){
                      dataSetObj_2['data'] = circleChart_WeeklySales[key][i].Albums[j].distribution.map((obj)=> {
                          let returnObj = {}
                          returnObj['x'] = obj.week
                          labelDataSet.add('week ' +obj.week)
                          returnObj['y'] = parseInt(obj.distributionRank)
                          return returnObj
                      })
                      dataSetObj_2['backgroundColor'] = 'rgba(53, 162, 235, 0.5)'
                      dataSetObj_2['borderColor'] = 'rgba(53, 162, 235, 0.5)'
                      dataSetObj_2['chart_type'] = 'distribution'
                  }
                  if(dataSetObj.data){
                      dataset.push(dataSetObj)
                  }
                  if(dataSetObj_2.data){
                      dataset.push(dataSetObj_2)
                  }        
              }
          
          }
      }
      let labels = [...labelDataSet]
      labels.sort((a,b) => a.split(' ')[1] - b.split(' ')[1])
      
      
      return {
          labels : labels,
          datasets: dataset
      }
    }
    function generate_circleChart_Dig_Stream_ChartOption(dataset){
      let minValue = 1000 //just a random big value to compare with currMinValue
      let maxValue = 0
      for(let i = 0; i < dataset.datasets.length; i++){
          let currYvalue = dataset.datasets[i].data.map((obj) => obj.y)
          let currMinValue = Math.min(...currYvalue)
          let currMaxValue = Math.max(...currYvalue)
          if(currMinValue < minValue){
              minValue = currMinValue
          }
          if(currMaxValue > maxValue){
              maxValue = currMaxValue
          }
      } 
      let unRoundedStepSize = maxValue - minValue
      let roundedStepSize = roundUp((roundUp(unRoundedStepSize) / 5))
      return {
        responsive: true,
        maintainAspectRatio:false,
        plugins: {
          legend: {
            position: 'top',
            align:'start',
            maxWidth: 10,
            labels:{
              textAlign: 'center',
              padding: 15,
              boxHeight: 0,
              sort(a,b){
                function sortRGBString(stringA,stringB){
                  let [a,b,c,d] = stringA.replace(/[^\d,]/g, '').split(',')
                  let [w,x,y,z] = stringB.replace(/[^\d,]/g, '').split(',')
                  return a - w || b - x || c - y || d - z
                }
                return sortRGBString(a.fillStyle,b.fillStyle) || a.text.length - b.text.length
                }
              },
             
          },
        },
        elements:{
          point:{
              radius : 0,
          } 
      },
        scales: {
            x:{
              grid :{
              display: false
              },
              ticks:{
              callback: function(value,index){
                if(index% 5 === 4){
                  return this.getLabelForValue(value)
                }
                },
              },
            },
            y:{
              reverse: true,
              min: 1, 
              ticks: {      
                stepSize: roundedStepSize
              },
            },
        } 
      }
    }
    function generate_circleChart_weeklySales_Volume(){
      let circleChart_WeeklySales = check_getDataKey(mainData,'circleChart_weeklySales')
      
      let label = []
      let datasets = []
      for(let key in circleChart_WeeklySales){
          for(let i = 0; i < circleChart_WeeklySales[key].length; i++){
              let currentCollection_year = key.slice(-4)
              for(let j = 0 ; j < circleChart_WeeklySales[key][i].Albums.length; j++ ){
                  let albumName =  circleChart_WeeklySales[key][i].Albums[j].Album
                  let dataset = {}
                  if(circleChart_WeeklySales[key][i].Albums[j].distribution){
                      let currLabel = circleChart_WeeklySales[key][i].Albums[j].distribution.map(obj => 'week ' + obj.week + ' ' + currentCollection_year)
                      label = [...label,...currLabel]
                  }
                  if(circleChart_WeeklySales[key][i].Albums[j].offlineSales){
                      let currLabel = circleChart_WeeklySales[key][i].Albums[j].offlineSales.map(obj => 'week ' + obj.week + ' ' + currentCollection_year)
                      label = [...label,...currLabel]
                  }
                  if(circleChart_WeeklySales[key][i].Albums[j].distribution){
                      let currentSales = circleChart_WeeklySales[key][i].Albums[j].distribution.map(obj => {
                          let returnObj = {}
                          returnObj['x'] = 'week ' + obj.week + ' ' + currentCollection_year
                          returnObj['y'] = obj.distributionVol
                          return returnObj
                      })
                      if(circleChart_WeeklySales[key][i].Albums[j].offlineSales){
                          let currentOffline = circleChart_WeeklySales[key][i].Albums[j].offlineSales.map(obj => {
                              let returnObj = {}
                              returnObj['x'] = 'week ' + obj.week + ' ' + currentCollection_year
                              returnObj['y'] = obj.totalOfflineSales
                              return returnObj
                          })
                          currentOffline.forEach((currOfflineObj) => {
                              let findObj = currentSales.find((obj) => obj.x === currOfflineObj.x )
                              if(findObj){
                                  findObj['y'] = findObj['y'] + currOfflineObj.y
                              }else{
                                  currentSales.push(currOfflineObj)
                              }
                          })
                      }
                      let existDataSet = datasets.find((obj) => obj.label === albumName)
                      if(existDataSet){
                          existDataSet['data'] = [...existDataSet['data'],...currentSales]
                      }
                      else{
                          dataset['label'] = albumName
                          dataset['data'] = [...currentSales]
                          datasets.push(dataset) 
                      }
                                     
                  }
                  else{
                      let currentSales = circleChart_WeeklySales[key][i].Albums[j].offlineSales.map(obj => {
                          let returnObj = {}
                          returnObj['x'] = 'week ' + obj.week + ' ' + currentCollection_year
                          returnObj['y'] = obj.totalOfflineSales
                          return returnObj
                      })
                      let existDataSet = datasets.find((obj) => obj.label === albumName)
                      if(existDataSet){
                          existDataSet['data'] = [...existDataSet['data'],...currentSales]
                      }
                      else{
                          dataset['label'] = albumName
                          dataset['data'] = [...currentSales]
                          datasets.push(dataset) 
                      }
                      
                  }             
              }  
          }
      }
      label = [...new Set(label)]
      label = label.sort((obj1,obj2) => {
          let name1 = obj1.split(' ')
          let name2 = obj2.split(' ')
          return name1[2] - name2[2] || name1[1] - name2[1]
      })
      for(let i = 0 ; i < datasets.length; i++){
          datasets[i]['backgroundColor'] = colorArray[i]
        }
      return {
          labels : label,
          datasets : datasets,
          chartDataType : 'sales'
      }
    }
    function generate_circleChart_weeklySales_Volume_ChartOptions(dataset){
      
      let dataSetArray = dataset.datasets[0].data.map((obj,idx) => obj.x + dataset.datasets[0].data[idx].x )
      
      let maxDataValue = Math.max(...dataSetArray)
      
      let chartMaxValue = roundUp(maxDataValue)
      
      let chartStepSize = roundUp(chartMaxValue / 2)
      return {
          indexAxis: 'x',
          maintainAspectRatio:false,
          plugins: {
            tooltip: {
              mode: 'index'
            },
              legend: {
              display: false,
              },
            },
          scales: {
            x:{
              stacked: true,
              grid:{
                display: false
              },
              ticks:{
                display: true,
                stepSize: chartStepSize,
              }
            },
            y:{
              stacked: true,
              grid:{
                display: false,
              },
              ticks:{
                crossAlign: "far",
                autoSkip: false,
              },

              beginAtZero: true,       
            }
          }
    }
    }

    /*
    Indicators
    */
    function generate_Generic_Indicator_Obj(dataObj,dataAxis,heading,titleObj){
     
      let totalData = 0, dataLength = 0
      for(let i = 0; i < dataObj.datasets.length ; i++){
          let currData = dataObj.datasets[i].data.map((obj) => obj[dataAxis])
          totalData += currData.reduce((acc,curr) => acc+curr, 0)
          dataLength += currData.length
      }
      let returnDataObj = {
        heading: heading,
        data: [
            {
                title : titleObj.totalTitle,
                value : totalData
            },
        ]
      }
    
      if(dataLength > 1){
        let averageData = Math.round(totalData / dataLength)
        let averageDataObj = {
          title: titleObj.averageTitle,
          value: averageData
        }
        returnDataObj.data.push(averageDataObj)
      }
      if(dataObj.chartDataType === 'sales'){
        
        let mostSellAlbum = dataObj.datasets[0].data.find((obj) => obj[dataAxis] === Math.max(...dataObj.datasets[0].data.map((obj) => obj[dataAxis])))
        let mostSellAblumContribution = Math.round((mostSellAlbum[dataAxis] /totalData ) * 100)
        let mostSellAlbumObj = {
          title : "Top Sell Album Sales Contribution",
          value : mostSellAblumContribution + '%'
        }
        returnDataObj.data.push(mostSellAlbumObj)
      }
      
      return returnDataObj
    }
    function generate_View_Indicator_Obj(array,dataAxis){
      let dataArray = []
      for(let j = 0; j < array.length; j++){
          let growthRateArray = []
          let percentChangeArray = []
          let peak_AbsoluteChange_Value = 0
          let peak_AbsoluteChange_Index, peak_PercentageChange_Index
          let peak_PercentageChange_Value = 0
  
          for(let i = 0 ; i < array[j].data.length ; i++){      
              if(i !== 0 && array[j].data.length >= 2){
                  let currentValue = array[j].data[i][dataAxis]
                  let prevValue =array[j].data[i - 1][dataAxis]
                  let absoluteChange = (currentValue - prevValue)
                  
                  let growthRate =  absoluteChange/ prevValue
                  
                  let percentChange 
                  if((growthRate * 100) < 1){
                      percentChange = parseFloat((growthRate * 100).toFixed(1))
                  }
                  else{
                      percentChange = (Math.round((growthRate* 100)*10)/10)
                  }
  
                  if(absoluteChange > peak_AbsoluteChange_Value){
                      peak_AbsoluteChange_Value = absoluteChange
                      peak_AbsoluteChange_Index = i - 1
                  }
                  if(percentChange > peak_PercentageChange_Value){
                      peak_PercentageChange_Value = percentChange
                      peak_PercentageChange_Index = i - 1
                  }
                  growthRateArray.push(growthRate)
                  percentChangeArray.push(percentChange)
              }
          }
          
          let averagePercentChange = parseFloat((percentChangeArray.reduce((acc,curr) => acc+ curr, 0) / percentChangeArray.length).toFixed(1))
          
          if(Object.is(averagePercentChange, NaN)){
            averagePercentChange = 0;
          }
          let peak_AbsoluteChange_Time , peak_PercentageChange_Time
          if(peak_AbsoluteChange_Index){
            peak_AbsoluteChange_Time = array[j].data[peak_AbsoluteChange_Index].x
          }else{
            peak_AbsoluteChange_Time = array[j].data[0].x 
            // will use the first index to ensure replacement time exist before it can be calculated 
            // occurance at the start of data collection
          }
          if(peak_PercentageChange_Index){
            peak_PercentageChange_Time = array[j].data[peak_PercentageChange_Index].x
          }
          else{
            peak_PercentageChange_Time =  array[j].data[0].x
          }  
                      
          let returnDataObj = {
              heading : ['Channel Name',array[j].label],
              data: [
                  {
                      title : 'Average View Growth',
                      value : averagePercentChange + '%'
                  },
                  {
                      title : 'Peak View count increase',
                      value : peak_AbsoluteChange_Value + ' view'
                  },
                  {
                      title : 'Time frame',
                      value : peak_AbsoluteChange_Time.local().format('h:mm A Do MMM'),     
                  },
                  {
                      title : 'Peak View growth percentage',
                      value : peak_PercentageChange_Value + '%'
                  },
                  {
                      title : 'Time frame',
                      value : peak_PercentageChange_Time.local().format('h:mm A Do MMM'),     
                  },
              ],
          }
          
          dataArray.push(returnDataObj)
      }
      
      return dataArray
    }
  
    function dataComponent(){
      let ktownChart,watchlistChart, naverChart,circleChart_Rank,watchlistChart_View,circleChart_Dig_Stream_Compo, circleChart_WeeklySales_Rank_Compo,circleChart_WeeklySales_Vol_Compo, melonChart;
      ktownChart = watchlistChart = watchlistChart_View= naverChart = circleChart_Rank = circleChart_Dig_Stream_Compo = circleChart_WeeklySales_Rank_Compo =circleChart_WeeklySales_Vol_Compo = melonChart = <></>;
          
      if(textObj.ktownChart){
        ktownChart =<Row>
      <div className="chart_title"><img src="https://www.ktown4u.com/theme/b2c2018/new_m/images/logo.png" alt="ktown4u logo"></img></div>
      <BrowserBar style={{backgroundColor:colorArray[7]}}/ >
      {textObj.ktownChart}   
      </Row>
      }
  
      if(textObj.watchListChart){
        watchlistChart =<Row>
          <h2 className="chart_title">Comeback Chart - Tweet</h2>{textObj.watchListChart}
        </Row>
      }
      if(textObj.watchListChart_View){
        watchlistChart_View = <Row>
          <h2 className="chart_title">Comeback Chart - View</h2>{textObj.watchListChart_View} 
        </Row>
      }
      if(textObj.melonChart){
        melonChart = <Row>
        <div className="chart_title"><img src='https://cdnimg.melon.co.kr/resource/image/web/common/logo_melon142x99.png' alt="melon logo"></img></div>
        <BrowserBar style={{backgroundColor:colorArray[0]}}/ >
        {textObj.melonChart} 
      </Row>
      }
      
      if(textObj.naverChart){
        naverChart = <Row>
        
        <div className="chart_title">
          <img src='https://vibe.naver.com/about/img/logo.png' alt="naver logo" className="naverLogo"></img>
        </div>
        <BrowserBar style={{backgroundColor:colorArray[1]}}/>
        {textObj.naverChart}  
        </Row>
      }

      if(textObj.circleChart_Rank_Chart){
        circleChart_Rank =  <Row>
      <div className="chart_title"><img src="https://circlechart.kr/assets/img/pc_logo.png" alt="circleChart logo"></img></div>
      <BrowserBar style={{backgroundColor:colorArray[2]}}/ >
      {textObj.circleChart_Rank_Chart}  
      </Row>
      }

      if(textObj.circleChart_Digital_Stream_Chart){
        circleChart_Dig_Stream_Compo =  <Row>
         
      <div className="chart_title"><img src="https://circlechart.kr/assets/img/pc_logo.png" alt="circleChart logo"></img><h6>Digital & Stream Rank</h6></div>
      <BrowserBar style={{backgroundColor:colorArray[3]}}/ >
      {textObj.circleChart_Digital_Stream_Chart} 
      </Row>
      }

      if(textObj.circleChart_WeeklySales_Rank_Chart){
        circleChart_WeeklySales_Rank_Compo =  <Row>
      <div className="chart_title"><img src="https://circlechart.kr/assets/img/pc_logo.png" alt="circleChart logo"></img><h6>Weekly Sales Rank</h6> </div>
      <BrowserBar style={{backgroundColor:colorArray[4]}}/ >
      {textObj.circleChart_WeeklySales_Rank_Chart}
      </Row>
      }

      if(textObj.circleChart_WeeklySales_Vol_Chart){
        circleChart_WeeklySales_Vol_Compo = <Row>
        <div className="chart_title"><img src="https://circlechart.kr/assets/img/pc_logo.png" alt="circleChart logo"></img><h6>Weekly Sales Volume</h6></div>
        <BrowserBar style={{backgroundColor:colorArray[5]}}/ >
        {textObj.circleChart_WeeklySales_Vol_Chart} 
        </Row>
      }
      return  <>
      <Helmet>
          <title>{ groupName + ' K-pop Data'}</title>
          <meta name="description" content={"Kpop statistics data ( Albums Sales, Music Chart Ranks , Comebacks ) for "+ groupName}/>
      </Helmet>
      
      <Row>
        {textObj.intro}
      </Row>
      <Row>
        {textObj.analytic}
      </Row>
      
      {
        watchlistChart
      }
      {
        watchlistChart_View
      }
      {
        naverChart
      }
      {
        melonChart
      }
      {
        circleChart_Rank
      }
      {
        circleChart_Dig_Stream_Compo
      }
      {
        circleChart_WeeklySales_Rank_Compo
      }
      {
        circleChart_WeeklySales_Vol_Compo
      }
      {
        ktownChart
      }
      
      </>
      
    }
    function loadingComponent(){
      return <Row><Col><div className="spinner-div"><Spinner animation="border"/></div></Col></Row>
    }
    function renderSwitch(param){
      let returnCompo 
      
      switch(pageState){
        case 0:
          returnCompo = loadingComponent()
          break;
          
        case 1:{
          returnCompo = <>{dataComponent()} {loadingComponent()} </> 
          break;
          
        }        
        case 2:{
          returnCompo = <>{dataComponent()} </> 
          break;
          
        }        
        default: returnCompo = loadingComponent()
          
      }
      
      setRenderCompo(returnCompo)
    }
    return (
        <div>
            <Container className='mainPage' fluid>    
              {renderCompo}
              {
                <Row className='search_box_section'>
                  <Row className='search_box_section_text'><strong>Search Your Next Favorite Group </strong> </Row>
                  <Row> <SearchBar searchBarOption={searchBarOption} setSearchWord={setSearchWord}/>  </Row>
                </Row> 
              }
            </Container>
        </div>
    )
}