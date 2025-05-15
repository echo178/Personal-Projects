import React from "react";
import moment from 'moment'

function caretFunc(no1,no2){

    let rankCompare = parseInt(no1) - parseInt(no2)
    let rankDistance = parseInt(no1) - parseInt(no2)

    if(rankCompare === 0){
        return <></>
    }
    else if(rankCompare < 0){
        if(Math.abs(rankDistance) >= 50){
            return <> 
                <i className="bi bi-caret-down icon-red" color="color:red" />
                <i className="bi bi-caret-down icon-red" color="color:red" />
            </>
        }
        else if(Math.abs(rankDistance) >= 100){
            return <> 
            <i className="bi bi-caret-down icon-red" color="color:red" />
            <i className="bi bi-caret-down icon-red" color="color:red" />
            <i className="bi bi-caret-down icon-red" color="color:red" />
            </>
        }
        else{
            return <i className="bi bi-caret-down icon-red" color="color:red" />
        }
        
    }else{
        if(Math.abs(rankDistance) >= 50){
            return <>  
                <i className="bi bi-caret-up icon-green"/>
                <i className="bi bi-caret-up icon-green"/>
            </>
        }else if(Math.abs(rankDistance) >= 100){
            return <> 
                <i className="bi bi-caret-up icon-green"/>
                <i className="bi bi-caret-up icon-green"/>
                <i className="bi bi-caret-up icon-green"/>
            </> 
        }else{
            return <i className="bi bi-caret-up icon-green"/>
        }
    }
}
export default function RankTable(data){
    
    let sortData 
    if(data[0].Rank && data[0].Rank[0].year){
        sortData = data.sort((a,b) => new Date(b.Rank[0].year,b.Rank[0].month - 1,b.Rank[0].day) - new Date(a.Rank[0].year,a.Rank[0].month - 1,a.Rank[0].day) )
    }else if(data[0].순위){
        sortData = data.sort((a,b) => new Date(b.순위[0][0]) - new Date(a.순위[0][0]) )
    }else{
        sortData = data.sort((a,b) => new Date(b.Rank[0][0]) - new Date(a.Rank[0][0]) )
    }
    
    let dataRow = sortData.map((obj,index) =>{
        let dateString, exRank, currRank
        if(obj.Rank && obj.Rank[0].year){
            dateString = moment(new Date(obj.Rank[0].year,obj.Rank[0].month - 1,obj.Rank[0].day)).format("Do MMM")
            exRank = obj.Rank[0].Rank
            currRank = obj.Rank.at(-1).Rank
        }else if(obj.순위){
            dateString = moment(new Date(obj.순위[0][0])).format("Do MMM")
            exRank = obj.순위[0][1]
            currRank = obj.순위.at(-1)[1]
        }
        else{
            dateString = moment(new Date(obj.Rank[0][0])).format("Do MMM")
            exRank = obj.Rank[0][1]
            currRank = obj.Rank.at(-1)[1]
        }
        return <tr key={obj.Artist +'_'+ index} style={{textAlign: 'center'}}>
           
            <td > 
                <pre >{obj.Artist}</pre>
            </td>
            <td> 
                <pre>{obj.Song}</pre>
            </td>
            <td>
                {dateString}
            </td>
            <td> 
                {exRank}
            </td>
            <td>
                {currRank} {caretFunc(exRank,currRank)}
            </td>
            </tr>
    })

    return (
        <table style={{width:'100%',marginLeft: 'auto', marginRight: 'auto',borderSpacing: '15px'}}>
            <thead style={{textAlign: 'center'}}>
                <tr >
                     
                    <th key={'rank_thead_1'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Artist</th>               
                    <th key={'rank_thead_2'} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Song</th>
                    <th key={'rank_thead_0' } style={{textAlign: 'center', whiteSpace: 'nowrap'}}>Start Entered Date</th>
                    <th key={'rank_thead_3' } style={{textAlign: 'center', whiteSpace: 'nowrap'}}>entered Rank</th>  
                    <th key={'rank_thead_4' } style={{textAlign: 'center', whiteSpace: 'nowrap'}}>current Rank</th>  
                </tr>
            </thead>
            <tbody>
                {dataRow}
            </tbody>        
        </table>
    )
}