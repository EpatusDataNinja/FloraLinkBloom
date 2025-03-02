import React from "react";
import { Card, Container, Row, Col } from "react-bootstrap";

// Import images
import Image from "../Accounts_Auto/fro.png";


const flowersData = {
  trending: [
    { id: 1, name: "Orchid", description: "Exotic and elegant orchids.", image: Image },
    { id: 2, name: "Rose", description: "Fresh and vibrant roses.", image: Image },
  ],
  seasonal: [
    { id: 1, name: "Spring Tulips", season: "Spring", description: "Bright tulips for spring gardens.", image: Image },
    { id: 2, name: "Summer Sunflowers", season: "Summer", description: "Vibrant sunflowers bring warmth.", image: Image },
    { id: 3, name: "Autumn Chrysanthemums", season: "Autumn", description: "Rich and colorful decor.", image: Image },
    { id: 4, name: "Winter Poinsettias", season: "Winter", description: "Festive poinsettias for winter.", image: Image },
  ],
  available: [
    { id: 1, name: "Boston Fern", price: "$20.00", stock: 50, image: Image },
    { id: 2, name: "Lavender", price: "$15.00", stock: 30, image: Image },
  ],
};

const FlowersPage = () => {
  return (
    <Container className="mt-4">


      <Row style={{ marginTop: '1.5cm' }}>
        <h1 className="text-center"><b style={{ color: '', marginBottom: '3cm' }}> <span style={{ color: 'white' }}>Bloom with</span> <span style={{ color: 'green' }}>nature beauty</span></b></h1>
        <p className="text-center" style={{ color: 'white' }}> connecting buyers with growers and flolist for fresh and vibrate flowers</p>



      </Row>
      <h1 className="" style={{ color: 'darkgreen' }}><b>Sessional flowers</b></h1>

      <Row>
        {flowersData.trending.map((flower) => (
          <Col key={flower.id} md={3} sm={6} className="mb-3">
            <Card style={{ backgroundColor: 'green', borderRadius: '0.4cm' }} >
              <Card.Img variant="top" src={flower.image} alt={flower.name} className="mx-auto d-block"
                style={{ height: '4cm', width: '4cm', }} />
              <Card.Body style={{
                backgroundColor: 'white', borderBottomLeftRadius: '0.4cm',
                borderBottomRightRadius: '0.4cm'
              }}>
                <Card.Title>{flower.name}</Card.Title>
                <Card.Text>{flower.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row style={{ marginTop: '1.5cm' }}>

        <h1 className="" style={{ color: 'darkgreen' }}><b>Trending Flowers</b></h1>

        {flowersData.seasonal.map((flower) => (
          <Col key={flower.id} md={3} sm={6} className="mb-3">
            <Card style={{ backgroundColor: 'green', borderRadius: '0.4cm' }} >
              <Card.Img variant="top" src={flower.image} alt={flower.name} className="mx-auto d-block"
                style={{ height: '4cm', width: '4cm', }} />
              <Card.Body style={{
                backgroundColor: 'white', borderBottomLeftRadius: '0.4cm',
                borderBottomRightRadius: '0.4cm'
              }}>
                <Card.Title style={{ fontStyle: 'bold', color: 'green' }}>{flower.name}</Card.Title>
                <Card.Text>{flower.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>


      <Row style={{ marginTop: '1.5cm' }}>

        <h1 className="mt-4" style={{ color: 'darkgreen' }}><b>Available Flowers</b></h1>

        {flowersData.available.map((flower) => (
          <Col key={flower.id} md={3} sm={6} className="mb-3">
            <Card style={{ backgroundColor: 'green', borderRadius: '0.4cm' }} >
              <Card.Img variant="top" src={flower.image} alt={flower.name} className="mx-auto d-block"
                style={{ height: '4cm', width: '4cm', }} />
              <Card.Body style={{
                backgroundColor: 'white', borderBottomLeftRadius: '0.4cm',
                borderBottomRightRadius: '0.4cm'
              }}>
                <Card.Text>Price: {flower.price}</Card.Text>
                <Card.Text>Stock: {flower.stock}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default FlowersPage;
