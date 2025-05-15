import axios from 'axios'

export async function checkGlobalDate(){
    let date = await axios.post('https://circlechart.kr/data/api/chart_func/global/default_value',null, {
        params:{
            termGbn:'day'
        }
    }).then(
        result => result.data.List[0].YYYYMMDD
    )
    let checkDateObj = {}
    checkDateObj['year'] = parseInt(date.substring(0,4))
    checkDateObj['month'] = parseInt(date.substring(4,6))
    checkDateObj['day'] = parseInt(date.substring(6,8))
    return checkDateObj
}

export default async function circleChart_GlobalChart(InputDate){
    let date = InputDate || await axios.post('https://circlechart.kr/data/api/chart_func/global/default_value',null, {
        params:{
            termGbn:'day'
        }
    }).then(
        result => result.data.List[0].YYYYMMDD
    )
    let digitalChart = await axios.post('https://circlechart.kr/data/api/chart/global', null, {
        params:{
            termGbn: 'day',
            yyyymmdd: date
        }
    }).then(result => {
        let chart = Object.values(result.data.List)
        let dataArray = []
        

        for(let i = 0 ; i < chart.length; i++){
            let dataObj = {}
            let Rank = {}
            Rank['year'] = parseInt(date.substring(0,4))
            Rank['month'] = parseInt(date.substring(4,6))
            Rank['day'] = parseInt(date.substring(6,8))
            dataObj['Artist'] = chart[i].Artist
            dataObj['Song'] = chart[i].Title
            Rank['Rank'] = parseInt(chart[i].Rank)
            dataObj['Rank'] = []
            dataObj['Rank'].push(Rank)
            dataObj['Album'] = chart[i].Album
            dataObj['Company'] = chart[i].CompanyMake
            dataObj['DisCompany'] = chart[i].CompanyDist
            dataArray.push(dataObj)
            
        }
        
        return dataArray
    })
    return digitalChart
}


