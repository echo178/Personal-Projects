import dotenv from 'dotenv'
import crypto from 'crypto'
import axios from 'axios'

dotenv.config({path:"Projects/K-meter/Backend/.env"})

class TwitterClient{
    oauth_consumer_key= process.env.twitter_APIkey
    oauth_token = process.env.twitter_token_oauth1
    oauth_nonce= Math.random().toString(36).slice(2);
    oauth_signature_method = "HMAC-SHA1"
    oauth_timestamp= Math.floor(Date.now() / 1000);
    oauth_version = "1.0"
    oauth_signature  = ""
    method  = ""
    apiEndPoint   = ""
    queryParameter
    
    constructor(method ,apiEndPoint , queryParameter){
        this.method = method
        this.apiEndPoint = apiEndPoint
        if(queryParameter !== undefined){
            this.queryParameter = queryParameter
        }
        this.oauth_signature = this.signRequest()
    }
    encodeParameter(){
        let parameters = {}
        if(this.queryParameter !== undefined){
            parameters = {
                ...this.queryParameter,
                oauth_consumer_key:this.oauth_consumer_key,
                oauth_nonce: this.oauth_nonce,
                oauth_signature_method: this.oauth_signature_method,
                oauth_timestamp: this.oauth_timestamp,
                oauth_token: this.oauth_token,
                oauth_version: this.oauth_version
            }
        }
        else{
        parameters = {
                oauth_consumer_key:this.oauth_consumer_key,
                oauth_nonce: this.oauth_nonce,
                oauth_signature_method: this.oauth_signature_method,
                oauth_timestamp: this.oauth_timestamp,
                oauth_token: this.oauth_token,
                oauth_version: this.oauth_version
        }
        }
        let ordered = {};
        Object.keys(parameters).sort().forEach(function(key) {
            ordered[key] = parameters[key];
        });
        let encodedParameters = '';
        for (let k in ordered) {
          const encodedValue = escape(ordered[k]);
          const encodedKey = encodeURIComponent(k);
          if(encodedParameters === ''){
             encodedParameters += encodeURIComponent(encodedKey) +'='+encodeURIComponent(encodedValue)
          }
          else{
           encodedParameters += '&'+encodeURIComponent(encodedKey) +'='+encodeURIComponent(encodedValue)
          }
        }
        return encodedParameters
    }
    signRequest(){
        if(this.oauth_consumer_key && this.oauth_token && this.oauth_nonce && this.oauth_timestamp && this.oauth_version !== '' && this.oauth_signature_method !== '' && this.method !== '' && this.apiEndPoint !== ''  ){
            let encodeParameter = encodeURIComponent(this.encodeParameter())
            const encodeURL = encodeURIComponent(this.apiEndPoint)
            const signature_base_string = `${this.method}&${encodeURL}&${encodeParameter}`
            const signingKey = `${encodeURIComponent(process.env.twitter_APIkeySecret)}&${encodeURIComponent(process.env.twitter_tokenSecret_oauth1)}`
            const oauth_signature = crypto.createHmac("sha1", signingKey).update(signature_base_string).digest('base64');
            return encodeURIComponent(oauth_signature)

        }else{
            console.log(' One of Variable is not defined')
        }
    }
    async postTweet(tweetObj){
        let headerString =  `OAuth oauth_consumer_key="${this.oauth_consumer_key}",oauth_nonce="${this.oauth_nonce}",oauth_signature="${this.oauth_signature}",oauth_signature_method="${this.oauth_signature_method}",oauth_timestamp="${this.oauth_timestamp}",oauth_token="${this.oauth_token}",oauth_version="${this.oauth_version}"`
        let returnObject = await axios.post(this.apiEndPoint,tweetObj,
            {
                headers: {
                'Content-Type': `application/json`,
                'authorization': headerString}}).then(result => result.data.data)
        return returnObject 
    }
    async postImage(tweetObj){
        let headerString =  `OAuth oauth_consumer_key="${this.oauth_consumer_key}",oauth_nonce="${this.oauth_nonce}",oauth_signature="${this.oauth_signature}",oauth_signature_method="${this.oauth_signature_method}",oauth_timestamp="${this.oauth_timestamp}",oauth_token="${this.oauth_token}",oauth_version="${this.oauth_version}"`
        let returnObject = await axios.post(this.apiEndPoint,tweetObj,
            {
                headers: {
                'content-type' : 'multipart/form-data',
                'authorization': headerString}}).then(result => result.data.media_id_string)
        return returnObject
    }
}

export default TwitterClient
