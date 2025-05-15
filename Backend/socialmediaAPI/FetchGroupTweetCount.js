import dotenv from 'dotenv';
import axios from "axios";
dotenv.config({ path: "Projects/K-meter/Backend/.env" });
function dayInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}
export default async function tweetCountFetch(accessToken, fetchChart) {
    let array = []
    for (let i = 0; i < fetchChart.length; i++) {
        if (i % 50 == 0) {
            console.log('Group Tweet Count fetching in progress : ' + i + ' / ' + fetchChart.length);
        }
        let query = '';
        if (fetchChart[i].group_EngFullName) {
            query += "\"" + fetchChart[i].group_EngFullName + "\" ";
        }
        if (fetchChart[i].group_EngShortName) {
            query += 'OR \"' + fetchChart[i].group_EngShortName + "\"";
        }
        if (fetchChart[i].group_KRName) {
            query += 'OR \"' + fetchChart[i].group_KRName + "\"";
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
        }).then(response => {
            return response.data.data;
        });
        let tweetCount_Global = await axios.get('https://api.twitter.com/2/tweets/counts/recent', {
            params: {
                query: query
            },
            headers: {
                "User-Agent": "v2RecentTweetCountsJS",
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => {
            return response.data.data;
        });
        let localCurrentTime = new Date();
        let fetchArray_KR = new Set();
        let fetchArray_Global = new Set();
        let fetchObj_KR = {
            Date: 0
        };
        let fetchObj_Global = {
            Date: 0
        };
        let lastMonth_KR = {};
        let lastMonth_Global = {};
        let lastMonth_lastDay_sumTweet = {
            Date: 0,
            globalTweetTotal: 0,
            koreaTweetTotal: 0
        };
        for (let [index, obj] of tweetCount_KR.entries()) {
            let time = new Date(obj.start);
            let lastDayofMonth = dayInMonth(time.getUTCMonth(), time.getUTCFullYear());
            if (localCurrentTime.getUTCDate() === 1 && localCurrentTime.getUTCMonth() !== time.getUTCMonth() && time.getUTCDate() === lastDayofMonth) {
                let currentDay = time.getUTCDate();
                lastMonth_KR['Date'] = currentDay;
                lastMonth_KR['Hours ' + time.getUTCHours()] = obj.tweet_count;
                
            } //creating the last month data at the start of the month
            if (localCurrentTime.getUTCMonth() == time.getUTCMonth()) {
                if (index === 0) {
                    const data = fetchChart[i].tweetCount_KR;
                    if (data instanceof Array) {
                        let oldData = data.find((obj) => obj.Date === time.getUTCDate());
                        if (oldData) {
                            obj.tweet_count = oldData['Hours ' + time.getUTCHours()];
                        }
                    }
                }
                //reassign old Data to the first index of data as it is not an hour complete data, received from Twitter
                //occurance after 7 days of the month
                let currentDay = time.getUTCDate();
                if (currentDay != fetchObj_KR.Date) {
                    fetchObj_KR = {
                        Date: currentDay
                    };
                }
                fetchObj_KR['Hours ' + time.getUTCHours()] = obj.tweet_count;
                fetchArray_KR.add(fetchObj_KR);
            }
        }

        if (fetchChart[i].tweetCount_KR) {
            fetchArray_KR = [...fetchArray_KR]
            if(fetchArray_KR.length > 6){
                fetchArray_KR.shift()
            }
            fetchArray_KR = [...fetchChart[i].tweetCount_KR, ...fetchArray_KR];
            fetchArray_KR = fetchArray_KR.filter((value, index, self) => {
                let indexFind = self.map(obj => obj.Date === value.Date).lastIndexOf(true);
                return index == indexFind;
            }); //removing the old date data from database, to avoid duplicate (only with 24 hours time length )
        }
        else {
            fetchArray_KR = [...fetchArray_KR];
        }
        for (let [index, obj] of tweetCount_Global.entries()) {
            let time = new Date(obj.start);
            let lastDayofMonth = dayInMonth(time.getUTCMonth(), time.getUTCFullYear());
            if (localCurrentTime.getUTCDate() === 1 && localCurrentTime.getUTCMonth() !== time.getUTCMonth() && time.getUTCDate() === lastDayofMonth) {
                let currentDay = time.getUTCDate();
                lastMonth_Global['Date'] = currentDay;              
                lastMonth_Global['Hours ' + time.getUTCHours()] = obj.tweet_count;
                
            } //adding the last month data at the start of the month
            if (localCurrentTime.getUTCMonth() == time.getUTCMonth()) {
                if (index === 0) {
                    const data = fetchChart[i].tweetCount_Global;
                    if (data instanceof Array) {
                        let oldData = data.find((obj) => obj.Date === time.getUTCDate());
                        if (oldData) {
                            obj.tweet_count = oldData['Hours ' + time.getUTCHours()];
                        }
                    }
                    //reassign old Data to the first index of data as it is not an hour complete data, received from Twitter
                    //occurance after 7 days of the month
                }
                let currentDay = time.getUTCDate();
                if (currentDay != fetchObj_Global.Date) {
                    fetchObj_Global = {
                        Date: currentDay
                    };
                }
                fetchObj_Global['Hours ' + time.getUTCHours()] = obj.tweet_count;
                fetchArray_Global.add(fetchObj_Global);
            }
        }
        if (fetchChart[i].tweetCount_Global) {
            fetchArray_Global = [...fetchArray_Global]
            if(fetchArray_Global.length > 6){
                fetchArray_Global.shift()
            }
            
            fetchArray_Global = [...fetchChart[i].tweetCount_Global, ...fetchArray_Global];
            
            fetchArray_Global = fetchArray_Global.filter((value, index, self) => {
                let indexFind = self.map(obj => obj.Date === value.Date).lastIndexOf(true);
                return index == indexFind;
            });
        }
        else {
            fetchArray_Global = [...fetchArray_Global];
        }
        
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
        let sumTweetArray = [];
        for (let j = 0; j < fetchArray_KR.length; j++) {
            //used koreaTweet Array length but it is fine as always same length with globalArray coz even no data at that day, there is object with Date
            let globalSumTweet = 0;
            let koreaSumTweet = 0;
            for (const [key, value] of Object.entries(fetchArray_KR[j])) {
                if (key !== 'Date') {
                    koreaSumTweet += value;
                }
            }  
            for (const [key, value] of Object.entries(fetchArray_Global[j])) {
                if (key !== 'Date') {
                    globalSumTweet += value;
                }
            }
            let sumTweetInDay = {
                Date: fetchArray_KR[j].Date,
                globalTweetTotal: globalSumTweet,
                koreaTweetTotal: koreaSumTweet
            };
            sumTweetArray.push(sumTweetInDay);
        }
        if (Object.keys(lastMonth_KR).length > 0) {
            let sumTweetKR = 0;
            for (const [key, values] of Object.entries(lastMonth_KR)) {
                if (key === 'Date') {
                    lastMonth_lastDay_sumTweet['Date'] = values;
                }
                else {
                    sumTweetKR += values;
                }
            }
            lastMonth_lastDay_sumTweet['koreaTweetTotal'] = sumTweetKR;
        }
        if (Object.keys(lastMonth_Global).length > 0) {
            let sumTweetGlobal = 0;
            for (const [key, values] of Object.entries(lastMonth_Global)) {
                if (key === 'Date') {
                    lastMonth_lastDay_sumTweet['Date'] = values;
                }
                else {
                    sumTweetGlobal += values;
                }
            }
            lastMonth_lastDay_sumTweet['globalTweetTotal'] = sumTweetGlobal;
        }
        let obj = {
            group_EngFullName: fetchChart[i].group_EngFullName,
            group_EngShortName: fetchChart[i].group_EngShortName,
            group_KRName: fetchChart[i].group_KRName,
            group_Fandom: fetchChart[i].group_Fandom,
            tweetCount_KR: fetchArray_KR,
            tweetCount_Global: fetchArray_Global,
            sumTweetOfDay: sumTweetArray,
            tweetCountTotal_KR: tweetCountTotal_KR,
            tweetCountTotal_Global: tweetCountTotal_Global,
            lastMonthData: [lastMonth_KR, lastMonth_Global],
            lastMonth_SumTweetOfDay: lastMonth_lastDay_sumTweet
        };
        array.push(obj);
    }
    return array;
}
