import React from 'react'
import { useState } from 'react'
import "bootstrap-icons/font/bootstrap-icons.css";
import { Row, Col} from 'react-bootstrap'

export default function Collapsible(props){
    const [open, setOpen] = useState(false);
    const toggle = () => {
        setOpen(!open)
    }
    return <div className='collapse_compo'>
   
    <Row className="align-items-center">
        <Col sm={11}>
        <button onClick={toggle} className="collapse-button"><h6><i className="bi bi-pin-angle-fill"></i>{props.label}</h6> </button>
        </Col>
        <Col sm={1}>
        <i onClick={toggle} className="bi bi-arrow-bar-down"></i>
        </Col>

    </Row>
    <Row >
    { open && props.children }
    </Row>
    
    </div>
}