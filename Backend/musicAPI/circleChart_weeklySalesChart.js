import axio from 'axios';
export async function fetchCircleChart_dis(weekNo,year){

let defaultDateObj = await axio.post('https://circlechart.kr/data/api/chart_func/retail/datelist',null,{
    params:{
        termGbn: 'week'
    }
}).then(response => response.data.List[0])

if(weekNo){
    weekNo = String(weekNo).padStart(2,'0')
}else{
    weekNo = defaultDateObj.WeekNum.padStart(2,'0')
}

year = year || defaultDateObj.WeekStart.substring(0,4)

let distributionChart = await axio.post('https://circlechart.kr/data/api/chart/album', null, {
    params: {
        nationGbn: 'T',
        serviceGbn: 'ALL',
        termGbn: 'week',
        hitYear: year,
        targetTime: weekNo,
        yearTime: 3,
        curUrl : 'circlechart.kr/page_chart/album.circle?'
    }
}).then(response => {
    let array = []
    
    for(let i=0; i< Object.keys(response.data.List).length; i++){
        let object = {}
        object['Artist'] = response.data.List[i].ARTIST_NAME
        let salesObj = {}
        let Album = {}
        salesObj['week'] = parseInt(weekNo)
        salesObj['distributionRank'] = parseInt(response.data.List[i].SERVICE_RANKING)
        salesObj['distributionVol'] = parseInt(response.data.List[i].Album_CNT)
        salesObj['Company'] = response.data.List[i].de_nm
        Album['distribution'] =[]
        Album['Album']  =response.data.List[i].ALBUM_NAME

        Album['distribution'].push(salesObj)
        object['Albums'] = []
        object['Albums'].push(Album)
        array.push(object)
    }
    
    return array
}
)
return distributionChart
}
export async function fetchCircleChart_offline(weekStart,weekNo){
    let defaultObj = await axio.post('https://circlechart.kr/data/api/chart_func/retail/datelist',null,{
    params:{
        termGbn: 'week'
    }
}).then(response => response.data.List[0])
    weekStart = weekStart || defaultObj.WeekStart
    if(weekNo){
        weekNo = String(weekNo).padStart(2,'0')
    }else{
        weekNo = String(defaultObj.WeekNum).padStart(2,'0')
    }
    let offlineSalesChart = await axio.post('https://circlechart.kr/data/api/chart/retail_list', null, {
        params: {
            termGbn: 'week',
            yyyymmdd : weekStart
        },
    }).then(response => {
        
        let array = []
        for(let i=0; i< Object.keys(response.data.List).length; i++){
            let object = {}
            object['Artist'] = response.data.List[i].Artist
            let salesObj = {}
            let Album = {}

            salesObj['week'] = parseInt(weekNo)
            salesObj['foreignSales'] = parseInt(response.data.List[i].ESum)
            salesObj['koreaSales'] = parseInt(response.data.List[i].KSum)
            salesObj['totalOfflineSales'] = parseInt(response.data.List[i].rowSum)
            salesObj['offlineSalesRank'] = parseInt(response.data.List[i].RankOrder)
            
            Album['Album']  = response.data.List[i].Album
            Album['offlineSales'] = []
            Album['offlineSales'].push(salesObj)
            object['Albums'] = []
            object['Albums'].push(Album)
            array.push(object)
        }
        return array
    }
    )
    return offlineSalesChart
}
