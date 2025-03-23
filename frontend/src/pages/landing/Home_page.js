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

  // Update the filterProductsBySeason function to be more robust
  const filterProductsBySeason = (products, season) => {
    const seasonMonths = RWANDA_SEASONS[season].months;
    return products.filter(product => {
      if (!product.createdAt) return false;
      
      try {
        const productDate = new Date(product.createdAt);
        const productMonth = productDate.getMonth();
        const isInSeason = seasonMonths.includes(productMonth);
        console.log(`Product ${product.id}: Month ${productMonth}, Season ${season}, IsInSeason: ${isInSeason}`);
        return isInSeason;
      } catch (error) {
        console.error(`Error processing date for product ${product.id}:`, error);
        return false;
      }
    });
  };

  // Update the useEffect for trending and featured products
  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        setLoading(prev => ({
          ...prev,
          trending: true,
          available: true
        }));

        // Fetch trending products with better error handling
        try {
          console.log('Fetching trending products...');
        const trendingResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/v1/product/trending`
          );
          console.log('Raw trending response:', trendingResponse);
          
          if (trendingResponse.data.success) {
            const trendingProducts = trendingResponse.data.data;
            console.log('Processed trending products:', trendingProducts);
            
            setData(prev => ({
              ...prev,
              trending: trendingProducts
            }));
          } else {
            console.warn('Trending response was not successful:', trendingResponse.data);
            setData(prev => ({
              ...prev,
              trending: []
            }));
          }
        } catch (trendingError) {
          console.error("Error fetching trending products:", trendingError);
          console.error("Error details:", {
            message: trendingError.message,
            response: trendingError.response?.data
          });
          
          // Set empty trending products but don't show error toast
          setData(prev => ({
            ...prev,
            trending: []
          }));
        }

        // Fetch featured products
        try {
          console.log('Fetching featured products...');
          const featuredResponse = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/v1/product/featured`
          );
          console.log('Featured Response:', featuredResponse.data);

          if (featuredResponse.data.success) {
            const featuredProducts = featuredResponse.data.data;
            console.log('Processed featured products:', featuredProducts);
            
            setData(prev => ({
              ...prev,
              available: featuredProducts
            }));
          } else {
            console.warn('Featured response was not successful:', featuredResponse.data);
            setData(prev => ({
              ...prev,
              available: []
            }));
          }
        } catch (featuredError) {
          console.error("Error fetching featured products:", featuredError);
          toast.error("Failed to load featured products");
          setData(prev => ({
            ...prev,
            available: []
          }));
        }

      } catch (error) {
        console.error("General error in fetchOtherProducts:", error);
      } finally {
        setLoading(prev => ({
          ...prev,
          trending: false,
          available: false
        }));
      }
    };

    fetchOtherProducts();
  }, []);

  // Update the seasonal products useEffect
  useEffect(() => {
    const fetchSeasonalData = async () => {
      try {
        setLoading(prev => ({
          ...prev,
          seasonal: true
        }));
        
        // Fetch seasonal products directly from the backend
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/v1/product/seasonal/${selectedSeason}`
        );
        console.log('Seasonal products response:', response.data);

        if (response.data.success) {
          const seasonalProducts = response.data.data;
          console.log('Seasonal products with sellers:', seasonalProducts);

          setData(prev => ({
            ...prev,
            seasonal: seasonalProducts
          }));
        }
      } catch (error) {
        console.error("Error fetching seasonal data:", error);
        toast.error("Failed to load seasonal products");
      } finally {
        setLoading(prev => ({
          ...prev,
          seasonal: false
        }));
      }
    };

    fetchSeasonalData();
  }, [selectedSeason]);

  // Add a useEffect to log when season changes
  useEffect(() => {
    console.log('Selected season changed to:', selectedSeason);
    console.log('Season months:', RWANDA_SEASONS[selectedSeason].months);
  }, [selectedSeason]);

  // 1. Update section headings and descriptions
  const sections = {
    trending: {
      title: "Trending Products",
      subtitle: "Our most popular and frequently ordered items"
    },
    seasonal: {
      title: "Seasonal Selections",
      subtitle: `Best floriculture products for ${RWANDA_SEASONS[selectedSeason]?.label}`
    },
    available: {
      title: "Featured Collection",
      subtitle: "Discover our hidden gems and unique offerings"
    }
  };

  // 2. Update season styling in SeasonalNav
  const SeasonalNav = () => (
    <div className="seasonal-nav">
      <div className="d-flex flex-column mb-4">
        <div className="d-flex align-items-center gap-3 mb-2">
          <h2 className="text-success fw-bold mb-0">{sections.seasonal.title}</h2>
          <span className="section-badge">
            {getSeasonIcon(selectedSeason)} {selectedSeason}
          </span>
        </div>
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
            <div className="season-content">
              <span className="season-icon">{data.icon}</span>
              <div className="season-text">
                <span className="season-name">{season}</span>
                <span className="season-period">{data.label.split('(')[1].replace(')', '')}</span>
              </div>
            </div>
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
      icon: ''
    },
  ];

  // Render loading state
  const renderLoading = (section) => (
    <div className="text-center py-4">
      <Spinner animation="border" variant="success" />
      <p>Loading {section}...</p>
    </div>
  );

  // Update the renderSellerInfo function to handle the user object structure
  const renderSellerInfo = (product) => {
    if (!product.user) {
      console.log('Missing user data for product:', product.id);
      return 'Seller information unavailable';
    }
    return `${product.user.firstname} ${product.user.lastname}`;
  };

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
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h2 className="text-success fw-bold mb-0">{sections.trending.title}</h2>
                  <span className="section-badge">
                    {getSeasonIcon(getCurrentSeason())} Trending
                  </span>
                </div>
                <p className="text-muted">{sections.trending.subtitle}</p>
              </div>
              {loading.trending ? (
                renderLoading("trending products")
              ) : data.trending.length > 0 ? (
              <div className="row g-4">
                  {data.trending.map((product) => (
                  <div key={product.id} className="col-md-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="card-img-container">
                          <img 
                            src={product.image?.startsWith('http') 
                              ? product.image 
                              : `${process.env.REACT_APP_BASE_URL}${product.image}`
                            }
                            alt={product.name || 'Product Image'}
                            className="card-img-top product-img"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        </div>
                        <Card.Body className="text-center d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="product-name mb-3">{product.name}</Card.Title>
                            <Card.Text className="product-description mb-4">
                              {product.description || RWANDA_SEASONS[product.season]?.description}
                            </Card.Text>
                            <div className="info-container mt-auto">
                              <div className="info-item">
                                <span className="info-label">Price</span>
                                <span className="info-value price">RWF {product.price?.toLocaleString()}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Stock</span>
                                <span className="info-value">
                                  {product.quantity} units
                                </span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Seller</span>
                                <span className="info-value seller">
                                  {product.user ? 
                                    `${product.user.firstname} ${product.user.lastname}` : 
                                    'Seller information unavailable'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="success" 
                            className="rounded-pill px-4 mt-4"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View Details
                          </Button>
                        </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No trending products available at the moment.</p>
                </div>
              )}
            </section>

            {/* Seasonal Section */}
            <section className="bg-light p-4 rounded mb-4">
              <SeasonalNav />
              <div className="seasonal-products-container">
                {loading.seasonal ? renderLoading("seasonal products") : (
                <div className="row g-4">
                    {data.seasonal.map((product) => (
                      <div key={product.id} className="col-md-3">
                      <Card className="h-100 border-0 shadow-sm hover-card">
                        <div className="card-img-container">
                          <img 
                            src={product.image?.startsWith('http') 
                              ? product.image 
                              : `${process.env.REACT_APP_BASE_URL}${product.image}`
                            }
                            alt={product.name || 'Product Image'}
                            className="card-img-top product-img"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        </div>
                        <Card.Body className="text-center d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="product-name mb-3">{product.name}</Card.Title>
                            <Card.Text className="product-description mb-4">
                              {product.description || RWANDA_SEASONS[selectedSeason]?.description}
                            </Card.Text>
                            <div className="info-container mt-auto">
                              <div className="info-item">
                                <span className="info-label">Price</span>
                                <span className="info-value price">RWF {product.price?.toLocaleString()}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Stock</span>
                                <span className="info-value">
                                  {product.quantity} units
                                </span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Seller</span>
                                <span className="info-value seller">
                                  {product.user ? 
                                    `${product.user.firstname} ${product.user.lastname}` : 
                                    'Seller information unavailable'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="success" 
                            className="rounded-pill px-4 mt-4"
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
              </div>
            </section>

            {/* Available Products Section */}
            <section className="bg-light p-4 rounded mb-4">
              <div className="d-flex flex-column mb-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h2 className="text-success fw-bold mb-0">{sections.available.title}</h2>
                  <span className="section-badge">
                    {getSeasonIcon(getCurrentSeason())} Featured
                  </span>
                </div>
                <p className="text-muted">{sections.available.subtitle}</p>
              </div>
              {loading.available ? renderLoading("available products") : (
              <div className="row g-4">
                  {data.available.map((product) => (
                  <div key={product.id} className="col-md-4">
                    <Card className="h-100 border-0 shadow-sm hover-card">
                      <div className="card-img-container">
                          <img 
                            src={product.image?.startsWith('http') 
                              ? product.image 
                              : `${process.env.REACT_APP_BASE_URL}${product.image}`
                            }
                            alt={product.name || 'Product Image'}
                            className="card-img-top product-img"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        </div>
                        <Card.Body className="text-center d-flex flex-column justify-content-between">
                          <div>
                            <Card.Title className="product-name mb-3">{product.name}</Card.Title>
                            <Card.Text className="product-description mb-4">
                              {product.description || RWANDA_SEASONS[product.season]?.description}
                            </Card.Text>
                            <div className="info-container mt-auto">
                              <div className="info-item">
                                <span className="info-label">Price</span>
                                <span className="info-value price">RWF {product.price?.toLocaleString()}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Stock</span>
                                <span className="info-value">
                                  {product.quantity} units
                                </span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Seller</span>
                                <span className="info-value seller">
                                  {product.user ? 
                                    `${product.user.firstname} ${product.user.lastname}` : 
                                    'Seller information unavailable'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="success" 
                            className="rounded-pill px-4 mt-4"
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

        /* Modern Card Styles */
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px;
          overflow: hidden;
          height: 520px;
          background: white;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Image Container Styles */
        .card-img-container, 
        .seasonal-img-container, 
        .available-img-container {
          position: relative;
          height: 220px;
          background: linear-gradient(45deg, #15803d, #84cc16);
          overflow: hidden;
          border-bottom: 4px solid rgba(21, 128, 61, 0.1);
        }
        
        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-card:hover .product-img {
          transform: scale(1.08);
        }

        /* Product Information Styles */
        .product-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a365d;
          line-height: 1.4;
          margin-bottom: 1rem;
          min-height: 2.8rem;
          max-height: 3.6rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-description {
          font-size: 0.95rem;
          color: #4a5568;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          min-height: 3rem;
          max-height: 4.5rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        /* Info Container Styles */
        .info-container {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
          margin: 1.5rem 0;
          border: 1px solid rgba(21, 128, 61, 0.1);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(21, 128, 61, 0.1);
        }

        .info-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .info-value.price {
          color: #15803d;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .info-value.in-stock {
          color: #15803d;
          font-weight: 600;
        }

        .info-value.out-of-stock {
          color: #dc2626;
          font-weight: 600;
        }

        .info-value.seller {
          color: #1e40af;
          font-weight: 500;
          font-style: normal;
        }

        /* Button Styles */
        .btn-success,
        .btn-outline-success {
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          border-radius: 25px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .btn-success {
          background-color: #15803d;
          border-color: #15803d;
          box-shadow: 0 2px 4px rgba(21, 128, 61, 0.2);
        }

        .btn-success:hover {
          background-color: #166534;
          border-color: #166534;
          box-shadow: 0 4px 6px rgba(21, 128, 61, 0.3);
          transform: translateY(-2px);
        }

        .btn-outline-success {
          color: #15803d;
          border: 2px solid #15803d;
          background-color: transparent;
        }

        .btn-outline-success:hover {
          background-color: #15803d;
          border-color: #15803d;
          color: white;
          transform: translateY(-2px);
        }

        /* Section Badge Styles */
        .section-badge {
          background: linear-gradient(45deg, #15803d, #16a34a);
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 25px;
          font-size: 0.95rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(21, 128, 61, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
        }

        .section-badge svg {
          font-size: 1.2rem;
        }

        /* Updated Season Navigation Styles */
        .season-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          min-height: 80px;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background: ${props => props.variant === "success" ? 'linear-gradient(45deg, #15803d, #16a34a)' : 'white'};
        }

        .season-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .season-icon {
          font-size: 1.6rem;
          display: flex;
          align-items: center;
        }

        .season-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }

        .season-name {
          font-weight: 600;
          font-size: 1rem;
          color: inherit;
          display: block;
          text-align: left;
        }

        .season-period {
          font-size: 0.85rem;
          opacity: 0.9;
          display: block;
          text-align: left;
        }

        .season-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(21, 128, 61, 0.1);
        }

        .season-button.btn-success .season-name,
        .season-button.btn-success .season-period {
          color: white;
        }

        .season-button.btn-outline-success .season-name {
          color: #15803d;
        }

        .season-button.btn-outline-success .season-period {
          color: #64748b;
        }

        .season-button.btn-outline-success:hover .season-name,
        .season-button.btn-outline-success:hover .season-period {
          color: white;
        }

        .season-buttons-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          width: 100%;
        }

        @media (max-width: 992px) {
          .season-buttons-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .season-buttons-container {
            grid-template-columns: 1fr;
          }
        }

        /* Section Styles */
        section.bg-light {
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(21, 128, 61, 0.1);
        }

        /* Loading State Styles */
        .text-center.py-4 {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
          border-width: 0.25rem;
          color: #15803d;
        }

        /* Seasonal Section Specific Styles */
        .seasonal-products-container {
          margin-top: 2rem;
        }

        /* Consistent Card Styles Across All Sections */
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px;
          overflow: hidden;
          height: 520px;
          background: white;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .card-img-container, 
        .seasonal-img-container, 
        .available-img-container {
          position: relative;
          height: 220px;
          background: linear-gradient(45deg, #15803d, #84cc16);
          overflow: hidden;
          border-bottom: 4px solid rgba(21, 128, 61, 0.1);
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a365d;
          line-height: 1.4;
          margin-bottom: 1rem;
          min-height: 2.8rem;
          max-height: 3.6rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .product-description {
          font-size: 0.95rem;
          color: #4a5568;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          min-height: 3rem;
          max-height: 4.5rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .info-container {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 1rem;
          margin: 1.5rem 0;
          border: 1px solid rgba(21, 128, 61, 0.1);
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(21, 128, 61, 0.1);
        }

        .info-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        /* Consistent Button Styles */
        .btn-success,
        .btn-outline-success {
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          border-radius: 25px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          font-size: 0.9rem;
          width: 100%;
          max-width: 200px;
          margin: 0 auto;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .hover-card {
            height: auto;
            min-height: 520px;
          }

          .product-name {
            min-height: auto;
          }

          .product-description {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;