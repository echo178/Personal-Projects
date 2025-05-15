import jsdom from 'jsdom';
import axio from 'axios';

export default async function fetchGaonChart(){

const { JSDOM } = jsdom
console.time('Gaon Chart')
var heading = {}
var gaonChart = []


heading = await axio.get('https://circlechart.kr/page_chart/onoff.circle?serviceGbn=ALL',{headers: {'User-Agent' :'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'}})
.then(response => {
    const dom = new JSDOM(response.data)
    dom.window.document.querySelectorAll('div.chart table tr th').forEach(nodes => {
    let text = nodes.textContent.replace(/\s+/g,'')
    if(text!="Share"||text!="Play"){
        if(/\//.test(text))
        {
            let artistTitle = text.split('/')
            heading[artistTitle[0]] = null;
            heading[artistTitle[1]] = null;
        }
        else
        heading[text] = null;
    }

    heading["Song"] = null
    return heading
})
})
.catch(err => {
    console.log(err)
})

gaonChart = await axio.get('https://circlechart.kr/data/api/chart/onoff')
.then(response => {
    
    let date = new Date()
    const dom = new JSDOM(response.data)
    dom.window.document.querySelectorAll('div.chart table tr td.ranking').forEach((nodes,index) => {
        gaonChart[index] = {...heading}
        
    })
    
        
    dom.window.document.querySelectorAll('div.chart table tr td.ranking').forEach((nodes,index) => {
        let text = nodes.textContent.replace(/\s+/g,'')
        gaonChart[index]["Ranking"] = []
        gaonChart[index]["Ranking"].push([date.toString(),text])
    })
    dom.window.document.querySelectorAll('div.chart table tr td.subject p.singer').forEach((nodes,index) => {
        let text = nodes.textContent.replace(/\s+/g,'').split('|')
        gaonChart[index]["Title"] = text[1]
        gaonChart[index]["Artist"] = text[0]
    })

    dom.window.document.querySelectorAll('div.chart table tr td.subject p[title]:not(.singer)').forEach((nodes,index) => {
        let text = nodes.textContent.replace(/\s+/g,'')
        gaonChart[index]["Song"] = text
    })
    dom.window.document.querySelectorAll('div.chart table tr td.count').forEach((nodes,index) => {
        let text = nodes.textContent.replace(/\s+/g,'')
        gaonChart[index]["가온지수"] = []
        gaonChart[index]["가온지수"].push([date.toString(),text])
    })
    dom.window.document.querySelectorAll('div.chart table tr td.production p.pro').forEach((nodes,index) => {
        let text = nodes.textContent.replace(/\s+/g,'')
        gaonChart[index]["Production"] = text
        gaonChart[index]['Source'] = 'GaonChart'
    })
    
    return gaonChart
})
.catch(err => {
    console.log(err)
})
console.timeEnd('Gaon Chart')
return gaonChart
}

//https://gaonchart.api.mycelebs.com/admin/sum_list?weeks=


//https://circlechart.kr/data/api/chart/onoff
/*
nationGbn: T
serviceGbn: ALL
termGbn: week
hitYear: 2022
targetTime: 27**
yearTime: 3
curUrl: circlechart.kr/page_chart/onoff.circle?serviceGbn=ALL
*/
/*
ALBUMIMG: "/uploadDir/albumImg/thumb/20220412_7B11AA954755878F96EB78521C973F28.jpg"
ALBUM_NAME: "LOVE DIVE"
ARTIST_NAME: "IVE (아이브)"
Certify_Grade: ""
CntYN: "Y"
DE_COMPANY_NAME: "Kakao Entertainment"
HIT_CNT: ""
HIT_RATIO: ""
MAKE_COMPANY_NAME: "스타쉽엔터테인먼트"
PRE_SERVICE_RANKING: "1"
ROW_CNT: "23578118"
RankChange: "0"
RankStatus: "same"
SEQ_MOM: "2352090"
SERVICE_RANKING: "1"
SONG_NAME: "LOVE DIVE"
*/
//https://circlechart.kr/data/api/chart/retail_list
/*
termGbn: week
yyyymmdd: 20220626
*/
/*
Album: "from our Memento Box"
Artist: "프로미스나인 (fromis_9)"
Barcode: "8809848756641"
De_company_name: "YG PLUS"
ESum: "34269"
E_Fri: "11"
E_Mon: "33498"
E_Sat: "0"
E_Sun: "0"
E_Thu: "8"
E_Tue: "144"
E_Wed: "608" // E - Foreign
KSum: "46823"
K_Fri: "592"
K_Mon: "30154"
K_Sat: "439"
K_Sun: "0"
K_Thu: "700"
K_Tue: "4992"
K_Wed: "9946" //K - Domestic Korea
RankContinue: "1"
RankHigh: "1"
RankInt: "1"
RankOrder: "1"
RankStatus: "new"
YYYYMMDD: "20220626"
rowSum: "81092"
save_name: "aoaAlbumImg\\thumb\\20220613_D7355799A24DD17698B34627B71DFC2B.jpg"
sys_date: "2022-07-05 22:19:04.393 +0000 UTC"
*/

//https://circlechart.kr/data/api/chart/retail_hour
/*
yyyymmdd: 20220708
HourRange: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21
ListType: 운영시간
thisHour: 
*/
/*
Album: "Girls - The 2nd Mini Album"
Artist: "aespa"
CalIcon: "-"
CalPer: "0"
CalRank: "0"
De_company_name: "Dreamus"
ESum: "207621"
E_0: "0"
E_1: "0"
E_2: "0"
E_3: "0"
E_4: "0"
E_5: "0"
E_6: "0"
E_7: "0"
E_8: "0"
E_9: "0"
E_10: "0"
E_11: "0"
E_12: "0"
E_13: "0"
E_14: "3000"
E_15: "0"
E_16: "88"
E_17: "0"
E_18: "0"
E_19: "0"
E_20: "204533"
E_21: "0"
KSum: "396945"
K_0: "0"
K_1: "0"
K_2: "0"
K_3: "0"
K_4: "0"
K_5: "0"
K_6: "0"
K_7: "0"
K_8: "0"
K_9: "0"
K_10: "0"
K_11: "0"
K_12: "0"
K_13: "22463"
K_14: "3404"
K_15: "7853"
K_16: "3119"
K_17: "6758"
K_18: "351268"
K_19: "2080"
K_20: "0"
K_21: "0"
RankInt: "1"
RankStatus: "HOT"
YYYYMMDD: "20220708"
rowSum: "604566"
save_name: "aoaAlbumImg\\thumb\\20220627_076D21D41CD0A3BAA0AF75E8F08D3D85.jpg"
*/


//https://circlechart.kr/data/api/chart/album
/*
nationGbn: T
termGbn: week
hitYear: 2022
targetTime: 27**
yearTime: 3
curUrl: circlechart.kr/page_chart/album.circle?
*/

/*
ALBUM_NAME: "Proof"
ARTIST_NAME: "방탄소년단"
Album_CNT: ""
Album_Hit_ratio: ""
Certify_Grade: "N"
CntYN: "N"
FILE_NAME: "/uploadDir/aoaAlbumImg/thumb/20220613_E8EAFA8BBBF52384AF23C169BFBD4915.jpg"
PRE_SERVICE_RANKING: ""
RankChange: "0"
RankStatus: "new"
SERVICE_RANKING: "1"
TotHitRatio: ""
Total_CNT: ""
de_nm: "YG PLUS"
seq_aoa: "68764"
*/