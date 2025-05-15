import axio from 'axios'


let controller, controller2, analyticController
const url = "https://kulture.ap-southeast-1.elasticbeanstalk.com"
class DataService {
    async getBrief(){
        return axio.get(url +'/api/briefData').then(response => response.data)
    }
    async getGame(){
        return axio.get(url +'/api/game/quizz').then(response => response.data)
    }
    async getRecentData(){
        return axio.get(url + '/api/recent').then(response => response.data)
    }
    async getGameSuggestion(){
        return axio.get(url +'/api/game/suggestion').then(response => response.data)
    }
    async getRankData(){
        return axio.get(url + '/api/chart/rankChart').then(response => response.data)
    }
    async getGroupName(){
        return axio.get(url +'/api/chart/suggestion').then(response => response.data)
    }
    async getTweetData(){
        return axio.get(url + '/api/chart/tweetCount').then(response => response.data)
    }
    async getViewData(){
        return axio.get(url + '/api/chart/viewChart').then(response => response.data)
    }
    async getGroupData(){
        return axio.get(url + '/api/main/Group').then(response => response.data)
    }
    async getWatchlistArtist(){
        return axio.get(url + '/api/main/comeback').then(response => response.data)
    }
    async getGroupIndex(){
        return axio.get(url + '/api/groupData').then(response => response.data)
    }
    async getComebackData(){
        return axio.get(url + '/api/comebackData').then(response => response.data)
    }
    async searchComeback(postObject){
        controller = new AbortController()
        return axio.post(url +'/api/chart/searchCB',postObject,
        {
        signal: controller.signal
        }).then(response => response.data)
        .catch(err => {
            if(axio.isCancel(err)){
                return 0
            }
        })
    }
    async searchFunc(searchKeyWord){
        
        controller = new AbortController();
        return axio.get(url +'/api/chart/search/' + searchKeyWord,
        {
        signal: controller.signal
        }).then(response => response.data)
        .catch(err => {
            if(axio.isCancel(err)){
                return 0
            }
        })
    }
    async searchAnalytic(searchKeyWord){
        analyticController = new AbortController();

        return axio.get(url +'/api/chart/searchAnalytic/' + searchKeyWord,
        {
        signal: analyticController.signal
        }).then(response => response.data)
        .catch(err => {
            if(axio.isCancel(err)){
                return 0
            }
        })
    }
    async searchTwtFunc(searchKeyWord){
        controller2 = new AbortController();

        return axio.get(url +'/api/chart/searchtwt/' + searchKeyWord,
        {
        signal: controller2.signal
        }).then(response => response.data)
        .catch(err => {
            if(axio.isCancel(err)){
                return 0
            }
        })
    }
    abortSearch(){
        if(controller){
            controller.abort()
            controller2.abort()
        }
    }
}   


export default new DataService();