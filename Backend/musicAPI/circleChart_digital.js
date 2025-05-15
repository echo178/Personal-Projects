import axio from "axios"


export async function fetchCircleChart_digital(weekNo,year){

weekNo = weekNo || await axio.post('https://circlechart.kr/data/api/chart_func/global/datelist',null,{
        params:{
            termGbn: 'week'
        }
    }).then(response => response.data.List[0].WeekNum)
let digitalChart = await axio.post('https://circlechart.kr/data/api/chart/onoff', null, {
    params: {
        nationGbn: 'T',
        serviceGbn: 'ALL',
        termGbn: 'week',
        hitYear: year,
        targetTime: weekNo,
        yearTime: 3,
        curUrl : 'circlechart.kr/page_chart/onoff.circle?serviceGbn=ALL&termGbn=week'
    }
}).then(response => {
    let array = []
    for(let i=0; i< Object.keys(response.data.List).length; i++){
        let object = {}
        let rankObj = {}
        object['Artist'] = response.data.List[i].ARTIST_NAME
        rankObj['Album'] = response.data.List[i].ALBUM_NAME
        rankObj['Song'] = response.data.List[i].SONG_NAME
        rankObj['digitalRank'] = response.data.List[i].SERVICE_RANKING
        rankObj['digitalScore'] = response.data.List[i].ROW_CNT
        rankObj['week'] = parseInt(weekNo)
        object['digital'] = []
        object['digital'].push(rankObj)
        
        array.push(object)
    }
  return array
})

return digitalChart
}
export async function fetchCircleChart_Stream(weekNo,year){

    weekNo = weekNo || await axio.post('https://circlechart.kr/data/api/chart_func/global/datelist',null,{
        params:{
            termGbn: 'week'
        }
    }).then(response => response.data.List[0].WeekNum)
    
    let streamChart = await axio.post('https://circlechart.kr/data/api/chart/onoff', null, {
        params: {
            nationGbn: 'T',
            serviceGbn: 'S1040',
            termGbn: 'week',
            hitYear: year,
            targetTime: weekNo,
            yearTime: 3,
            curUrl : 'circlechart.kr/page_chart/onoff.circle?serviceGbn=S1040&termGbn=week'
        }
    }).then(response => {
        let array = []
        for(let i=0; i< Object.keys(response.data.List).length; i++){
            let object = {}
            let rankObj = {}
            object['Artist'] = response.data.List[i].ARTIST_NAME
            rankObj['Album'] = response.data.List[i].ALBUM_NAME
            rankObj['Song'] = response.data.List[i].SONG_NAME
            rankObj['streamRank'] = response.data.List[i].SERVICE_RANKING
            rankObj['week'] = parseInt(weekNo)
            object['stream'] = []
            object['stream'].push(rankObj)
            
            array.push(object)
        }
      return array
    })
    return streamChart
}

let data = await fetchCircleChart_digital()
