import axio from 'axios'

export default async function fetchGaonCircle_hourly(dateNum,HourRange,listtype){
    let params,url
    
    (HourRange && listtype) ?   
    (params ={params:{yyyymmdd: dateNum,HourRange: HourRange, ListType: listtype,thisHour: '' }},url = 'https://circlechart.kr/data/api/chart/retail_hour'): 
    (params = {params:{ termGbn: 'day', yyyymmdd: dateNum}},url = 'https://circlechart.kr/data/api/chart/retail_list')
    
    let offllineSales = axio.post(url,null, params).then(response => { 
        let chart = Object.values(response.data.List)
        let dataArray = []
        for(let i = 0 ; i < chart.length;i++){
            let dataObj = {}
            dataObj['Artist'] = chart[i].Artist
            dataObj['Albums'] = []
            let albumObj = {}
            albumObj['Album'] = chart[i].Album
            let foreignSalesKey = Object.keys(chart[i]).filter((key) => key.includes('E_')).sort((a,b) => a.split('_')[1] - b.split('_')[1])
            let foreignSales = {}
            foreignSales['Date'] = chart[i].YYYYMMDD
            foreignSales['Day'] = parseInt(chart[i].YYYYMMDD.substring(4,6))
            foreignSales['Month'] = parseInt(chart[i].YYYYMMDD.substring(6))
            for(let hours of foreignSalesKey){
                foreignSales['hour_'+hours.split('_')[1]] = parseInt(chart[i][hours])
            }

            let koreaSalesKey = Object.keys(chart[i]).filter((key) => key.includes('K_')).sort((a,b) => a.split('_')[1] - b.split('_')[1])
            let koreaSales = {}
            koreaSales['Date'] = chart[i].YYYYMMDD
            koreaSales['Month'] = parseInt(chart[i].YYYYMMDD.substring(4,6))
            koreaSales['Day'] = parseInt(chart[i].YYYYMMDD.substring(6))
            for(let hours of koreaSalesKey){
                
                koreaSales['hour_'+hours.split('_')[1]] = parseInt(chart[i][hours])
            }
            foreignSales['sumForeignSales'] = Object.values(foreignSales).slice(3).reduce((a,b) => a+b,0)
            koreaSales['sumKoreaSales'] = Object.values(koreaSales).slice(3).reduce((a,b) => a+b,0)
            
            albumObj['foreignSales'] = []
            albumObj['foreignSales'].push(foreignSales)
            
            albumObj['koreaSales'] = []
            albumObj['koreaSales'].push(koreaSales)
            dataObj.Albums.push(albumObj)
            dataArray.push(dataObj)
            
        }
        return dataArray
    })
   return offllineSales
}

