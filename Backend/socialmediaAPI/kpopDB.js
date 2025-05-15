import jsdom from "jsdom";
import axios from "axios";
const { JSDOM } = jsdom;
export default async function fetchDatabase() {
    let girlgroupsDatabase = [];
    let boybandsDatabase = [];
    let kpopDatabase = [];
    girlgroupsDatabase = await axios.get('https://dbkpop.com/db/k-pop-girlgroups').then(response => {
        const dom = new JSDOM(response.data);
        dom.window.document.querySelectorAll('div table tbody tr').forEach(nodes => {
            let object = {
                artistFullName_Eng: '',
                artistShortName_Eng: '',
                artistName_KR: '',
                Debut_Date: '',
                companyName: '',
                currentMember: '',
                originalMember: '',
                Fandom_Name: '',
                activeStatus: '',
            };
            let childnode = nodes.childNodes;
            object['artistFullName_Eng'] = childnode[3].textContent;
            object['artistShortName_Eng'] = childnode[5].textContent;
            object['artistName_KR'] = childnode[7].textContent;
            object['Debut_Date'] = childnode[9].textContent;
            object['companyName'] = childnode[11].textContent;
            object['currentMember'] = childnode[13].textContent;
            object['originalMember'] = childnode[15].textContent;
            object['Fandom_Name'] = childnode[17].textContent;
            object['activeStatus'] = childnode[19].textContent;
            girlgroupsDatabase.push(object);
        });
        return girlgroupsDatabase;
    });
    boybandsDatabase = await axios.get('https://dbkpop.com/db/k-pop-boybands').then(response => {
        const dom = new JSDOM(response.data);
        dom.window.document.querySelectorAll('div table tbody tr').forEach(nodes => {
            let object = {
                artistFullName_Eng: '',
                artistShortName_Eng: '',
                artistName_KR: '',
                Debut_Date: '',
                companyName: '',
                currentMember: '',
                originalMember: '',
                Fandom_Name: '',
                activeStatus: '',
            };
            let childnode = nodes.childNodes;
            object['artistFullName_Eng'] = childnode[3].textContent;
            object['artistShortName_Eng'] = childnode[5].textContent;
            object['artistName_KR'] = childnode[7].textContent;
            object['Debut_Date'] = childnode[9].textContent;
            object['companyName'] = childnode[11].textContent;
            object['currentMember'] = childnode[13].textContent;
            object['originalMember'] = childnode[15].textContent;
            object['Fandom_Name'] = childnode[17].textContent;
            object['activeStatus'] = childnode[19].textContent;
            boybandsDatabase.push(object);
        });
        return boybandsDatabase;
    });
    kpopDatabase = [...girlgroupsDatabase, ...boybandsDatabase];
    return kpopDatabase;
}
export async function fetchSoloistDatabase() {
    let femaleSoloist = await axios.get('https://dbkpop.com/db/female-k-pop-idols/').then(response => {
        const dom = new JSDOM(response.data);
        let dataArray = [];
        dom.window.document.querySelectorAll('div table tbody tr').forEach(nodes => {
            let object = {
                stageName: '',
                fullName: '',
                krFullName: '',
                krStageName: '',
                dateOfBirth: '',
                group: '',
                country: '',
                height: '',
                birthplace: '',
                otherGroup: '',
                position: '',
                IG: '',
            };
            let childnode = Array.from(nodes.childNodes).filter(elem => elem.nodeType == 1);
            object['stageName'] = childnode[1].textContent;
            object['fullName'] = childnode[2].textContent;
            object['krFullName'] = childnode[3].textContent;
            object['krStageName'] = childnode[4].textContent;
            object['dateOfBirth'] = childnode[5].textContent;
            object['gender'] = 'F'
            object['group'] = childnode[6].textContent;
            object['country'] = childnode[7].textContent;
            object['height'] = childnode[9].textContent;
            object['birthplace'] = childnode[11].textContent;
            object['otherGroup'] = childnode[12].textContent;
            object['position'] = childnode[14].textContent;
            object['IG'] = childnode[15].textContent;
            dataArray.push(object);
        });
        return dataArray;
    });
    let maleSoloist = await axios.get('https://dbkpop.com/db/male-k-pop-idols/').then(response => {
        const dom = new JSDOM(response.data);
        let dataArray = [];
        dom.window.document.querySelectorAll('div table tbody tr').forEach(nodes => {
            let object = {
                stageName: '',
                fullName: '',
                krFullName: '',
                krStageName: '',
                dateOfBirth: '',
                group: '',
                country: '',
                height: '',
                birthplace: '',
                otherGroup: '',
                position: '',
                IG: '',
            };
            let childnode = Array.from(nodes.childNodes).filter(elem => elem.nodeType == 1);
            object['stageName'] = childnode[1].textContent;
            object['fullName'] = childnode[2].textContent;
            object['krFullName'] = childnode[3].textContent;
            object['krStageName'] = childnode[4].textContent;
            object['dateOfBirth'] = childnode[5].textContent;
            object['group'] = childnode[6].textContent;
            object['country'] = childnode[7].textContent;
            object['gender'] = 'M'
            object['height'] = childnode[9].textContent;
            object['birthplace'] = childnode[11].textContent;
            object['otherGroup'] = childnode[12].textContent;
            object['position'] = childnode[14].textContent;
            object['IG'] = childnode[15].textContent;
            dataArray.push(object);
        });
        return dataArray;
    });
    let fetchArray = [...femaleSoloist, ...maleSoloist];
    return fetchArray;
}

