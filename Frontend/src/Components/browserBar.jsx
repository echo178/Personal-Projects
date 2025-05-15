import React from "react";


export default function BrowserBar(props){

    return <div className="c-browser-bar" style={props.style}>
   
    <span className="c-browser-bar-dot"></span>
    <span className="c-browser-bar-dot"></span>
    <span className="c-browser-bar-dot"></span>
    
    <div className="c-browser-icon">
      <i className=" bi bi-dash-square"></i>
      <i className=" bi bi-window-stack"></i>
      <i className=" bi bi-x-square"></i>
    </div>
  </div>
}