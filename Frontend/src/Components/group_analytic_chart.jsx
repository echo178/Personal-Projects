import React, { useState, useRef } from "react";
import { Container, Row, Col, Button} from 'react-bootstrap'
import { useReducer } from "react";
import moment from 'moment'
import Modal from 'react-bootstrap/Modal'



const reducer = (state,action) => {
    
    return state.map((currState) => {
        if(currState.id === action.id){
            return {...currState, show: !currState.show}
        }else{
            return currState
        }
        
    })
}


export default function AnalyticTable({dataObj, chartName}){
    const { totalSongCount ,currentSongCount , peakRankSong, Album} = dataObj
    const focusElement = useRef()
    const [openAlbum,setOpenAlbum] = useState(false)
    
    let initialDataState = [
        {
          id: "totalSongCount",
          displayText : 'Number of Songs Ranked on Chart (Total)',
          data: totalSongCount.reduce((result,curr) => ({songsDetail : [...result.songsDetail,...curr.songsDetail],count: result.count+ curr.count}), {songsDetail : [],count: 0}),
          show: false,
        },
        {
            id: "currentSongCount",
            displayText : 'Number of Songs Ranked on Chart (Currently)',
            data: currentSongCount.reduce((result,curr) => ({songsDetail : [...result.songsDetail,...curr.songsDetail],count: result.count+ curr.count}), {songsDetail : [],count: 0}),
            show: false,
        },
        {
            id: "peakRankSong",
            displayText: 'Highest Ranked Song on Chart',
            data: peakRankSong[0],
            show: false,
        },
        {
            id: "Album",
            data: Album,
            show: false,
        },
    ];
    initialDataState = initialDataState.map((obj) => (obj.data !== undefined) ? (obj) : ( {...obj, data :0}) )
    const albumName = (chartName ==='melonChart') ? '앨범': 'Album'
    
    const [currData,dispatch] = useReducer(reducer,initialDataState)
    function handleVisiblity(obj){
        return dispatch({id:obj.id})
    }
    function openDetailAlbum(){
        
        focusElement.current.scrollIntoView()
        setOpenAlbum(!openAlbum)
        
        
    }
    function generateAnalyticComponent(rowName,data){
        let buttonComponent  = (data.data === 0) ? <></> : <Button className="analyticDetailBtm" size="sm" variant="outline-secondary" onClick={() => handleVisiblity(data)}>See More</Button>
        let titleCol = <Col className="description" md={4} xs={8}>
        {data.displayText}
    </Col>
        switch(rowName){
            case 'totalSongCount':{
                let additionalDataModal = (data.data === 0) ? <></> : <Modal.Dialog  style={{'textAlign': 'left',fontSize: '16px'}}> 
                        <Modal.Body>          
                        <Row style={{'textAlign': 'center'}}>
                            <Col >Peak Rank</Col> <Col> Song Name</Col>
                        </Row>            
                        {data.data.songsDetail.sort((a,b) => a.peakRank - b.peakRank).map((obj,index) => (<Row key={chartName + obj.songName +obj.peakRank +index+ 'totalSongCount'}>
                                <Col style={{'textAlign': 'center'}}>{obj.peakRank}</Col>
                                <Col style={{'textAlign': 'left'}}>{obj.songName}</Col>
                            </Row>))}
                        </Modal.Body>
                </Modal.Dialog>
                
                return <Row>
                    <Row key={chartName + 'totalSongCount'}  >
                    {titleCol}
                    <Col md={2} xs={4} >
                       {data.data === 0 ? 0 : data.data.count}
                    </Col>
                    <Col md={2} xs={12}>
                        {buttonComponent}
                    </Col>
                    
                    </Row>
                    <Row>
                    {data.show && additionalDataModal}
                    </Row>
                </Row>
                
            }
            case 'currentSongCount':{
                let additionalDataModal = (data.data === 0) ? <></> : <Modal.Dialog  style={{'textAlign': 'left',fontSize: '16px'}}><Modal.Body>
                         <Row style={{'textAlign': 'center'}}>
                            <Col>Current Rank</Col> <Col> Song Name</Col>
                        </Row>            
                        {data.data.songsDetail.sort((a,b) => a.currRank - b.currRank).map((obj,index) => (<Row key={chartName + obj.currRank +obj.songName +index+ 'totalSongCount'}>
                                <Col  style={{'textAlign': 'center'}}>{obj.currRank}</Col>
                                <Col style={{'textAlign': 'left'}}>{obj.songName}</Col>
                            </Row>))}
                        </Modal.Body>
                </Modal.Dialog>
                
                return <Row key={chartName + 'currentSongCount'} >
                    <Row>
                        {titleCol}
                        <Col  md={2} xs={4}>
                            {data.data === 0 ? 0 : data.data.count}
                        </Col>
                        <Col  md={2}>
                            {buttonComponent}
                        </Col>
                    </Row>
                    <Row>
                        {data.show && additionalDataModal}     
                    </Row>
              
            </Row>
            }
            case "peakRankSong":{
                let DetailCompo =  (data.data === 0) ? <> </> : <Modal.Dialog style={{'textAlign': 'left',fontSize: '16px'}}>
                        <Modal.Body>
                        <Row className="peakRankrow">
                            <Col>
                                Highest Rank on Chart : 
                            </Col>
                            <Col className="peakRankdata">
                            {data.data.peakRank}
                            </Col>
                        </Row>
                        <Row className="peakRankrow">
                            <Col>
                                latest highest Rank time on Chart :
                            </Col>
                            <Col className="peakRankdata">
                            {moment(data.data.peakRankTime).format("Do MMM")}
                            </Col>
                        </Row>
                        <Row className="peakRankrow">
                            <Col>
                                Album : 
                            </Col>
                            <Col className="peakRankdata"> 
                                {data.data[albumName]}
                            </Col>
                        </Row>
                        </Modal.Body>
                        
                </Modal.Dialog >
                return <Row  key={chartName + 'peakRankSong'} >
                    <Row>
                        {titleCol}
                        <Col style={{'textAlign': 'center'}} md={2} xs="4">
                            
                                {(data.data === 0) ? <></>:<>
                                <b>{data.data.Song}</b>
                                </>}
                        </Col>
                        <Col  md={2}>
                            {buttonComponent}
                        </Col>
                                   
                    </Row>
                    <Row className="albumImg">
                        <img src={data.data.Img} alt={data.data.Song + ' Album Image'} style={{display : (chartName === 'circleChart')? 'none' : 'block'}}   />
                    </Row>
                    <Row>
                    {data.show && DetailCompo}
                    </Row>
                    
                </Row>
            }
            case 'Album': {
                let numberOfAlbumCompo = <Row >
                    <Col md={4} xs="8" className="description">Albums Ranked On Chart</Col>
                    <Col md={2} xs="4">{data.data.length}</Col>
                    <Col md={2}>
                        <Button size="sm" className="analyticDetailBtm" variant="outline-secondary" onClick={() => setOpenAlbum(!openAlbum)}>See More</Button>
                    </Col>                
                </Row>
                let detailAlbumCompo = (data.data === 0) ? <> </> : data.data.map((currAlbum,index) => {
                    let ktownTotalSales = (currAlbum.Ktown.length > 0) ? currAlbum.Ktown[0].Albums.reduce((acc,curr)=> acc + curr.totalSales,0) : 0
                    let circleChartTotalSales = (currAlbum.circleChart_weeklySales.length > 0) ? currAlbum.circleChart_weeklySales[0].Albums.reduce((acc,curr)=> acc + curr.totalSales,0) : 0
                    let closeButton = index === data.data.length -1 ? <Button size="sm" variant="outline-secondary" onClick={() => openDetailAlbum()}>Close</Button> : <></>
                    
                    return  <Row className="albumDetail" key={currAlbum.albumName + 'albumDetail' + index}><Modal.Dialog  >
                        <Modal.Header><Modal.Title>  {currAlbum.albumName} </Modal.Title></Modal.Header>
                        <Modal.Body>            
                        <Row >
                            <div className="albumImgDiv"  style={{display : (chartName === 'circleChart')? 'none' : 'block'}}>
                                <img src={currAlbum.peakRankSong.Img} alt={currAlbum.albumName + ' Album Image'} />
                            </div>                
                        </Row>
                        
                        <Row >
                            <Col className="description">
                                Number Of Songs at Chart
                            </Col>
                            <Col>
                                {currAlbum.chartedSong}
                            </Col>                
                        </Row>  
                        <Row>
                            <Col className="description">
                                Average Rank Of Album Songs
                            </Col>
                            <Col>
                                {currAlbum.avgRank}
                            </Col>
                        </Row>
                        <Row className="albumSales">
                        Album Sales
                        <ul>
                        <Row >
                            <Row className="salesDataRow">
                                <Col className="description" ><li>KTown4u</li></Col>
                                <Col>{ktownTotalSales > 0 ? ktownTotalSales.toLocaleString() : 'N/A'}</Col>
                            </Row>    
                            <Row>
                                {currAlbum.Ktown.length > 0 ? currAlbum.Ktown[0].Albums.sort((a,b) => b.totalSales - a.totalSales).map((ktownAlbum) => (
                                <ul key={"ktown-"+  ktownAlbum.Album}>
                                    <Row className="salesDataRow">
                                        <Col className="description" >
                                        { ktownAlbum.Album}
                                        </Col>
                                        <Col >
                                        { ktownAlbum.totalSales.toLocaleString()}
                                        </Col>
                                    </Row>                            
                                </ul>)) : <></>}  
                            </Row>                           
                        </Row> 
                        <Row>
                            <Row className="salesDataRow">
                                <Col className="description"> <li>Circle Chart Weekly Sales</li></Col>
                                <Col> {circleChartTotalSales > 0 ? circleChartTotalSales.toLocaleString() : 'N/A'}</Col>
                            </Row>
                            <Row>
                            {currAlbum.circleChart_weeklySales.length > 0  ?currAlbum.circleChart_weeklySales[0].Albums.sort((a,b) => b.totalSales - a.totalSales).map((circleChartAlbum) => (
                            <ul key={"circleChart-"+  circleChartAlbum.Album}>
                                <Row className="salesDataRow">
                                    <Col className="description">
                                    { circleChartAlbum.Album}
                                    </Col>
                                    <Col >
                                    { circleChartAlbum.totalSales.toLocaleString()}
                                    </Col>
                                </Row> 
                            </ul>
                        )) : <> </>}
                            </Row>
                        </Row>                                                                                                                                                            
                        </ul>                                                                        
                        </Row> 
                        </Modal.Body>       
                        <Modal.Footer>{closeButton}</Modal.Footer>
                    </Modal.Dialog>
                    
                    </Row>
                }
               
                )
                return <Row >          
                    {numberOfAlbumCompo}
                    {openAlbum && detailAlbumCompo}           
                    
                </Row>
            }
            default : return <></>
        }
    }
    
   
    return <Container style={{textAlign:'center',}} className="analyticTable" ref={focusElement} >
        {currData.map((obj,index)=> <React.Fragment key={chartName + 'analyticRow' + index}> {generateAnalyticComponent(obj.id,obj)}</React.Fragment>)}
       
    </Container>
   
}