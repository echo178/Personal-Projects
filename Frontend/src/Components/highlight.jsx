import React from "react";
import WeeklySalesTable from './recent_sales_chart.jsx'
import RecentRankTable from './recent_rank_chart.jsx';
export default function highlightTable({dataObj}){
    
    const chartName = Object.keys(dataObj)
    
    let components = chartName.map((chart) => {
        switch(chart){
            case 'circleChart_new_distribution_weekly':
                return <div key={chart} className="highlight_chart">
                        <h4>Circle Chart Distribution Chart</h4>
                        {WeeklySalesTable(dataObj[chart],'circleChart')}
                        <a href="#circleChart_distribution">See More of Circle Chart Distribution Chart </a>
                     </div>
            ;
            case 'circleChart_new_offlineSales_weekly':
                return <div key={chart} className="highlight_chart">
                        {WeeklySalesTable(dataObj[chart],'circleChart')}
                        <a href="#circleChart_offlineSales">See More of Circle Chart Offlinesales Details</a>
                    </div>
            
            case 'ktown_new_last_7days_sales':
                return <div key={chart} className="highlight_chart">
                    <h4> K-Town Chart </h4>
                    {WeeklySalesTable(dataObj[chart],'Ktown')}
                    <a href="#Ktown_prevSales">See More of Ktown Chart Details</a>
                </div>
            
            case 'newly_entered_to_chart':{
                let rankChartlist = Object.keys(dataObj[chart])
                let returnCompo = rankChartlist.map((rankChart) => {
                    let linkToChart ,chartName 
                    switch(rankChart){
                        case 'circleChart':
                            linkToChart = <a href="#CircleChart">See More of Circle Chart</a>
                            chartName = 'Circle Chart'
                            break;
                        case 'naverChart':
                            linkToChart = <a href="#NaverChart">See More of Naver Chart</a>
                            chartName = 'Naver Chart'
                            break;
                        case 'melonChart':
                            linkToChart = <a href="#MelonChart">See More of Melon Chart</a>
                            chartName = 'Melon Chart'
                            break;
                        default : 
                            break;
                    }
                    return <div key={chart + rankChart} className="highlight_chart"><h4>{chartName}</h4> {RecentRankTable(dataObj[chart][rankChart])}{linkToChart}</div>
                })
                
                return returnCompo
                
            }
            default: 
                return <></>
            
        } 
    })
    return <div className="data"><div className="data-title"><h3><b>Highlight Section </b></h3></div><div className="chart"> {components}</div></div>
}