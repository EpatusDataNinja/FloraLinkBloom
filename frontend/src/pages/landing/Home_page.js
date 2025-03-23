import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import UserHeader from "../../components_part/user_header";
import Sidebar from "../../components_part/Sidebar_visitors";
import Footer from "../../components_part/Footer";
import { useNavigate } from "react-router-dom";
import Services from '../../components_part/Services';
import HomePageHero from '../../components_part/HomePageHero';
import { Card, Button, Spinner } from "react-bootstrap";
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLeaf, FaSun, FaSnowflake, FaTree } from 'react-icons/fa';

const HomePage = () => {
  // Define Rwanda's seasons first
  const RWANDA_SEASONS = {
    'Long Rainy': { 
      months: [2, 3, 4], 
      label: 'Long Rainy (Mar-May)',
      icon: <FaLeaf className="text-success" />,
      description: 'Perfect for vibrant blooms'
    },
    'Long Dry': { 
      months: [5, 6, 7], 
      label: 'Long Dry (Jun-Aug)',
      icon: <FaSun className="text-warning" />,
      description: 'Drought-resistant flowers'
    },
    'Short Rainy': { 
      months: [8, 9, 10], 
      label: 'Short Rainy (Sep-Nov)',
      icon: <FaTree className="text-primary" />,
      description: 'Seasonal flowering plants'
    },
    'Short Dry': { 
      months: [11, 0, 1], 
      label: 'Short Dry (Dec-Feb)',
      icon: <FaSnowflake className="text-info" />,
      description: 'Hardy winter varieties'
    }
  };

  // Get current season function
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    for (const [season, data] of Object.entries(RWANDA_SEASONS)) {
      if (data.months.includes(month)) {
        return season;
      }
    }
    return 'Long Rainy'; // default season
  };

  // State declarations
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState({
    trending: true,
    seasonal: true,
    available: true
  });
  const [data, setData] = useState({
    trending: [],
    seasonal: [],
    available: []
  });
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());

  // Get season icon
  const getSeasonIcon = (season) => {
    return RWANDA_SEASONS[season]?.icon || <FaLeaf className="text-success" />;
  };

  // Simplified seasonal filtering
  const filterProductsBySeason = (products, season) => {
    const seasonMonths = RWANDA_SEASONS[season].months;
    return products.filter(product => {
      const productMonth = new Date(product.createdAt).getMonth();
      return seasonMonths.includes(productMonth);
    });
  };

  // Add this useEffect back for initial trending and available products
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading({ trending: true, seasonal: true, available: true });
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`);
        
        if (response.data.success) {
          const products = response.data.data;
          const currentSeason = getCurrentSeason();

          // Trending Products
          const trendingProducts = products
            .filter(product => product.quantity > 0)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map(product => ({
              ...product,
              season: currentSeason
            }));

          // Available Products
          const availableProducts = products
            .filter(product => product.quantity > 0)
            .slice(0, 3)
            .map(product => ({
              ...product,
              season: currentSeason
            }));

          setData(prevData => ({
            ...prevData,
            trending: trendingProducts,
            available: availableProducts
          }));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading({ trending: false, seasonal: false, available: false });
      }
    };

    fetchInitialData();
  }, []); // Run only on component mount

  // Fetch seasonal data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(prev => ({ ...prev, seasonal: true }));
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`);
        
        if (response.data.success) {
          const products = response.data.data;
          const seasonalProducts = filterProductsBySeason(products, selectedSeason)
            .filter(product => product.quantity > 0)
            .slice(0, 4)
            .map(product => ({
              ...product,
              season: selectedSeason
            }));

          setData(prevData => ({
            ...prevData,
            seasonal: seasonalProducts
          }));
        }
      } catch (error) {
        console.error("Error fetching seasonal data:", error);
        toast.error("Failed to load seasonal products");
      } finally {
        setLoading(prev => ({ ...prev, seasonal: false }));
      }
    };

    fetchHomeData();
  }, [selectedSeason]);

  // 1. Update section headings and descriptions
  const sections = {
    trending: {
      title: "Trending Products",
      subtitle: "Our most popular floriculture items"
    },
    seasonal: {
      title: "Seasonal Selections",
      subtitle: "Products best suited for the current season"
    },
    available: {
      title: "Featured Collection",
      subtitle: "Explore our diverse range of floriculture products"
    }
  };

  // 2. Update season styling in SeasonalNav
  const SeasonalNav = () => (
    <div className="seasonal-nav">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-success fw-bold mb-2">{sections.seasonal.title}</h2>
        <p className="text-muted">{sections.seasonal.subtitle}</p>
      </div>
      <div className="season-buttons-container">
        {Object.entries(RWANDA_SEASONS).map(([season, data]) => (
          <Button
            key={season}
            variant={selectedSeason === season ? "success" : "outline-success"}
            className="season-button"
            onClick={() => setSelectedSeason(season)}
          >
            <span className="season-icon">{data.icon}</span>
            <span className="season-label">{data.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Services data - Keep static as it's configuration
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
      icon: '��'
    },
  ];

  // Render loading state
  const renderLoading = (section) => (
    <div className="text-center py-4">
      <Spinner animation="border" variant="success" />
      <p>Loading {section}...</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <UserHeader setShow={setShow} />
      <div className="d-flex">
        <Sidebar show={show} setShow={setShow} />
        <main className="flex-grow-1 main-content">
          <div className="container-fluid px-4 py-4">
            <HomePageHero />

            {/* Services Section */}
            <section className="bg-light p-4 rounded mb-4">
              <Services services={services} />
            </section>

            {/* Trending Section */}
            <section className="bg-light p-4 rounded mb-4">
              <div className="d-flex flex-column mb-4">
                <h2 className="text-success fw-bold mb-2">{sections.trending.title}</h2>
                <p className="text-muted">{sections.trending.subtitle}</p>
              </div>
              {loading.trending ? renderLoading("trending products") : (
              <div className="row g-4">
                  {data.trending.map((product) => (
                  <div key={product.id} className="col-md-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="card-img-container">
                          <img 
                            src={product.image.startsWith('http') 
                              ? product.image 
                              : `${process.env.REACT_APP_BASE_URL}${product.image}`
                            }
                            alt={product.name}
                            className="card-img-top product-img"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                          <div className="seasonal-overlay">
                            <span className="season-badge">
                              {getSeasonIcon(product.season)} {RWANDA_SEASONS[product.season]?.label}
                            </span>
                        </div>
                        </div>
                        <Card.Body className="text-center d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="text-success fw-bold mb-2">{product.name}</Card.Title>
                            <Card.Text className="text-muted mb-3">{RWANDA_SEASONS[product.season]?.description}</Card.Text>
                            <p className="price mb-2">RWF {product.price?.toLocaleString()}</p>
                            <p className="stock mb-3">Stock: {product.quantity} units</p>
                      </div>
                          <Button 
                            variant="outline-success" 
                            className="rounded-pill px-4"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                          View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              )}
            </section>

            {/* Seasonal Section */}
            <section className="bg-light p-4 rounded mb-4">
              <SeasonalNav />
              {loading.seasonal ? renderLoading("seasonal products") : (
              <div className="row g-4">
                  {data.seasonal.map((product) => (
                    <div key={product.id} className="col-md-3">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="seasonal-img-container">
                          <img 
                            src={product.image.startsWith('http') 
                              ? product.image 
                              : `${process.env.REACT_APP_BASE_URL}${product.image}`
                            }
                            alt={product.name}
                            className="card-img-top product-img"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                          <div className="seasonal-badge-overlay">
                            <span className="seasonal-period-badge">
                              {getSeasonIcon(product.season)} 
                              <span>{RWANDA_SEASONS[product.season]?.label}</span>
                            </span>
                        </div>
                        </div>
                        <Card.Body className="text-center d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="text-success fw-bold mb-2">{product.name}</Card.Title>
                            <Card.Text className="text-muted mb-3">{RWANDA_SEASONS[product.season]?.description}</Card.Text>
                            <p className="price mb-2">RWF {product.price?.toLocaleString()}</p>
                            <p className="stock mb-3">Stock: {product.quantity} units</p>
                      </div>
                          <Button 
                            variant="success" 
                            className="rounded-pill px-4"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              )}
            </section>

            {/* Available Products Section */}
            <section className="bg-light p-4 rounded mb-4">
              <div className="d-flex flex-column mb-4">
                <h2 className="text-success fw-bold mb-2">{sections.available.title}</h2>
                <p className="text-muted">{sections.available.subtitle}</p>
              </div>
              {loading.available ? renderLoading("available products") : (
              <div className="row g-4">
                  {data.available.map((product) => (
                  <div key={product.id} className="col-md-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="available-img-container">
                          <img 
                            src={product.image.startsWith('http') 
                              ? product.image 
                              : `${process.env.REACT_APP_BASE_URL}${product.image}`
                            }
                            alt={product.name}
                            className="card-img-top product-img"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                          <div className="seasonal-overlay">
                            <span className="season-badge">
                              {getSeasonIcon(product.season)} {RWANDA_SEASONS[product.season]?.label}
                            </span>
                        </div>
                        </div>
                        <Card.Body className="text-center d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="text-success fw-bold mb-2">{product.name}</Card.Title>
                            <Card.Text className="text-muted mb-3">{RWANDA_SEASONS[product.season]?.description}</Card.Text>
                            <p className="price mb-2">RWF {product.price?.toLocaleString()}</p>
                            <p className="stock mb-3">Stock: {product.quantity} units</p>
                      </div>
                        <Button 
                          variant="success" 
                          className="rounded-pill px-4"
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            View Details
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              )}
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

        /* Common styles for all sections */
        .hover-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
          height: 420px;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Common image container styles */
        .card-img-container, .seasonal-img-container, .available-img-container {
          position: relative;
          padding-top: 60%;
          background-color: #15803d;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        
        .product-img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .hover-card:hover .product-img {
          transform: scale(1.05);
        }

        /* Trending and Featured Collection styles */
        .season-badge {
          background: rgba(21, 128, 61, 0.9);
          backdrop-filter: blur(4px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.95rem 0.45rem;
          border-radius: 25px;
          font-size: 1.1rem;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          white-space: nowrap;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-align: left;
          font-weight: 500;
          min-width: 200px;
          max-width: 90%;
          margin: 0 auto;
          padding-right: 1.5rem;
        }

        .season-badge span {
          display: inline-flex;
          align-items: center;
          text-align: left;
          letter-spacing: 0.5px;
          transform: translateX(-1rem);
        }

        .seasonal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          width: 100%;
        }

        /* Seasonal Selection specific styles */
        .seasonal-period-badge {
          background: rgba(21, 128, 61, 0.9);
          backdrop-filter: blur(4px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.95rem 0.45rem;
          border-radius: 25px;
          font-size: 1.1rem;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          white-space: nowrap;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-align: left;
          font-weight: 500;
          min-width: 200px;
          max-width: 90%;
          margin: 0 auto;
          padding-right: 1.5rem;
        }

        .seasonal-period-badge span {
          display: inline-flex;
          align-items: center;
          text-align: left;
          letter-spacing: 0.5px;
          transform: translateX(-1rem);
        }

        .seasonal-badge-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          width: 100%;
        }

        /* Icon styles for both types of badges */
        .season-badge svg, .seasonal-period-badge svg {
          flex-shrink: 0;
          font-size: 1.3rem;
        }

        /* Text styles for both types of badges */
        .season-badge span {
          display: inline-flex;
          align-items: center;
          text-align: center;
          letter-spacing: 0.5px;
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
        .season-button {
          padding: 0.75rem 1.5rem;
          font-size: 1.1rem;
          font-weight: 500;
          min-width: 200px;
          justify-content: center;
        }
        .season-text {
          font-size: 1.1rem;
          white-space: nowrap;
        }
        .seasonal-nav {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .metrics-card {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }
        .metrics-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h2 {
          font-size: 2rem;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
        }
        .text-muted {
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .hover-card {
          height: 420px;
        }
        .season-buttons-container {
          display: flex;
          flex-wrap: nowrap;
          gap: 1rem;
          justify-content: space-between;
          width: 100%;
        }
        .season-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.40rem 1rem;
          font-size: 0.9rem;
          white-space: normal;
          text-align: center;
          min-height: 60px;
          line-height: 1.2;
        }
        .season-icon {
          display: flex;
          align-items: center;
          font-size: 1.1rem;
        }
        .season-label {
          display: inline-block;
        }
        @media (max-width: 768px) {
          .season-buttons-container {
            flex-wrap: wrap;
          }
          
          .season-button {
            flex: 1 1 45%;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;