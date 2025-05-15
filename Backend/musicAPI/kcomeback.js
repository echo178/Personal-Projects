import axio from 'axios'
import jsdom from 'jsdom'

const { JSDOM } = jsdom



const dataFetch = async(url = "https://kpopofficial.com/kpop-comeback-schedule-june-2022" ) => {
    var schedule = new Set()
    let object = {}
    await axio.get(url).then(
    response => {
        const dom = new JSDOM(response.data)
        dom.window.document.querySelectorAll('figure table tbody tr td').forEach((nodes)=> {
        const elemNodes = [...nodes.childNodes]
            .filter(child => (child.nodeName === 'MARK'|| child.hasChildNodes()))
            .map(elem =>{      
                if(elem.nodeName === 'A' && elem.href.includes('youtu.be')){
                    object['Youtube'] = elem.href
                }
                //Date
                if(elem.nodeName === 'MARK' && elem.firstChild.nodeName !== 'STRONG'){
                    object = {}
                    object['Date'] = elem.textContent
                    object['Day'] = new Date(elem.textContent).getDate()
                }
                //Artist
                if((elem.nodeName === 'STRONG' && elem.firstChild.nodeName === 'MARK')||(elem.nodeName === 'MARK' && elem.firstChild.nodeName === 'STRONG')){
                   object['Artist'] = elem.textContent
                   object['Song'] = ' '
                   object['Album'] = ' '
            }            
        })
        const textNodes =[...nodes.childNodes]
            .filter(child => child.nodeType === 3) 
            .filter(child => child.textContent.trim())
            .map(textNode => 
                
                {
                
                if(textNode.textContent.includes("Title Track:")){
                
                    if(textNode.textContent.match('“')){
                    object['Song'] = textNode.textContent.slice(
                        textNode.textContent.indexOf('“') + 1,
                        textNode.textContent.lastIndexOf('”'),
                      )
                    }
                    if(textNode.textContent.match('‘')){
                    object['Song'] = textNode.textContent.slice(
                    textNode.textContent.indexOf('‘') + 1,
                    textNode.textContent.lastIndexOf('’'),
                    )
                    }
                }
                if(textNode.textContent.includes("Album:")){                    
                    object['Album'] = textNode.textContent.split('Album: ')[1]                   
                }
                if(Object.keys(object).length > 0){
                    object['Views'] = []
                    schedule.add(object)
                }
                })            
            })            
            return schedule
        })
        .catch(err => {
            console.log(err.message)
        })
 return schedule = [...schedule]
}

export default async function scheduleFetch(url){
    const result_1 = await dataFetch(url)
    return result_1
}

