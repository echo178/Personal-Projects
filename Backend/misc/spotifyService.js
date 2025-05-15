import axio from "axios";

class SpotifyService{
    getAccessToken(data){
        return axio(data)
    }
    getArtistID(query,headers){
        return axio.get(`https://api.spotify.com/v1/search?type=artist&q=${query}`,headers)
    }
}

export default new SpotifyService;