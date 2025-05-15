import axio from 'axios'
export default async function fetchNaverChart(){
console.time('Naver Chart')
var heading = {
    'Rank': null,
    'Artist': null,
    'Album': null,
    'Song': null,
    'Source': 'NaverChart'
}
var naverChart = []
let date = new Date()
naverChart = await axio.get('https://apis.naver.com/vibeWeb/musicapiweb/vibe/v1/chart/track/total?display=300',{headers: {'User-Agent' :'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'}})
.then(response => {
    
    var chartLength = response.data.response.result.chart.items.tracks.length
    for(let i = 0; i < chartLength; i++){
    naverChart[i] = {...heading}
    }
for(let i = 0; i < chartLength; i++){
    naverChart[i]['Rank'] = []
    naverChart[i]['Rank'].push([date.toString(),response.data.response.result.chart.items.tracks[i].rank.currentRank])
    if(response.data.response.result.chart.items.tracks[i].artists.length > 1){
        let array = []
        for(let j = 0; j< response.data.response.result.chart.items.tracks[i].artists.length; j++){
            
            array.push(response.data.response.result.chart.items.tracks[i].artists[j].artistName)
            
            naverChart[i]['Artist'] = [...array]
        }
    }
    else{
        naverChart[i]['Artist'] = response.data.response.result.chart.items.tracks[i].artists[0].artistName
    }
    
    naverChart[i]['Album'] = response.data.response.result.chart.items.tracks[i].album.albumTitle
    naverChart[i]['Song'] = response.data.response.result.chart.items.tracks[i].trackTitle
    naverChart[i]['Img'] = response.data.response.result.chart.items.tracks[i].album.imageUrl

}

return naverChart
}
)
console.timeEnd('Naver Chart')
return naverChart
}

