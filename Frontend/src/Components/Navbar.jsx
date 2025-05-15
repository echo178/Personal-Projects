import React from "react";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import {Typeahead} from 'react-bootstrap-typeahead'
import { useNavigate } from 'react-router-dom'
import { useState, useRef,useEffect } from "react";
import dataService from "../services/data.service";
import {  Button, Form } from "react-bootstrap";
import reactGA from '../services/reactGA.js'

const Heading = ({setArtistName,searchFromOtherCompo,setOtherSearchBarOption}) => {
    const [options,setOptions] = useState([])
    const [groupCheckData,setGroupCheckData] = useState({})
    const [comebackData, setComebackData] = useState({})
    const [searchData,setSearchData] = useState({})
    const [currentSearchWord, setCurrentSearchWord] = useState("")
    const typeaheadRef = useRef();
    let navigate = useNavigate()
    function constructSearchObj_groupData(dataArr){
        let engGroupName = dataArr.map((obj) => {
            let returnObj = {}
            returnObj['name'] = obj.artistFullName_Eng
            returnObj['index'] = obj.index
            return returnObj
        })
        let krGroupName = dataArr.map((obj) => {
            let returnObj = {}
            returnObj['name'] = obj.artistName_KR
            returnObj['index'] = obj.index
            return returnObj
        })
        let groupNameArr = engGroupName.concat(krGroupName)
        return {
            groupNames : groupNameArr,
        }
    
    }
    function searchComebackName(artistName){
        let returnSearchKey = Object.keys(comebackData).find((key) => comebackData[key].includes(artistName))
        return returnSearchKey
    }
   
    useEffect(() => {
        async function fetchOption(){
            let groupIndexData = await dataService.getGroupIndex()
            //let comebackData = await dataService.getWatchlistArtist()
            let searchDataObj = constructSearchObj_groupData(groupIndexData)
            let groupCheckData = groupIndexData.map(({index, ...rest}) => Object.values(rest)).flat()
            //let comebackOption = Object.values(comebackData).flat()
            /* disabled comebacks data for the simplicity for now */
    
            //let options = [...new Set(groupCheckData.concat(comebackOption))]
            let options = [...new Set(groupCheckData)]
            searchDataObj = {...searchDataObj,...comebackData}
            //setComebackData(comebackData)
            setSearchData(searchDataObj)
            setGroupCheckData(groupCheckData)
            setOptions(options)
            setOtherSearchBarOption(options)
        }
        fetchOption()
    },[])
    useEffect(() => {
        if(Object.keys(groupCheckData).length > 0 ){
            searchFunc(searchFromOtherCompo)
        }
        
    },[searchFromOtherCompo])
    useEffect(() => {
        if(Object.keys(groupCheckData).length > 0 ){
            searchFunc(currentSearchWord)
        }
    },[currentSearchWord])
    function searchFunc(searchWord){
        if(document.location.hostname === 'k-stats.com'){
            reactGA.event({
                category: 'Searched Keyword',
                action: searchWord,
            })
        }
        
        let searchKey
        let indexPath
        if(groupCheckData.includes(searchWord)){
            searchKey = "groupNames"
        }
        else{
            searchKey = searchComebackName(currentSearchWord)
        } 
        if((Object.keys(searchData).length > 0)&& searchKey !== undefined){
            if(searchKey === 'groupNames'){
                let obj = searchData[searchKey].find((obj) => obj.name ===searchWord)
                indexPath = obj.index      
                navigate(`/group/${indexPath}`);
            }
            else{
                let year = searchKey.slice(-4)
                let month = searchKey.slice(0,-4)
                setArtistName(searchWord)
                searchWord = searchWord.replaceAll(' ','')  
               navigate(`/comeback/${year}/${month}/${searchWord}`)
            }
        }
        typeaheadRef.current?.clear()    
    }
    function setSearchWordFromEvent(e){
        e.preventDefault();
        let inputText = e.target[0].value
        setCurrentSearchWord(inputText)
    }
    return (
        <Navbar className="nav-bar" expand="lg" sticky="top">
                <Navbar.Brand href= '/'> K-statistics </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/> 
            <Navbar.Collapse>
            <Nav className="me-auto my-2 my-lg-0" navbarScroll> 
                <Nav.Link href = '/recent'>Recent</Nav.Link>   
                <Nav.Link href ='/brief'>Monthly Summary</Nav.Link>                       
                <Nav.Link href="/game">Game</Nav.Link>
            </Nav>
                <Form className="d-flex" style={{gridGap: '15px'}} onSubmit={setSearchWordFromEvent} >                   
                    <Typeahead  id="basic-typeahead" labelKey="name" options={options}  style={{width: '300px'}} placeholder="Group Name" maxResults={3} paginationText= {"More..."} ref={typeaheadRef}/>
                    <Button variant="outline-success" type="submit"><i className="bi bi-search"></i></Button>
                </Form>
            </Navbar.Collapse>            
        </Navbar>
    )
}
export default Heading