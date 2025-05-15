import React from 'react'
import { useState,useEffect } from 'react'
import {Container,Row, Col} from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Collapsible from './Collapse_Compo.jsx'
import dataService from '../services/data.service.js'
import {Helmet} from 'react-helmet'

export default function LandingPage(){
    const [briefData,setBriefData] = useState({})
    const [counter,setCounter] = useState(0)
    const [counter2,setCounter2] = useState(0)
    useEffect(() => {
        dataFetch()
    },[])
    useEffect(() => {
        if(Object.keys(briefData).length === 0){
            let RandomNumber = Math.floor(Math.random() * 1000)
            setTimeout(() => {
                setCounter((count) => count + RandomNumber);
               
              }, 200)
           
        }
    },[counter])
    useEffect(() => {
        setTimeout(() => {
            if(counter2 < 7){
                setCounter2((count) => count + 1)
            } 
          }, 700)
    },[counter2])

    async function dataFetch(){
        let fetchData = await dataService.getBrief()
        setBriefData(fetchData)
    }
    function heroComponent(){
        return <div className='hero'>
            <h1>K-Stats</h1>
            <h2>A place numbers are not boring</h2>
            <p>
                You will see the numbers and statistics of Kpop Groups that you would like to find out
            </p>
            <Button variant="outline-primary" href="/brief">Check out!</Button>
        </div>
    }
    function AboutComponent(){
        return <Container className='about' fluid>
                <Row>
                    <Col className='about-title' xs lg={3}>
                        <h1>So what does this website do?</h1>
                    </Col>
                    <Col className='about-text-container' >
                        <Row className='about-text'>
                            <p><i className="bi bi-activity"></i> We periodically tracked your favorite Kpop Groups and their newly released songs. </p> <br/>
                        </Row>
                        <Row className='about-text'>
                            <p><i className="bi bi-graph-up"></i> and then, we present those data into charts. so you can quickly grasp the data</p>
                        </Row>  
                        <Row className='about-text'>
                            <p><i className="bi bi-patch-exclamation"></i> BUT, we don't stop there, we are also planning to launch other exciting contents so  the  end is beyond the horizon</p>
                        </Row>                      
                    </Col>  
                </Row>                 
        </Container>
    }

    function socialProof(){
        return <Container className='sproof'>
            <Row className='sproof-content'>
                    <Row> {Object.keys(briefData).length > 0 ? <p className='sproof-text'><span className='highlight-text'>{briefData.currDataPoint.toLocaleString()}</span>  <span className='hollow-text'> Data Points Currently</span></p>  : <SpinNumberCompo counter={counter}/>} </Row>
                    <Row>{Object.keys(briefData).length > 0 ? <p className='sproof-text'><span className='highlight-text'>7</span>  <span className='hollow-text'>Data Source</span> </p>  : <SpinNumberCompo counter={counter2}/>} </Row>
                    <Row>{Object.keys(briefData).length > 0 ? <p className='sproof-text'><span className='hollow-text'>Collected</span>  <span className='highlight-text'>Hourly</span></p>  : <></>}</Row>
            </Row>
        </Container>
    }
    function SpinNumberCompo(props){
            let  counterNo= props.counter
        return  <div className='sproof-text'> 
                    <span className='highlight-text'>  
                        {counterNo.toLocaleString()}
                    </span>
                </div>
    }
    function contactComponent(){
        return <div>
            <h3>How can I contact you?</h3>
            <p> For any questions, feedback or even dropping the Hi, you can send an email to the <strong>kzyt.dev@gmail.com</strong>. Let's Stay connected!</p>
            <p> If you want to help me to improve the website, you can help out by filling this <a href="https://docs.google.com/forms/d/e/1FAIpQLSdqrrW5to__DjdcrVTw9ljmm33q79wnmFJxYxcXmMwPJSeB7Q/viewform?usp=sf_link">survery</a>. Thanks in advance. </p>
        </div>

    }
    function FAQComponent(){
        return <Container className="FAQsection" fluid>
            <Row>
            <h3>Frequently Asked Questions</h3>
            </Row>
            <Row className='FAQ-content'>
                <Row className='align-items-center'>
                    <Col>
                    <Collapsible label='I think I found some data missing, accurate or incorrect/incomplete'>
                    <p>As the service is currently in developing, we are trying to get more accurate data with the data tracking services become more stable in the future, 
                        if you want to particularly report the data incorrectment, let us know by the email address at the contact section below.
                    </p>
                    </Collapsible>
                    </Col>
                </Row>
                <Row className='align-items-center'>
                    <Col >
                    <Collapsible label='I only found the recent data of group and released songs, Where can I find the older data'>
                    <p>The data collected are currently included till 2022 when the service is planned to started it. But as the service is expanding, we will backtrack       those data and add more data sources</p>
                    </Collapsible>   
                    </Col>
                    
                </Row>
                <Row className='align-items-center'>
                    <Col >
                    <Collapsible label='Contents are messy for me'>
                    <p>As the website is currently in beta, it is not compatiable for all devices and browser. We are currently fixing it so in the meantime, please use desktop and chrome browser for the best experience</p>
                    </Collapsible>   
                    </Col>
                    
                </Row>
            </Row>                     
        </Container>

    }
    

    return <div>
        <Container className='landing-page' fluid>
            <section>
                <Row className="align-items-center g-0">
                    <Col> {heroComponent()}</Col>  
                </Row>
            </section>
            <section>
                <Row className="align-items-center g-2">
                    <Col>{AboutComponent()}</Col>
                    <Col>{socialProof()}</Col>
                </Row>
            </section>
            <section>
                <Row className="align-items-center g-0">
                    <Col>{FAQComponent()}</Col>
                </Row>
            </section>
            <section>
                <Row className="align-items-center g-0">
                    <Col>{contactComponent()}</Col>
                </Row>
            </section>
            
        </Container>
       
    </div>
}