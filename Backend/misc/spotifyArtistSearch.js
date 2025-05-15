
import SpotifyService from '../musicAPI/spotifyService.js'
import dotenv from 'dotenv'
dotenv.config({path:"Projects/K-meter/Backend/.env"})

var client_id = process.env.client_id;
var client_secret = process.env.client_secret;



var userForm = {
    method : 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers : {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    data : 'grant_type=client_credentials',
    json: true
}
const accessToken = await SpotifyService.getAccessToken(userForm).then(response => response.data.access_token)

var options = {
    headers:    {
    'Authorization': `Bearer ${accessToken}`
    },
}
function ArtistIdSearch(name){
    return SpotifyService.getArtistID(name,options).then(response => console.log(response.data.artists.items[0].id))
}


ArtistIdSearch('IU')
