import React from 'react'
import { useEffect,useState, useRef } from 'react'
import dataService from '../services/data.service.js'
import { Typeahead } from 'react-bootstrap-typeahead'
import VideoPlayer from './VideoPlayer.jsx'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Stack from 'react-bootstrap/Stack'
import Guide from './Game_Help.jsx'
export default function Game(){
    const [Data,setData] = useState({}) //fetched Data
    const [answerStatus,setAnswerStatus] = useState(1) //correct or wrong of answer, 1 is not unanswered yet
    const [videoControlStatus, setVideoControlStatus] = useState() //is video onCanPlayThrough
    const [currentLoaded, setCurrentLoaded] = useState(0) //currentLoaded Time
    const [totalTime,setTotalTime] = useState(0) // Total Video Length
    const [options, setOptions] = useState([]) //Typeahead options
    const [playButton, setPlayButton] = useState(false) //Video PlayButton disable boolean
    const [buttonStatus,setButtonStatus] = useState({
        disabled: true,
        text: "Hint"
    }) //Next or Hint button
    const [formText,setFormText] = useState('')
    const [score,setScore] = useState(0)
    const [highestScore,setHighestScore] = useState(window.localStorage.getItem('Score'))
    //ref for autofill Form
    const typeaheadRef = useRef();
    //ref passed to video Player
    const videoRef = useRef();
    /*
    func to check Submitted Answer
    & clear the current Submitted Text
    */
    window.addEventListener("beforeunload", (ev) => 
    {  
        window.localStorage.setItem('Score',highestScore)
        ev.preventDefault();
       
        return true;
    });
    function changeHighestScore(){
        if(score > highestScore){
            setHighestScore(score)
        }
        else return false
    }
    function submitAnswer(e){
        let answerSimilarPt = similarity(e.target[1].value,Data.Title)
        if(answerStatus === 1){
        if(answerSimilarPt > 0.78){
            setAnswerStatus(true)
            setScore(score + 1)
            if(score > highestScore){
                setHighestScore(score)
            }                        
        }else{
            setAnswerStatus(false)
            setScore(0)
        }
        }
        else if(answerStatus === false && !e.target[1].value){
            setFormText('please type answer')
        }
        else if(answerStatus === true && !e.target[1].value){
            setFormText('click Next for next question')
        }
        
        e.preventDefault();
        typeaheadRef.current?.clear()
        
        return true;
    }
    /*
    Function for Hint or Next Button
    if Hint : Give hints and change AnswerStatus to None so when re-answered it change FormText thorugh Answerstatus
    if Next : called reset function
    */
    function hint_next_button_click(){
        if(buttonStatus.text === "Hint"){
            setFormText('This MV is released at ' + Data.Date.substring(0,4))
            setAnswerStatus()
        }
        if(buttonStatus.text === "Next"){
            reset()
        }
    }
    function reset(){ 
        
        fetchData() 
        setVideoControlStatus(false)
        setAnswerStatus(1)
        
    }
    //fetch Document from backend
    async function fetchData(){
        let data = await dataService.getGame()   
        
        setData({...data})
    }
    //fetch Autofill Options 
    async function fetchOption(){
        let option = await dataService.getGameSuggestion()
        setOptions(option)
    }
    //function to check string match and calculate Similar Percentage
    function similarity(s1, s2) {
        function editDistance(s1, s2) {
            s1 = s1.replace(/\s+/i,'').toLowerCase();
            s2 = s2.replace(/\s+/i,'').toLowerCase();
          
            var costs = [];
            for (var i = 0; i <= s1.length; i++) {
              var lastValue = i;
              for (var j = 0; j <= s2.length; j++) {
                if (i === 0)
                  costs[j] = j;
                else {
                  if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                      newValue = Math.min(Math.min(newValue, lastValue),
                        costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                  }
                }
              }
              if (i > 0)
                costs[s2.length] = lastValue;
            }
            return costs[s2.length];
        }
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
          longer = s2;
          shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength === 0) {
          return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }
    //function for button to play video through video Ref
    function playVideo(){
        videoRef.current.play()
        setPlayButton(true)
    }
    //Initial Data Fetch
    useEffect(() => {
        fetchData()
        fetchOption()
        document.title = "Game | Kpop Statistics"
    },[])
    //Enable Play Button if video onCanPlaythorugh is true
    useEffect(() => {
        if(videoControlStatus === true){
            setPlayButton(false)
        }
        else{
            setPlayButton(true)
        }
    },[videoControlStatus])
    //Change "Hint" or "Next" Button & Form Text based on Answer Correct or Not, video is fully loaded or not, or video onCanPlayThrough is true or not
    useEffect(() =>{
        if(answerStatus === true){
            setButtonStatus({
                disabled: false,
                text: "Next"
            })
            setFormText('Your answer is correct, click next for next quizz')
        }
        else if(answerStatus === false){
            setButtonStatus(
                {
                    disabled: false,
                    text: "Hint"
                }
            )
            setFormText('Your answer is incorrect, maybe try to check the typo or do you want to see the hint?')
        }
    },[answerStatus])
    useEffect(() => {
        if(answerStatus === 1){
            setButtonStatus(
                {
                    disabled: true,
                    text: "Hint"
                }
            )
            let percentage = (currentLoaded/totalTime)*100
            percentage = Math.round(percentage)
            if(percentage === 100 || videoControlStatus === true){
                setFormText(' ')
            }
            else if(percentage !== 100 && videoControlStatus === false){
                setFormText('Video is loading,Please wait ...' + percentage + ' %' )
            }
        }
    },[currentLoaded,videoControlStatus])
    useEffect(() => {changeHighestScore() },[score])
    return (
        
        <div>
            <Guide/>
            {Object.keys(Data).length > 0?  
            
            <Stack gap={2} className="col-md-5 Game" >
                {console.log(Data)}
               
                <VideoPlayer key={Data.Title} src={Data.link} videoRef={videoRef} setVideoControlStatus={setVideoControlStatus} progress={setCurrentLoaded} totalTime={setTotalTime}/> 
                <Form onSubmit={submitAnswer}>
                    <Stack className="mx-auto" direction="horizontal" gap={2}>
                        <Button variant="primary" disabled={playButton} onClick={playVideo}>
                            Play
                        </Button>
                        <Typeahead id="basic-typeahead-single" labelKey="name" options={options} placeholder="What's your answer" ref={typeaheadRef} style={{width : '100%'}}/>
                        <Button variant="primary" type="submit">
                        Answer  
                        </Button>
                        <Button disabled={buttonStatus.disabled} onClick={hint_next_button_click}>
                        {buttonStatus.text}
                        </Button>
                    </Stack>
                <Form.Text id="Status" muted>
                    {formText}
                </Form.Text>
            </Form>
                <Form.Text id="streak">
                Streak : {score} <br/>
                <strong>Highest Score : {highestScore}</strong>  
                </Form.Text>
            </Stack>
            : <p>...Loading</p>}
        </div>
    )
}

