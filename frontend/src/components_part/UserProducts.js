import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Badge, Pagination } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaShoppingCart, FaUser } from 'react-icons/fa';
import Image from './user.png';
const UserProducts = () => {
  const { userId } = useParams();
  const [userProducts, setUserProducts] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Change as needed

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/product/user/${userId}`);
        if (!response.ok) {
          throw new Error('Error fetching user products');
        }
        const data = await response.json();
        setUserProducts(data.data);
        setOwner(data.owner);
      } catch (error) {
        setUserProducts([]);
      
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [userId]);

  if (loading)
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );

  if (error)
    return (
      <Container className="text-center my-5">
        <h4 className="text-danger">{error}</h4>
      </Container>
    );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = userProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(userProducts.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container className="my-5">
      {/* Owner Info Card */}
      {owner && (
        <Card className="mb-4 shadow-lg border-0 rounded p-3">
          <Card.Body className="d-flex align-items-center">
            <img
              src={owner.image|| Image }
              alt={owner.firstname}
              className="rounded-circle me-3 border"
              width="80"
              height="80"
            />
            <div>
              <Card.Title className="fw-bold">
                <FaUser className="me-2 text-primary" />
                {owner.firstname} {owner.lastname}
              </Card.Title>
              <Card.Subtitle className="text-muted">
                <FaEnvelope className="me-2 text-danger" />
                {owner.email}
              </Card.Subtitle>
              <Card.Text>
                <FaPhone className="me-2 text-success" />
                {owner.phone}
              </Card.Text>
              <Card.Text>
                <FaMapMarkerAlt className="me-2 text-warning" />
                {owner.address}
              </Card.Text>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Products List */}
      {userProducts.length === 0 ? (
        <Card className="shadow-lg border-0 rounded p-4 mb-4">
          <Card.Body className="text-center">
            <h4 className="text-muted">No Products Available</h4>
            <p className="text-muted">There are no products to display for this user at the moment.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {currentProducts.map((product) => (
            <Col key={product.id} md={4} className="mb-4">
              <Card className="shadow-sm border-0 rounded overflow-hidden">
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.name}
                  className="p-2"
                  style={{ height: '250px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title className="fw-bold">{product.name}</Card.Title>
                  <Card.Text className="text-muted">{product.description}</Card.Text>

                  {/* Category Badge */}
                  <Badge pill bg="info" className="mb-2">
                    {product.category.name}
                  </Badge>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-success fs-5">${product.price}</span>
                    <Badge pill bg={product.status === 'In Stock' ? 'success' : 'danger'}>
                      {product.status}
                    </Badge>
                  </div>

                  <Card.Text className="mt-2 text-muted">
                    <FaShoppingCart className="me-1" />
                    {product.quantity} available
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
        />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item 
            key={index + 1} 
            active={index + 1 === currentPage} 
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages} 
        />
      </Pagination>
    </Container>
  );
};

export default UserProducts;
