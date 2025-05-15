/*
KPOP goodsList?grp_no=1723449
                grp_no_2=1723466
KCONTENT goodsList?grp_no=1723490
                grp_no_2=1723496
                grp_no_3=1742520
KSTYLE goodsList?grp_no=1723524
CHART grp_no=1741898
      goods_no=
term=day&g_grpNo=1723449&actDt=YYYY-MM-DD
term=week&g_grpNo=1723449&actDt=YYYY-MM-DD
term=total&g_grpNo=1723449
term=month&g_grpNo=1723449&actDt= YYYY-MM-01
Ajax Call Top 6item?{
getBarcodeDailySellStat 
      - payload - barcode
      - response - BARCODE: "8809755508227"
                   QTY: 20312
                   SELL_DATE: "2022-05-25"
getArtistBarcodeDailySellStat
      - payload - barcode: 8809755508227
                  aGrpNo: 4978754
      -response - A_GRP_NO: 4978754
                  BARCODE: "192641821011"
                  FIRST_SELL_DT: "2022-05-27"
                  GOODS_NM: "NAYEON - [Im Nayeon] (U.S.A Ver.) (A Ver.) (Counting towards Billboard chart)"
                  QTY: 1
                  SELL_DATE: "2022-05-28"
                  TOTAL_SALES: 12
getNationStatisticData
      - payload - barcode: 8809755507152
      - response - BARCODE: "8809755507152"
                   COUNTRY_ID: "KR"
                   DEF_NATION_NM: "Korea"
                   DISP_X: 517
                   DISP_Y: 110
                   FLAG_SRC: "/images/flag/flag_south_korea.png"
                   NATI_NO: 216
                   SALE_DT: "2022-06-24 00:00:00.0"
                   SHOP_NO: 174
                   TOTAL_QTY: 4477
}
aGrpNo = Group Id?
barcode = ?

*/
/*
{
      Artist : ' ',
      Albums : [  
            {
                  Album : ' ',
                  Release_Date: '',
                  Sales :{
                        Today_Sales: 
                        Total Sales:
                  },
                  totalSales: ,
                  todaySales: 4
            }
      ]
}
*/


import axio from 'axios'
import jsdom from 'jsdom'

const { JSDOM } = jsdom

export default async function fetchKtownChart(url = 'https://www.ktown4u.com/chart100_new',dateObj){
let date = dateObj || await axio.get(url).then(response => {
      const dom = new JSDOM(response.data)
      let dateArray = Array.from(dom.window.document.querySelectorAll('div.dateSelect option'),(nodes) => nodes.textContent)
      return dateArray[0]
  })     
  date = date
let ktownChart = []
await axio.get(url).then(response => {
      
      const dom = new JSDOM(response.data)
      dom.window.document.querySelectorAll('div.chart_center ul.ranking_list li a div.subject').forEach(nodes => {
            let dataObject = new Object
            let Album = {}
             for(let i =0; i< nodes.children.length;i++){
                  if(i == 3){
                        let todaySales = {}
                        let salesObj = {}
                        todaySales['Date'] = date
                        todaySales['Sales'] = parseInt(nodes.children[i].children[1].textContent.replace(',',''))
                        let totalSales = {}
                        totalSales['Date'] = date
                        totalSales['Sales'] = parseInt(nodes.children[i].children[3].textContent.replace(',',''))
                        salesObj['Today_Sales'] = []
                        salesObj['Total_Sales'] = []
                        
                        salesObj['Today_Sales'].push(todaySales)
                        salesObj['Total_Sales'].push(totalSales)
                        Album['Sales'] = salesObj
                        Album['totalSales'] = salesObj.Total_Sales[0].Sales
                  }
                  if(i == 2){
                        Album['Released_Date'] = nodes.children[i].children[1].textContent
                  }
                else{
                        if(nodes.children[i].className == 'name'){
                              dataObject['Artist'] = nodes.children[i].textContent
                              dataObject['Albums'] = []
                              dataObject['Albums'].push(Album)
                        }
                        if(nodes.children[i].className == 'title'){
                              Album['Album'] = nodes.children[i].textContent
                        }

                 }
                 
            }
            ktownChart.push(dataObject)
      })
      return ktownChart
}
)
return ktownChart
}
