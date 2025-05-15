import React from "react";
import { Container,Row,Col } from "react-bootstrap";


const ErrorUI = () => {
    return <Container className="error_page align-items-center" > 
        <Row >
            <img src="/404.jpg" alt="error image"/>       
        </Row> 
        <Row style={{textAlign:'center'}}>
            <Col>
            <h3> Something has wrong on our side.</h3>
            <p> We will fix this quickly so please visit again later</p>    
            </Col>
            
        </Row>    
    </Container>
}
export default ErrorUI