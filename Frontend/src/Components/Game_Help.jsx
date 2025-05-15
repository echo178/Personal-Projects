import React from 'react'
import { useState } from 'react'
import { Modal, Button} from 'react-bootstrap'


export default function Guide(){
    const [show, setShow] = useState(true)
    const handleClose = () => setShow(false)

    return (
        <div>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header> 
                    <Modal.Title>How can we play</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    We will show you the minified version of MV.
                    <ul>
                        <strong> Rules </strong>
                        <li> Play Button will be available after short period of time. <br/> 
                        (It will be disabled after watched so you only get one chance) </li>
                        <li> You can get hint after getting wrong </li>
                        <li> Try to take a guess!</li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}