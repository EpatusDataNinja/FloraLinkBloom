import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import UserHeader from "../../components_part/user_header";
import Sidebar from "../../components_part/Sidebar_visitors";
import Footer from "../../components_part/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import Services from '../../components_part/Services';
import HomePageHero from '../../components_part/HomePageHero';
import { Card, Button } from "react-bootstrap";

const HomePage = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Services data
  const services = [
    { 
      id: 1, 
      name: 'Floral Design', 
      description: 'Expert floral arrangements for any occasion.',
      icon: '🌸'
    },
    { 
      id: 2, 
      name: 'Garden Maintenance', 
      description: 'Professional care for your flower gardens.',
      icon: '🌿'
    },
    { 
      id: 3, 
      name: 'Irrigation Solutions', 
      description: 'Efficient watering systems for your blooms.',
      icon: '💧'
    },
    { 
      id: 4, 
      name: 'Soil & Fertilizer', 
      description: 'Optimal soil and nutrient solutions for flowers.',
      icon: '🧪'
    },
  ];

  const trendingProducts = [
    { 
      id: 1, 
      name: 'Roses', 
      category: 'Flowers', 
      details: 'Fresh and vibrant roses.', 
      image: '🌹',
      price: '$20.00',
      stock: 45 
    },
    { 
      id: 2, 
      name: 'Tulips', 
      category: 'Flowers', 
      details: 'Colorful tulips for your garden.', 
      image: '🌷',
      price: '$15.00',
      stock: 30
    },
    { 
      id: 3, 
      name: 'Orchids', 
      category: 'Flowers', 
      details: 'Exotic and elegant orchids.', 
      image: '🌸',
      price: '$25.00',
      stock: 20
    },
  ];

  const seasonalFlowers = [
    { 
      id: 1, 
      name: 'Spring Tulips', 
      image: '🌷', 
      season: 'Spring', 
      description: 'Bright and cheerful tulips perfect for spring gardens.',
      price: '$18.00',
      stock: 40
    },
    { 
      id: 2, 
      name: 'Summer Sunflowers', 
      image: '🌻', 
      season: 'Summer', 
      description: 'Vibrant sunflowers that bring summer warmth to your home.',
      price: '$22.00',
      stock: 35
    },
    { 
      id: 3, 
      name: 'Autumn Chrysanthemums', 
      image: '🍂', 
      season: 'Autumn', 
      description: 'Rich and colorful chrysanthemums for autumn decor.',
      price: '$20.00',
      stock: 25
    },
    { 
      id: 4, 
      name: 'Winter Poinsettias', 
      image: '🎄', 
      season: 'Winter', 
      description: 'Festive poinsettias to brighten up your winter holidays.',
      price: '$24.00',
      stock: 30
    },
  ];

  const availableProducts = [
    { 
      id: 1, 
      name: 'Sunflowers', 
      category: 'Flowers', 
      available: true, 
      image: '🌻',
      price: '$19.00',
      stock: 50
    },
    { 
      id: 2, 
      name: 'Lilies', 
      category: 'Flowers', 
      available: false, 
      image: '💮',
      price: '$21.00',
      stock: 0
    },
    { 
      id: 3, 
      name: 'Daisies', 
      category: 'Flowers', 
      available: true, 
      image: '🌼',
      price: '$16.00',
      stock: 30
    },
  ];

  return (
    <div className="min-h-screen">
      <UserHeader setShow={setShow} />
      <div className="d-flex">
        <Sidebar show={show} setShow={setShow} />
        <main className="flex-grow-1 main-content">
          <div className="container-fluid px-4 py-4">
            {/* Replace the old hero section with HomePageHero component */}
            <HomePageHero />

            {/* Services Section */}
            <section className="bg-light p-4 rounded mb-4">
              <Services services={services} />
            </section>

            {/* Trending Section */}
            <section className="bg-light p-4 rounded mb-4">
              <h2 className="text-success fw-bold mb-4">Trending Flowers</h2>
              <div className="row g-4">
                {trendingProducts.map((product) => (
                  <div key={product.id} className="col-md-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="card-img-container">
                        <div className="product-image d-flex align-items-center justify-content-center">
                          <span className="product-emoji">{product.image}</span>
                        </div>
                        <div className="card-img-overlay d-flex align-items-center justify-content-center">
                          <div className="flower-icon">{product.image}</div>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="text-success fw-bold">{product.name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{product.category}</Card.Subtitle>
                        <Card.Text>{product.details}</Card.Text>
                        <p className="price mb-2">{product.price}</p>
                        <p className="stock mb-3">Stock: {product.stock} units</p>
                        <Button variant="outline-success" className="rounded-pill px-4">
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </section>

            {/* Seasonal Section */}
            <section className="bg-light p-4 rounded mb-4">
              <h2 className="text-success fw-bold mb-4">Seasonal Flowers</h2>
              <div className="row g-4">
                {seasonalFlowers.map((flower) => (
                  <div key={flower.id} className="col-md-3">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="seasonal-img-container">
                        <div className="seasonal-image d-flex align-items-center justify-content-center">
                          <span className="seasonal-emoji">{flower.image}</span>
                        </div>
                        <div className="seasonal-overlay">
                          <span className="season-badge">{flower.season}</span>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="text-success fw-bold">{flower.name}</Card.Title>
                        <Card.Text>{flower.description}</Card.Text>
                        <p className="price mb-2">{flower.price}</p>
                        <p className="stock mb-3">Stock: {flower.stock} units</p>
                        <Button variant="success" className="rounded-pill px-4">
                          Add to Cart
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </section>

            {/* Available Products Section */}
            <section className="bg-light p-4 rounded mb-4">
              <h2 className="text-success fw-bold mb-4">Available Flowers</h2>
              <div className="row g-4">
                {availableProducts.map((product) => (
                  <div key={product.id} className="col-md-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="available-img-container">
                        <div className="product-image d-flex align-items-center justify-content-center">
                          <span className="product-emoji">{product.image}</span>
                        </div>
                        <div className="status-badge" data-status={product.available ? 'Available' : 'Out of Stock'}>
                          {product.available ? 'Available' : 'Out of Stock'}
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="text-success fw-bold">{product.name}</Card.Title>
                        <p className="price mb-2">{product.price}</p>
                        <p className="stock mb-3">Stock: {product.stock} units</p>
                        <Button 
                          variant="success" 
                          className="rounded-pill px-4"
                          disabled={!product.available}
                        >
                          {product.available ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <Footer />
        </main>
      </div>

      <style jsx="true">{`
        .main-content {
          background: linear-gradient(to right, #15803d, #84cc16);
          min-height: calc(100vh - 68px);
          overflow-y: auto;
          margin-left: 320px;
          transition: margin-left 0.3s ease-in-out;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }

        .hover-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .card-img-container, .seasonal-img-container, .available-img-container {
          position: relative;
          padding-top: 75%;
          background-color: #15803d;
          overflow: hidden;
        }
        .product-image, .seasonal-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-emoji, .seasonal-emoji {
          font-size: 5rem;
          transition: transform 0.3s ease;
        }
        .hover-card:hover .product-emoji,
        .hover-card:hover .seasonal-emoji {
          transform: scale(1.2);
        }
        .card-img-overlay {
          background: rgba(21, 128, 61, 0.1);
          transition: background 0.3s ease;
        }
        .hover-card:hover .card-img-overlay {
          background: rgba(21, 128, 61, 0.2);
        }
        .season-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #15803d;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }
        .status-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .status-badge[data-status="Available"] {
          background: #15803d;
          color: white;
        }
        .status-badge[data-status="Out of Stock"] {
          background: #dc3545;
          color: white;
        }
        .price {
          font-size: 1.5rem;
          font-weight: 600;
          color: #15803d;
        }
        .stock {
          color: #6c757d;
          font-size: 0.875rem;
        }
        .text-success {
          color: #15803d !important;
        }
        .btn-success {
          background-color: #15803d;
          border-color: #15803d;
        }
        .btn-success:hover {
          background-color: #166534;
          border-color: #166534;
        }
        .btn-outline-success {
          color: #15803d;
          border-color: #15803d;
        }
        .btn-outline-success:hover {
          background-color: #15803d;
          border-color: #15803d;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default HomePage;