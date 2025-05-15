import jsdom from 'jsdom';
import axio from 'axios';

const { JSDOM } = jsdom

export default async function fetchBugsChart(){
    const url = 'https://music.bugs.co.kr/chart'
    console.time('Bugs Chart')
    const currentHTMLDOM = await axio.get(url).then(response => new JSDOM(response.data))
    const currentChartTime_node = currentHTMLDOM.window.document.querySelector('fieldset.filterChart time')
    const currentChartTime_childnodes= currentChartTime_node.childNodes
    let currentChartTime_KST
    for(let [index,timeChildNode] of Object.entries(currentChartTime_childnodes)){
        if(index == 0){
            currentChartTime_KST =timeChildNode.textContent.trim()
        }
        if(index == 1){
            currentChartTime_KST += ' '+ timeChildNode.textContent.trim()
        }
        
    }

    const currentChartTime_Array = currentChartTime_KST.replace(' ','.').split(/[.:]/)
    const koreaTimeZoneOffset = 9 
    const currentChartTime_dateObj = new Date(Date.UTC(currentChartTime_Array[0],
        currentChartTime_Array[1]-1
        ,currentChartTime_Array[2],
        currentChartTime_Array[3]-koreaTimeZoneOffset,
        currentChartTime_Array[4]))
    
    let dataTableNodeList = currentHTMLDOM.window.document.querySelectorAll('table.list tbody tr')
    let fetchDataArray = []
    
    for(let i =0; i < dataTableNodeList.length ; i++){
        let current_tableRow = dataTableNodeList[i].childNodes
        let doc = {}
        for(let tableRow of current_tableRow){
            
            if(tableRow.nodeName === 'TH' || tableRow.nodeName === 'TD'){
                if(tableRow.hasChildNodes){
                    
                    let current_tableCell = tableRow.childNodes
                    
                    for(let tableCell of current_tableCell){
                        
                        if(tableCell.nodeType === 1){
                            let currentClassName =tableCell.getAttribute('class')
                            let currentInputText =tableCell.textContent.trim()
                           
                            switch(currentClassName){
                                case 'ranking': 
                                    doc['Rank'] = [{
                                        Date : currentChartTime_dateObj,
                                        Rank : parseInt(currentInputText)
                                    }]
                                    break;
                                case 'thumbnail':
                                    doc['Img'] = tableCell.querySelector('img').getAttribute('src')
                                    break;
                                case 'title': 
                                    doc['Song'] = currentInputText
                                    break;
                                case 'artist':
                                    doc['Artist'] = currentInputText
                                    break;
                                case 'album':
                                    doc['Album'] = currentInputText
                                    break;
                            }
                        }
                    }
                    
                }

            }
           
        }
        doc['Source'] = 'BugsChart'
        fetchDataArray.push(doc)
    }
    console.timeEnd('Bugs Chart')
    return fetchDataArray
}   

