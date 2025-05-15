import React from "react";


export default function VideoPlayer (props){
    return(
        <video controls={false} ref={props.videoRef} preload="auto" poster="https://i.ibb.co/NLvWWqd/Are-you-ready-9-14-2022.png" height="350" 
        onProgress={(e) => {props.totalTime(e.target.duration); props.progress(e.target.buffered.end(0))}} 
        onCanPlayThrough={() => props.setVideoControlStatus(true)}>
            <source src={props.src} />
            Sorry, your browser doesn't support embedded videos.
            
        </video>
    )
}