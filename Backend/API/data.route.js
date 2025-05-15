import express from 'express'
import dataController from './dataController.js'
import multer from 'multer'
import mcache from 'memory-cache'

var cache = (duration) => {
    return (req, res, next) => {
      let key
      if(req.method === 'POST'){
        key = req.body.artistName
      }else if(req.method === 'GET'){
        key = '__express__' + req.originalUrl || req.url
      }
      
      let cachedBody = mcache.get(key)
      if (cachedBody) {
        
        res.send(cachedBody)
        return
      } else {  
        res.sendResponse = res.send
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body)
        }
        next()
      }
    }
}

const router = express.Router()
const upload = multer()

router.route('/briefData').get(dataController.getBriefData)

router.route('/chart/tweetCount').get(dataController.getTweetCountData)
router.route('/chart/rankChart').get(dataController.getRankChartData)
router.route('/chart/viewChart').get(dataController.getView)

router.route('/groupData').get(dataController.getGroupIndex)
router.route('/comebackData').get(dataController.getComebackData)
router.route('/recent').get(dataController.getRecentData)


router.route('/chart/searchAnalytic/:id').get(cache(3600),dataController.searchAnalytic)
router.route('/chart/searchtwt/:id').get(cache(3600),dataController.searchTweetData)
router.route('/chart/search/:id').get(cache(3600),dataController.searchData)
router.route('/chart/searchCB').post(cache(3600),dataController.searchComebackData)

router.route('/game/suggestion').get(dataController.getQuizAnswerOption)
router.route('/game/quizz').get(dataController.getQuiz)
router.route('/main/Group').get(dataController.getGroupData)
router.route('/main/comeback').get(dataController.getWatchlistArtist)
router.route('/server/watchlist_song').get(dataController.getEditWatchlist)
router.route('/server/updateWatchlist_song').post(upload.none(),dataController.postUpdateWatchlist)
router.route('/server/insertWatchlist').post(upload.none(),dataController.insertWatchlist)

export default router   