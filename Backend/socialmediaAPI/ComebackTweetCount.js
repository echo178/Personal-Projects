import dotenv from 'dotenv';
import axios from "axios";
dotenv.config({ path: "Projects/K-meter/Backend/.env" });
export default async function fetchTweetCountSchedule(accessToken, insertedChart) {
    for (let i = 0; i < insertedChart.length; i++) {
        if (i % 30 == 0) {
            console.log('Comeback tweetCount fetching in progress : ' + i + ' / ' + insertedChart.length);
        }
        let query = '';
        query = "\"" + insertedChart[i].Artist + " " + " Comeback\"";
        if (insertedChart[i].Song != ' ') {
            query += " OR \"" + insertedChart[i].Artist + " " + insertedChart[i].Song + "\"";
        }
        if (insertedChart[i].Album != ' ') {
            query += " OR \"" + insertedChart[i].Artist + " " + insertedChart[i].Album + "\"";
        }
        query = "(" + query + ")";
        let tweetCountQuery_ko = query + ' lang:ko';
        let tweetCount_KR = await axios.get('https://api.twitter.com/2/tweets/counts/recent', {
            params: {
                query: tweetCountQuery_ko
            },
            headers: {
                "User-Agent": "v2RecentTweetCountsJS",
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => response.data.data);
        let tweetCount_Global = await axios.get('https://api.twitter.com/2/tweets/counts/recent', {
            params: {
                query: query
            },
            headers: {
                "User-Agent": "v2RecentTweetCountsJS",
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => response.data.data);
        tweetCount_KR = tweetCount_KR.slice(1);
        tweetCount_Global = tweetCount_Global.slice(1);
        //slicing the first element of index as it is not full hour data returned by twitter, it makes stored data inconsistent if overlapped with data stored at database
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let localCurrentTime = new Date();
        let fetchArray_KR = new Set();
        let fetchArray_Global = new Set();
        let fetchObj_KR = {};
        let fetchObj_Global = {};
        if (!insertedChart[i]['tweetCount_KR']) {
            insertedChart[i]['tweetCount_KR'] = [];
            insertedChart[i]['tweetCount_Global'] = [];
        }
        for (let obj of tweetCount_KR) {
            let time = new Date(obj.start);
            if (localCurrentTime.getMonth() == time.getMonth()) {
                let currentDay = time.getDate();
                let currMonthName = month[time.getMonth()];
                let checkDate = currMonthName + ' ' + currentDay;
                if (checkDate != fetchObj_KR.Date) {
                    fetchObj_KR = {};
                }
                fetchObj_KR['Date'] = currMonthName + ' ' + time.getDate();
                if (obj.tweet_count > 0) {
                    fetchObj_KR['Hours ' + time.getHours()] = obj.tweet_count;
                }
                fetchArray_KR.add(fetchObj_KR);
            }
        }
        fetchArray_KR = [...insertedChart[i].tweetCount_KR, ...fetchArray_KR];
        fetchArray_KR = fetchArray_KR.filter((value, index, self) => {
            let indexFind = self.map(obj => obj.Date === value.Date).lastIndexOf(true);
            return index == indexFind;
        });
        for (let obj of tweetCount_Global) {
            let time = new Date(obj.start);
            if (localCurrentTime.getMonth() == time.getMonth()) {
                let currentDay = time.getDate();
                let currMonthName = month[time.getMonth()];
                let checkDate = currMonthName + ' ' + currentDay;
                if (checkDate != fetchObj_Global.Date) {
                    fetchObj_Global = {};
                }
                fetchObj_Global['Date'] = currMonthName + ' ' + time.getDate();
                if (obj.tweet_count > 0) {
                    fetchObj_Global['Hours ' + time.getHours()] = obj.tweet_count;
                }
                fetchArray_Global.add(fetchObj_Global);
            }
        }
        fetchArray_Global = [...insertedChart[i].tweetCount_Global, ...fetchArray_Global];
        fetchArray_Global = fetchArray_Global.filter((value, index, self) => {
            let indexFind = self.map(obj => obj.Date === value.Date).lastIndexOf(true);
            return index == indexFind;
        });
        let totalArray_KR = [];
        for (let i = 0; i < fetchArray_KR.length; i++) {
            let currValue = Object.values(fetchArray_KR[i]).slice(1);
            totalArray_KR = [...totalArray_KR, ...currValue];
        }
        let tweetCountTotal_KR = totalArray_KR.reduce((a, b) => a + b, 0);
        let totalArray_Global = [];
        for (let i = 0; i < fetchArray_Global.length; i++) {
            let currValue = Object.values(fetchArray_Global[i]).slice(1);
            totalArray_Global = [...totalArray_Global, ...currValue];
        }
        let tweetCountTotal_Global = totalArray_Global.reduce((a, b) => a + b, 0);
        let koreaTweetArray = [];
        for (let i = 0; i < fetchArray_KR.length; i++) {
            let sumTweetsObject = {
                Date: '',
                koreaTweetTotal: 0,
                globalTweetTotal: 0
            };
            let koreaTweetTotal = 0;
            for (const [key, value] of Object.entries(fetchArray_KR[i])) {
                if (key === 'Date') {
                    sumTweetsObject['Date'] = value;
                }
                if (key !== 'Date') {
                    koreaTweetTotal += value;
                }
            }
            sumTweetsObject['koreaTweetTotal'] = koreaTweetTotal;
            koreaTweetArray.push(sumTweetsObject);
        }
        let sumTweetsArray = [];
        for (let i = 0; i < fetchArray_Global.length; i++) { 
            let sumTweetsObject = {
                Date: '',
                koreaTweetTotal: 0,
                globalTweetTotal: 0
            };
            let globalTweetTotal = 0;
            for (const [key, value] of Object.entries(fetchArray_Global[i])) {
                if (key === 'Date') {
                    sumTweetsObject['Date'] = value;
                }
                if (key !== 'Date') {
                    globalTweetTotal += value;
                }
            }
            let searchObj = koreaTweetArray.find(obj => obj.Date === sumTweetsObject.Date);
            if (searchObj) {
                sumTweetsObject['koreaTweetTotal'] = searchObj.koreaTweetTotal;
            }
            sumTweetsObject['globalTweetTotal'] = globalTweetTotal;
            sumTweetsArray.push(sumTweetsObject);
        }
        insertedChart[i]['tweetCount_KR'] = fetchArray_KR;
        insertedChart[i]['tweetCount_Global'] = fetchArray_Global;
        insertedChart[i]['sumTweetOfDay'] = sumTweetsArray;
        insertedChart[i]['tweetCountTotal_KR'] = tweetCountTotal_KR;
        insertedChart[i]['tweetCountTotal_Global'] = tweetCountTotal_Global;
    }
    return insertedChart
}
