import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Spinner, Badge, Button } from 'react-bootstrap';
import { FaUser, FaDollarSign } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserStatisticsCard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStatistics = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/product/users_statistics`);

        if (!response.ok) {
          throw new Error('Error fetching data');
        }

        const data = await response.json();
        setUserData(data.data[0]); // Assuming we need the first item
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatistics();
  }, []);

  if (loading) return <Container className="text-center my-5"><Spinner animation="border" variant="primary" /></Container>;
  if (error) return <Container className="text-center my-5"><h4 className="text-danger">{error}</h4></Container>;

  return (
    <Container className="my-5" style={{ backgroundColor: 'whitesmoke', padding: '0.4cm' }}>
      <Row>
        <Col md={12}>
          <Card className="border-0">
            <Card.Body>
              {/* User Info Section */}
              <div className="d-flex align-items-center mb-3">
                <FaUser size={40} className="text-success me-3" />
                <div>
                  <Card.Title>{userData ? `${userData.user.firstname} ${userData.user.lastname}` : 'User Name'}</Card.Title>
                  <Card.Subtitle className="text-muted">{userData ? userData.user.email : 'Email not available'}</Card.Subtitle>
                </div>
              </div>

              {/* Product Info Section */}
              {userData && userData.firstProduct && userData.firstProduct.image ? (
                <Card.Img variant="top" src={userData.firstProduct.image} alt={userData.firstProduct.name} className="mb-3" />
              ) : (
                <div className="text-center text-muted mb-3">Product Image Not Available</div>
              )}

              <Card.Text>
                <strong>{userData && userData.firstProduct ? userData.firstProduct.name : 'Product Name'}</strong>
                <br />
                <span><FaDollarSign className="me-1" /> {userData && userData.firstProduct ? userData.firstProduct.price : 'N/A'}</span>
                <br />
                <Badge pill bg={userData && userData.firstProduct && userData.firstProduct.status === 'In Stock' ? 'success' : 'danger'}>
                  {userData && userData.firstProduct ? userData.firstProduct.status : 'Status Unavailable'}
                </Badge>
              </Card.Text>

              {/* View All Products Button */}
              <Button variant="success" onClick={() => navigate(`/user-products/${userData ? userData.user.id : ''}`)} disabled={!userData}>
                View All Products
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserStatisticsCard;
