import dataServer from './dataServer.js'
import DataCache from './cache.js'

let groupSuggestionCache = new DataCache(dataServer.groupIndex)
  
export default class dataController{
    static async getBriefData(req,res,next){
        let data = await dataServer.briefData()
        res.json(data)
    }
    static async getTweetCountData(req,res,next){
        let data = await dataServer.TweetCountData()
        res.json(data)
    }
    static async getRankChartData(req,res,next){
        let data = await dataServer.ChartData()
        res.json(data)
    }
    static async getSalesData(req,res,next){
        let data = await dataServer.salesData()
        res.json(data)
    }
    static async searchTweetData(req,res,next){
        try{
            let id = req.params.id
            let data = await dataServer.searchTweetCount(id)
            res.json(data)
        }
        catch(e){
            console.log(e)
        }
    }
    static async searchAnalytic(req,res,next){
        try{
            let id = req.params.id
            let data = await dataServer.searchAnalytic(id)
            res.json(data)
        }
        catch(e){
            console.log(e)
        }
    }
    static async searchData(req,res,next){
        try{
            let id = req.params.id
            let data = await dataServer.dataSearch(id)
            res.json(data)
        }
        catch(e){
            console.log(e)
        }
    }
    static async searchComebackData(req,res,next){
        
        let collectionName = 'watchlist_' + req.body.month + req.body.year
        let searchTerm = req.body.artistName
        
        let data = await dataServer.dataSearch_Watchlist(searchTerm,collectionName)
        res.json(data)
    }
    static async getQuizAnswerOption(req,res,next){
        let data = await dataServer.optionGenerate()
        res.json(data)
    }
    static async getQuiz(req,res,next){
        let data = await dataServer.getQuiz()
        res.json(data[0])
    }
    static async getView(req,res,next){
        let data = await dataServer.ViewData()
        res.json(data)
    }
    static async getGroupData(req,res,next){
        let data = await dataServer.getGroupData()
        res.json(data)
    }
    static async getComebackData(req,res,next){
        let data = await dataServer.getComebackData()
        res.json(data)
    }
    static async getGroupIndex(req,res,next){
        let data = await groupSuggestionCache.getData()
        res.json(data)
    }
    static async getWatchlistArtist(req,res,next){
        let data = await dataServer.getWatchlistArtist()
        res.json(data)
    }
    static async getEditWatchlist(req,res,next){
        let data = await dataServer.getWatchlist_without_Song()
        res.json(data)
    }
    static async postUpdateWatchlist(req,res,next){
        let status = await dataServer.postWatchlist_update_song(req.body)
        if(status){
            res.json({Status : 'Data is updated'})
        }else{
            res.json({Status : 'Failed'})
        }
    }
    static async insertWatchlist(req,res,next){
        let status = await dataServer.insert_new_song(req.body)
        if(status){
            res.json({Status : 'Data is updated'})
        }else{
            res.json({Status : 'Failed'})
        }
    }
    static async getRecentData(req,res,next){
        let dateRange = parseInt(req.query.dateRange)
        
        if(Number.isNaN(dateRange) || dateRange >= 10){
            dateRange = 3
        }
        
        let data = await dataServer.recent_data(dateRange)
        res.json(data)
    }
    
}