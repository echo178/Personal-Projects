import axios from "axios";


let hanteoBaseURL = 'https://api.hanteochart.io'
let hanteoURL = 'https://hanteochart.com'
export async function fetchHanteo_AlbumSalesChart(){
    let albumSales = await axios.get(hanteoBaseURL + '/v4/ranking/list/ALBUM/REAL/BASIC?limit=100').then((response) => response.data.resultData.list)
    
    albumSales = albumSales.map((obj) => {

        let salesObj = {}
        salesObj['Date'] = new Date(obj.regDate)
        salesObj['salesVolume'] = obj.detail.salesVolume
        salesObj['hanteo_rank'] = obj.rank
        salesObj['hanteo_recordIdx'] = obj.value

        let albumObj = {}
        albumObj['Album'] = obj.targetName
        albumObj['salesDate'] = new Date(obj.detail.saleDate)
        albumObj['Img'] = hanteoURL +  obj.targetImg
        albumObj['supplyPrice'] = obj.detail.supplyPrice
        albumObj['Sales'] = [salesObj]

        let returnObj = {}
        returnObj['Artist'] = obj.detail.artistGlobalName
        returnObj['Artist_KR'] = obj.detail.artistName
        returnObj['Company'] = obj.detail.entertainment
        
        returnObj['Albums'] = [albumObj]
        returnObj['Source'] = 'HanteoChart'
        return returnObj
    })
    return albumSales
}
export async function fetchHanteo_DigitalChart(){
    let digitalChart = await axios.get(hanteoBaseURL + '/v4/ranking/list/SOUND/REAL/BASIC?limit=100').then((response) => response.data.resultData.list)
    digitalChart = digitalChart.map((obj) => {
        let rankObj = {}
        rankObj['Date'] = new Date(obj.regDate)
        rankObj['bugsRank'] = obj.rank
        rankObj['bugsScore'] = obj.value
        rankObj['melonRank'] = obj.detail.melonRank
        rankObj['melonScore'] = obj.detail.melon
        rankObj['genieRank'] = obj.detail.genieRank
        rankObj['genieScore'] = obj.detail.genieRank
        rankObj['floRank'] = obj.detail.floRank
        rankObj['floScore'] = obj.detail.flo
        rankObj['bugsRank_2'] = obj.detail.bugsRank
        rankObj['bugsScore_2'] = obj.detail.bugs

        let songObj = {}
        songObj['Artist'] = obj.detail.artistGlobalName
        songObj['Artist_KR'] = obj.detail.artistName
        songObj['Song'] = obj.targetName
        songObj['Album'] = obj.detail.collectAlbumName
        songObj['Company'] = obj.detail.entertainment
        songObj['Img'] = hanteoURL + obj.targetImg
        songObj['Rank'] = [rankObj]
        songObj['Source'] = 'HanteoChart'
        return songObj
    })
    return digitalChart
}
