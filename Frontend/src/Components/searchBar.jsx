import React from 'react'
import {Typeahead} from 'react-bootstrap-typeahead'
import { useState, useEffect, useRef } from 'react'
import {  Button, Form } from "react-bootstrap";
const SearchBar = ({searchBarOption,setSearchWord}) => {
    const [givenOption,setGivenOption] = useState([])
    const typeaheadRef = useRef()
    useEffect(() => {
        setGivenOption(searchBarOption)
    },[searchBarOption])

    function setFormText(e){
        e.preventDefault();
        let inputText = e.target[0].value
        setSearchWord(inputText)
    }
   
    return <Form className="d-flex searchBar"  onSubmit={setFormText} >
                <Typeahead  id="basic-typeahead" labelKey="name" options={givenOption}  style={{width: '40vw'}} placeholder="Group Name" maxResults={3} paginationText={"More... "} ref={typeaheadRef} />
                <Button variant="outline-success" type="submit"><i className="bi bi-search"></i></Button>
        </Form>
}
export default SearchBar