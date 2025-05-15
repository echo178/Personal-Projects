import React from 'react';
import { useState,useEffect } from 'react';
import dataService from '../services/data.service';
import { Container,Row,Col } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import WeeklySalesTable from './recent_sales_chart.jsx'
import RecentRankTable from './recent_rank_chart.jsx';
import HighlightTable from './highlight.jsx';
import {Helmet} from 'react-helmet'
export default function Recent(){
    const [data,setData] = useState()
    const [highlightData,setHighightData] = useState()
    const [pageState,setPageState] = useState(0)
    useEffect(() =>{
        fetchData()
        document.title = 'Recent Data | Kpop Statistics'
    },[])

    async function fetchData(){
        let data = await dataService.getRecentData()
        let highlighData = generateHighlightData(data)
        
        setData(data)
        setHighightData(highlighData)
        
        setPageState(1)
    }
    function generateHighlightData(dataObj){
      let returnObj = {}
      
      for(let key in dataObj){
          if(key !== 'newly_entered_to_chart' && key !== 'ktown_last_7days_sales' && key !== 'ktown_new_last_7days_sales'){
              let albumFilteredArray = dataObj[key].map((obj) => {return {Artist: obj.Artist, Albums: obj.Albums.filter((album) => album.totalSales >= 1000)}}).filter((obj)=> obj.Albums.length > 0)

              if(albumFilteredArray.length > 0){
                  returnObj[key] = albumFilteredArray
              }
              
          }
          else if(key === 'newly_entered_to_chart'){
              returnObj['newly_entered_to_chart'] = {}
              for(let chart in dataObj[key]){
                  if(dataObj[key][chart].length > 0){                    
                      let rankArrayName = (chart === 'melonChart' )? '순위' : 'Rank'                              
                      let latestEnteredSong_of_filteredChart
                      if(chart === 'circleChart'){

                        let chartFiltered_byRankDiff = dataObj[key][chart].filter((obj) => {
                          let firstRank = obj[rankArrayName][0].Rank
                          let lastRank = obj[rankArrayName].at(-1).Rank
                          let rankDiff = firstRank -lastRank
                          return rankDiff !== 0
                        })

                        let latestDate_of_chartFiltered_byRankDiff = chartFiltered_byRankDiff.map((obj) => obj[rankArrayName][0]).reduce((acc,curr) => acc = (acc > new Date(curr.year,curr.month,curr.day)) ? acc : new Date(curr.year,curr.month,curr.day), new Date(0))
                        latestEnteredSong_of_filteredChart = chartFiltered_byRankDiff.filter((obj) => latestDate_of_chartFiltered_byRankDiff.getTime() === new Date(obj[rankArrayName][0].year,obj[rankArrayName][0].month,obj[rankArrayName][0].day).getTime())
                        
                      }
                      else{
                        let chartFiltered_byRankDiff = dataObj[key][chart].filter((obj) => {
                          let firstRank = obj[rankArrayName][0][1]
                          let lastRank = obj[rankArrayName].at(-1)[1]
                          let rankDiff = firstRank - lastRank
                          return rankDiff !== 0
                        })

                        let latestDate_of_chartFiltered_byRankDiff = chartFiltered_byRankDiff.map((obj) => obj[rankArrayName][0]).reduce((acc,curr) => acc = (new Date(acc) > new Date(curr)) ? acc : curr[0], new Date(0)) 

                        latestEnteredSong_of_filteredChart = chartFiltered_byRankDiff.filter((obj) => new Date(latestDate_of_chartFiltered_byRankDiff).getTime() === new Date(obj[rankArrayName][0][0]).getTime())
                      }                                                                                                           
                      if(latestEnteredSong_of_filteredChart.length > 0){
                        returnObj['newly_entered_to_chart'][chart] = latestEnteredSong_of_filteredChart
                      }                      
                  }     
              }
          }
          else if(key === 'ktown_new_last_7days_sales'){
            let albumFilteredArray = dataObj[key].map((obj) => {return {Artist: obj.Artist, Albums: obj.Albums.filter((album) => album.Sales.Today_Sales.at(-1).Sales >= 1000)}}).filter((obj)=> obj.Albums.length > 0)
              if(albumFilteredArray.length > 0){
                  returnObj[key] = albumFilteredArray
              }
          }
          
      }
      
      return returnObj
    }
    function loadingComponent(){
        return <Row><Col><div className="spinner-div"><Spinner animation="border"/></div></Col></Row>
    }
    function dataComponent(){
      
        let latestWeek = (data.circleChart_new_distribution_weekly.length> 0 ) ?data.circleChart_new_distribution_weekly[0].Albums[0].distribution[0].week : 0;
        
        let hightlightSection ,circleChart_Distribution,  circleChart_offlineSales, Ktown_prev7days_albums, circleChart, naverChart, melonChart
        
        if(Object.keys(highlightData).length > 0){
          
          hightlightSection = <HighlightTable dataObj={highlightData}></HighlightTable>
          
        }else{
          hightlightSection = <></>
        }
        if (data.circleChart_new_distribution_weekly.length > 0) {
            circleChart_Distribution = (
              <>
                
                <div className='data' id="circleChart_distribution">
                  <div className='data-title'>
                    <h3><b>Circle Chart - Distribution</b></h3>
                  </div>
                  <p> The following albums are newly sold or first time re-entered to Circle Chart at week {latestWeek} of this year.</p>
                  <div className='chart'>{WeeklySalesTable(data.circleChart_new_distribution_weekly, 'circleChart')}</div> 
                </div>
              </>
            );
            
          } 
          else {
            circleChart_Distribution = <></>;
          }

          
        if (data.circleChart_new_offlineSales_weekly.length > 0) {
            circleChart_offlineSales = (
              <>
                
                <div className='data'  id="circleChart_offlineSales">
                  <div className='data-title'>
                    <h3><b>Circle Chart - Offline Sales</b></h3>
                  </div>
                  <p> The following albums are newly sold at <b> retail stores </b> or first time re-entered at week {latestWeek} of this year to Circle Chart <b> retail Album </b></p>
                  <div className='chart'>{WeeklySalesTable(data.circleChart_new_offlineSales_weekly, 'circleChart')}</div>
                </div>
              </>
            );
            
          } 
          else {
            circleChart_offlineSales = <></>;
          }

         
        if (data.ktown_new_last_7days_sales.length > 0) {
            Ktown_prev7days_albums = (
              <>
                
                <div className='data' id="Ktown_prevSales">
                  <div className='data-title'>
                    <h3><b>Ktown Chart</b></h3>
                  </div>
                  <p>The following albums are newly sold at <b> Ktown.com </b> or first time re-purchased at this year at Ktown4u . </p>
                  <div className='chart'>{WeeklySalesTable(data.ktown_new_last_7days_sales, 'Ktown')}</div>
                </div>
              </>
            );
            
          } 
          else {
            Ktown_prev7days_albums = <></>;
          }

        
        if (data.newly_entered_to_chart.circleChart.length > 0) {
            circleChart = (
              <>
                
                <div className='data' id="CircleChart">
                  <div className='data-title'>
                    <h3><b>Circle Chart</b></h3>
                  </div>
                  <p> The following songs are entered to Circle Chart at last <b>3</b> days</p>
                  <div className='chart'>{RecentRankTable(data.newly_entered_to_chart.circleChart)}</div>
                </div>
              </>
            );
          } 
          else {
            circleChart = <></>;
          }

          
        if (data.newly_entered_to_chart.naverChart.length > 0) {
            naverChart = (
              <>
                <div className='data' id="NaverChart">
                  <div className='data-title'>
                    <h3><b>Naver Chart</b> </h3>
                  </div>
                  <p> The following songs are entered to Naver Chart at last <b> 3</b>  days</p>
                  <div className='chart'>{RecentRankTable(data.newly_entered_to_chart.naverChart)}</div>
                </div>
              </>
            );
          }
          else {
            naverChart = <></>;
          }

        
        if (data.newly_entered_to_chart.melonChart.length > 0) {
            melonChart = (
              <>
                
                <div className='data'  id="MelonChart">
                  <div className='data-title'>
                    <h3><b>Melon Chart</b></h3>
                  </div>
                  <p> The following songs are entered to Melon Chart at last <b> 3</b> days</p>
                  <div className='chart'>{RecentRankTable(data.newly_entered_to_chart.melonChart)}</div>
                </div>
              </>
            );
          } 
          else {
            melonChart = <></>;
          }

        return <>
        <Helmet>
          <title>Recent Data | Kpop Statistics</title>
          <meta name="description" content="Recent statistics data ( Albums Sales, Music Chart Ranks) happening at K-pop industry"/>
        </Helmet>
        <Row>
            <Col>
                {hightlightSection}
            </Col>
        </Row>
        <Row>
            <Col>
                {circleChart_offlineSales}
            </Col>
        </Row>
        <Row>
            <Col>
                {circleChart_Distribution}
            </Col>
        </Row>
        <Row>
            <Col>
                {Ktown_prev7days_albums}
            </Col>
        </Row>
        <Row>
            <Col>
                {circleChart}
            </Col>
        </Row>
        <Row>
            <Col>
                {naverChart}
            </Col>
        </Row>
        <Row>
            <Col>
                {melonChart}
            </Col>
        </Row>
        </>
    }
    return <div>
    <Container className='mainPage recentPage' fluid>    
      {pageState ? dataComponent() : loadingComponent()}
    </Container>
    </div>
}