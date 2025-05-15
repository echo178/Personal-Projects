import jsdom from 'jsdom';
import axio from 'axios';

export default async function fetchMelonChart(){
const { JSDOM } = jsdom
var heading = {}
var melonChart = []
var songId = []
var apiUrl = 'https://www.melon.com/commonlike/getSongLike.json?contsIds='

console.time('melonChart')
heading = await axio.get('https://www.melon.com/chart/')
.then(response => {

    const dom = new JSDOM(response.data)
    dom.window.document.querySelectorAll('div.service_list_song table thead tr th  div').forEach(nodes => {
    if(nodes.textContent == '순위'||nodes.textContent =='앨범'|| nodes.textContent =='좋아요'){
        heading[nodes.textContent]= null;
    }})
    heading['Source'] = "MelonChart"
    heading['Img'] = null;
    heading['Song'] = null;
    heading['Artist'] = null;
    heading['songId'] = null;

return heading
})
.catch(err => {
    console.log(err)
})
let date = new Date()
melonChart = await axio.get('https://www.melon.com/chart/',{headers: {'User-Agent' :'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'}})
.then(response => {
        
        const dom = new JSDOM(response.data)
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr td div span.rank').forEach((nodes,index) => {
        
        melonChart[index]= {...heading}
            })
          
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr td div span.rank').forEach((nodes,index) => {
        melonChart[index]['순위']= []
        melonChart[index]['순위'].push([date.toString(),nodes.textContent])
            })
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr td div.wrap_song_info div.rank01 a').forEach((nodes,index) => {
        melonChart[index]['Song'] = nodes.textContent
            })
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr td div.wrap a.image_typeAll img').forEach((nodes,index) => {
        melonChart[index]['Img'] = nodes.getAttribute('src').split('/melon/')[0]
            })    
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr td div.wrap_song_info div.rank02').forEach((nodes,index) => {
                melonChart[index]['Artist'] = nodes.children[1].textContent
            if(nodes.children.length === 3){
                melonChart[index]['Artist'] = nodes.children[2].textContent
            }
            })    
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr td div.wrap_song_info div.rank03 a').forEach((nodes,index) => {
        melonChart[index]['앨범'] = nodes.textContent
            })
        
        dom.window.document.querySelectorAll('div.service_list_song table tbody tr').forEach((nodes,index) => {
        melonChart[index]['songId']=nodes.getAttribute('data-song-no')
        songId.push(nodes.getAttribute('data-song-no'))
         })

return songId, melonChart

})

var  likeUrl= apiUrl + songId.join(',')

melonChart = await axio.get(likeUrl)
.then(response => {
    for(let i = 0; i < response.data.contsLike.length; i++){
        melonChart[melonChart.findIndex(element => element.songId == response.data.contsLike[i].CONTSID)]['좋아요'] = []
        melonChart[melonChart.findIndex(element => element.songId == response.data.contsLike[i].CONTSID)]['좋아요'].push([date.toString(),response.data.contsLike[i].SUMMCNT])
    }
console.timeEnd('melonChart')
    return melonChart
    
})
return melonChart
}

