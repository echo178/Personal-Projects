import React from "react";
import moment from 'moment'
export default function WeeklySalesTable(data,chartType){
    
    let sortData = data.sort((a,b) => {

        if(chartType === 'cirleChart'){
            let A_totalSales = a.Albums.reduce((acc,curr) => acc + curr.totalDistribution,0)
            let B_totalSales = b.Albums.reduce((acc,curr) => acc + curr.totalDistribution,0)
            return B_totalSales -A_totalSales
        }
        else if(chartType === 'Ktown'){
            let A_dateStringArray= a.Albums.reduce((acc,curr) => {
                let currentDateString = curr.Sales.Today_Sales.at(-1).Date.split('-')
                
                return parseInt(currentDateString[0]) > acc[0] || parseInt(currentDateString[1]) > acc[1]  ||  parseInt(currentDateString[2]) > acc[2] ?  currentDateString : acc
            },[0,0,0])

            let A_albumDateObj = new Date(A_dateStringArray[0],A_dateStringArray[1]+1,A_dateStringArray[2])
            let B_dateStringArray= b.Albums.reduce((acc,curr) => {
                let currentDateString = curr.Sales.Today_Sales.at(-1).Date.split('-')
                return parseInt(currentDateString[0]) > acc[0] || parseInt(currentDateString[1]) > acc[1]  ||  parseInt(currentDateString[2]) > acc[2] ?  currentDateString : acc
            },[0,0,0])
            
            
            let B_albumDateObj = new Date(B_dateStringArray[0],B_dateStringArray[1]+1,B_dateStringArray[2])
            
            return B_albumDateObj.getTime() - A_albumDateObj.getTime()
        }
        
    })
    
   
    
    let dataRow = sortData.map((obj,index) =>{
        let numberData_compo
        if(chartType === 'circleChart'){
            numberData_compo = <>
            <td style={{textAlign: 'right',}}> 
                <pre>{obj.Albums.map((obj2) => {
                    if(obj.Albums.length > 1 ){
                        return <span key={obj.Artist + obj.Album +  obj2.totalDistribution }>{obj2.totalDistribution.toLocaleString()}<br/></span>
                    }else{
                        return <span key={obj.Artist + obj.Album +  obj2.totalDistribution }>{obj2.totalDistribution.toLocaleString()}</span>
                    }

                    })}
                </pre>
            </td>
            <td style={{textAlign: 'right',}}> 
                <pre>{obj.Albums.map((obj2) => {
                    if(obj.Albums.length > 1 ){
                        return <span key={obj.Artist + obj2.totalOfflineSales }>{obj2.totalOfflineSales.toLocaleString()}<br/></span>
                    }else{
                        return <span key={obj.Artist + obj2.totalOfflineSales }>{obj2.totalOfflineSales.toLocaleString()}</span>
                    }

                    })}
                </pre>
            </td>
            </>
        }
        else if(chartType === 'Ktown'){
            numberData_compo = <>
            <td style={{textAlign: 'right',}}> 
                <pre>{obj.Albums.map((obj2) => {
                    
                    if(obj.Albums.length > 1 ){
                        return <span key={obj.Artist + obj2.Album + obj2.Sales.Today_Sales.at(-1).Sales }>{obj2.Sales.Today_Sales.at(-1).Sales.toLocaleString()}<br/></span>
                    }else{
                        return <span key={obj.Artist + obj2.Album + obj2.Sales.Today_Sales.at(-1).Sales }>{obj2.Sales.Today_Sales.at(-1).Sales.toLocaleString()}</span>
                    }

                    })}
                </pre>
            </td>
            <td style={{textAlign: 'right',}}> 
                <pre>{obj.Albums.map((obj2) => {
                    let dateStringArray= obj2.Sales.Today_Sales.at(-1).Date.split('-')
                    let albumDateObj = new Date(dateStringArray[0],dateStringArray[1]+1,dateStringArray[2])
                    if(obj.Albums.length > 1 ){
                        return <span key={obj.Artist + obj2.Album + obj2.Sales.Today_Sales.at(-1).Date}>{moment(albumDateObj).format("Do MMM")}<br/></span>
                    }else{
                        return <span key={obj.Artist + obj2.Album + obj2.Sales.Today_Sales.at(-1).Date}>{moment(albumDateObj).format("Do MMM")}</span>
                    }

                    })}
                </pre>
            </td>
            <td style={{textAlign: 'right',}}> 
                <pre>{obj.Albums.map((obj2) => {
                    if(obj.Albums.length > 1 ){
                        return <span key={obj.Artist + obj2.Album  + obj2.totalSales }>{obj2.totalSales.toLocaleString()}<br/></span>
                    }else{
                        return <span key={obj.Artist + obj2.Album + obj2.totalSales }>{obj2.totalSales.toLocaleString()}</span>
                    }

                    })}
                </pre>
            </td>
            </>
        }
        
        return <tr key={obj.Artist +'_'+ index} style={{verticalAlign: 'middle'}}>
            <td> {obj.Artist}</td>
            <td > 
                <pre >{obj.Albums.map((obj2,index2) => {
                    let albumName = obj2.Album.replace(/\u00A0/g, " ").replace(obj.Artist.toUpperCase() + ' - ','')
                     
                    if(obj.Albums.length > 1){
                        
                        return <span key={obj2.Album +index2 }> {albumName.replace(obj.Artist + ' - ', '')}<br/></span>  
                    }else{
                        return <span key={obj2.Album +index2 }> {albumName.replace(obj.Artist + ' - ', '')}</span>  
                    }
                    
                    })} 
                </pre></td>
            {numberData_compo}
        </tr>
    })
    let headerRow 

    if(chartType === 'circleChart'){
        headerRow =  <>
        <th key={'thead_3'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Distribution Volume</th>
        <th key={'thead_4'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Retail Stores Sales</th>
        </> 
    }else if(chartType === 'Ktown'){
        headerRow = <>
        <th key={'thead_3'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Latest Sales Volume</th>
        <th key={'thead_4'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Latest Sales Date</th>
        <th key={'thead_5'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Total Sales Volume</th>
        </>
    }
    return (
        <table style={{  width:'100%',marginLeft: 'auto', marginRight: 'auto',borderSpacing: '15px'}}>
            <thead style={{textAlign: 'center'}}>
                <tr >
                    <th key={'thead_1' } style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Artist</th>
                    <th key={'thead_2'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Album</th>
                    {headerRow}
                </tr>
            </thead>
            <tbody>
                {dataRow}
            </tbody>        
        </table>
    )

}