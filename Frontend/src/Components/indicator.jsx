import React from "react";
function caretFunc(sign){
    switch(sign){
        case '+':
            return <i className="bi bi-caret-up icon-green"></i>
        case '-':
            return <i className="bi bi-caret-down icon-red" color="color:red"></i>
        default:
            return false
    }
   
}
export default function indicator({data, className}){
    
    let headingRow = data.heading.map((arr,index) => {
        if(arr.includes('[')){
            let splitString = arr.split(/(?=\[)/)
            return <th key={'thead' +index} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>{splitString[0]}<br/>{splitString[1]}</th> 
        }
        return <th key={'thead' +index} style={{textAlign: 'center', whiteSpace: 'nowrap'}}>{arr}</th> 
           
    })
    

    let bodyRow = data.data.map((obj,index) => {
        return <tr  key={'tbody ' + index}>
                <td style={{textAlign: 'left'}}>{obj.title}</td>
                <td style={{textAlign: 'right'}}>{obj.value}{caretFunc(obj.sign)}</td>
            </tr>
       
    })
    
    return (
        <div className={`indicator mt-3 mb-3 ${className}`} >
            <table>
                <thead style={{textAlign: 'center'}}><tr>{headingRow}</tr></thead>
                <tbody>{bodyRow}</tbody>                
            </table>
        </div>
    )
}