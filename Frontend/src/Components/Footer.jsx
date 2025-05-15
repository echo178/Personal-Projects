import React from 'react'
import { Container,Row, Col } from 'react-bootstrap'
const Footer = () => {

    return <Container className='footer g-0' fluid>
       <Row>
        <Col>
        Copyright Reserved <i className="bi bi-c-circle"></i> 2022 K-stats
        </Col>
        <Col>
            <div className='footer-icons'>
                <a href="https://twitter.com/kstats_com"><i className="bi bi-twitter" ></i></a>
                <i className="bi bi-instagram"></i>
            </div>
        </Col>
       </Row>
    </Container>
}
export default Footer