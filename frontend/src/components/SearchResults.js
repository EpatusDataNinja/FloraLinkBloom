import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTag, FaBox, FaUser, FaFilter, FaShoppingCart, FaCartPlus, FaPhone, FaDollarSign, FaTimes } from 'react-icons/fa';
import { Modal, Button, Card, Form, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SearchResults.css';
import GuestCartModal from '../components_part/GuestCartModal';

const SellerProductsModal = ({ seller, onClose, onAddToCart, showGuestCartModal }) => {
    const isAuthenticated = localStorage.getItem("token");
    const [orderData, setOrderData] = useState({ quantity: 1, phone: "" });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showApprovalPopup, setShowApprovalPopup] = useState(false);
    const navigate = useNavigate();
    const [showCartValidationModal, setShowCartValidationModal] = useState(false);
    const [cartValidationMessage, setCartValidationMessage] = useState('');
    const [cartAction, setCartAction] = useState(null);

    const handleOrderClick = (product) => {
        setSelectedProduct(product);
        setOrderData({ quantity: 1, phone: "" });
        setShowOrderModal(true);
    };

    const handleOrderSubmit = async () => {
        if (!orderData.quantity || !orderData.phone) {
            toast.error("Please enter quantity and phone number!");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/v1/order/add`,
                {
                    productID: selectedProduct.id,
                    quantity: orderData.quantity,
                    number: orderData.phone,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Order placed successfully!");
            setShowOrderModal(false);
            setShowApprovalPopup(true);

            setTimeout(() => {
                setShowApprovalPopup(false);
                toast.success("Payment Approved! Congratulations!");
            }, 5000);

        } catch (error) {
            toast.error("Failed to place order!");
        } finally {
            setLoading(false);
        }
    };

    const handleCartValidation = async (product) => {
        const token = localStorage.getItem("token");
        
        try {
            if (token) {
                // For authenticated users, fetch latest product data
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const currentProduct = response.data.data.find(p => p.id === product.id);
                if (!currentProduct) {
                    toast.error("Product is no longer available");
                    return false;
                }

                if (currentProduct.quantity <= 0) {
                    toast.error("Product is out of stock");
                    return false;
                }

                // Check existing cart
                const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
                if (existingCart.length > 0) {
                    const currentSellerId = existingCart[0].sellerId;
                    if (product.userID !== currentSellerId) {
                        setCartValidationMessage(
                            <div>
                                <h5>Different Seller Warning</h5>
                                <p>Your cart contains items from a different seller.</p>
                                <p>Current cart seller: <strong>{existingCart[0].sellerName}</strong></p>
                                <p>Would you like to:</p>
                                <ul>
                                    <li>Clear your current cart and add this item</li>
                                    <li>Keep your current cart and cancel this action</li>
                                </ul>
                            </div>
                        );
                        setCartAction(() => () => {
                            localStorage.setItem("cart", "[]");
                            onAddToCart(product);
                        });
                        setShowCartValidationModal(true);
                        return false;
                    }
                }

                const existingItem = existingCart.find(item => item.id === product.id);
                if (existingItem) {
                    setCartValidationMessage(
                        <div>
                            <h5>Product Already in Cart</h5>
                            <p>This product is already in your cart.</p>
                            <p>Current quantity: {existingItem.quantity}</p>
                            <p>Would you like to view your cart?</p>
                        </div>
                    );
                    setCartAction(() => () => navigate('/cart'));
                    setShowCartValidationModal(true);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error("Error validating cart:", error);
            toast.error("Error validating cart. Please try again.");
            return false;
        }
    };

    const handleAddToCart = async (product) => {
        const isValid = await handleCartValidation(product);
        if (isValid) {
            onAddToCart(product);
        }
    };

    if (!seller) return null;

    return (
        <>
            <Modal show={true} onHide={onClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <div className="d-flex align-items-center">
                            <div className="seller-avatar me-3">
                                {seller.image ? (
                                    <img 
                                        src={seller.image.startsWith('http') ? seller.image : `${process.env.REACT_APP_BASE_URL}${seller.image}`}
                                        alt={seller.name}
                                        className="rounded-circle"
                                        style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            objectFit: 'cover',
                                            border: '2px solid #15803d',
                                            backgroundColor: 'white'
                                        }}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/50?text=Seller';
                                        }}
                                    />
                                ) : (
                                    <div 
                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                        style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            border: '2px solid #15803d' 
                                        }}
                                    >
                                        <FaUser size={24} className="text-success" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h5 className="mb-0">{seller.name}</h5>
                                <small className="text-muted">
                                    {seller.products?.length || 0} products
                                </small>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-5 justify-content-center">
                        {seller.products?.map((product) => (
                            <div key={product.id} className="col-lg-4 col-md-6 col-sm-6 mb-4">
                                {isAuthenticated ? (
                                    <Card className="modal-product-card">
                                        <div className="modal-product-image">
                                            <Card.Img 
                                                variant="top" 
                                                src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <Card.Body>
                                            <Card.Title className="product-title">{product.name}</Card.Title>
                                            <Card.Text className="product-description">{product.description}</Card.Text>
                                            <Card.Text className="text-success fw-bold">${product.price?.toFixed(2)}</Card.Text>
                                            <Card.Text>Stock: {product.quantity}</Card.Text>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    className="flex-grow-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOrderClick(product);
                                                    }}
                                                >
                                                    <FaShoppingCart /> Order Now
                                                </Button>
                                                <Button 
                                                    variant="success"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(product);
                                                    }}
                                                    disabled={product.quantity <= 0}
                                                >
                                                    <FaCartPlus />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                ) : (
                                    <Card className="modal-product-card">
                                        <div className="modal-product-image">
                                            <Card.Img 
                                                variant="top" 
                                                src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                        </div>
                                        <Card.Body>
                                            <Card.Title className="product-title">{product.name}</Card.Title>
                                            <Card.Text className="product-description">{product.description}</Card.Text>
                                            <Card.Text className="text-success fw-bold">${product.price?.toFixed(2)}</Card.Text>
                                            <Card.Text>Stock: {product.quantity}</Card.Text>
                                            <Button 
                                                variant="success"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                disabled={product.quantity <= 0}
                                                className="w-100"
                                            >
                                                Add to Cart
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Order Modal */}
            {showOrderModal && selectedProduct && (
                <Modal show={true} onHide={() => setShowOrderModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Order {selectedProduct?.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label><FaBox className="text-warning" /> Quantity</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    min="1" 
                                    max={selectedProduct?.quantity} 
                                    value={orderData.quantity} 
                                    onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })} 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label><FaPhone className="text-primary" /> Phone Number</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter your phone number" 
                                    value={orderData.phone} 
                                    onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })} 
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label><FaDollarSign className="text-success" /> Total Amount</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    value={`$${(orderData.quantity * selectedProduct?.price).toFixed(2)}`} 
                                    readOnly 
                                />
                            </Form.Group>
                            <Button 
                                variant="success" 
                                onClick={handleOrderSubmit} 
                                className="w-100" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Order"
                                )}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            {/* Approval Popup */}
            {showApprovalPopup && (
                <Modal show={true} centered>
                    <Modal.Body className="text-center">
                        <h5>Please check your phone to approve the payment!</h5>
                    </Modal.Body>
                </Modal>
            )}

            {/* Cart Validation Modal */}
            <Modal 
                show={showCartValidationModal} 
                onHide={() => setShowCartValidationModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Cart Action Required</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cartValidationMessage}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowCartValidationModal(false)}
                    >
                        Cancel
                    </Button>
                    {cartAction && (
                        <Button 
                            variant="success" 
                            onClick={() => {
                                cartAction();
                                setShowCartValidationModal(false);
                            }}
                        >
                            Proceed
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [showGuestCartModal, setShowGuestCartModal] = useState(false);
    
    // Add this state for tooltip visibility
    const [showTooltip, setShowTooltip] = useState(true);

    const searchQuery = searchParams.get('q');
    const categoryFilter = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const handleClose = () => {
        navigate(-1);
    };

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // First fetch products
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`
                );

                if (response.data.success) {
                    // Filter products that start with the search query
                    const filteredResults = response.data.data.filter(product => {
                        const matchesSearch = product.name.toLowerCase().startsWith(searchQuery.toLowerCase());
                        const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
                        const matchesMinPrice = !minPrice || product.price >= parseFloat(minPrice);
                        const matchesMaxPrice = !maxPrice || product.price <= parseFloat(maxPrice);
                        
                        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
                    });

                    setResults(filteredResults);
                    
                    // Try to fetch categories only if user is authenticated
                    try {
                        const token = localStorage.getItem('token');
                        if (token) {
                            const categoriesResponse = await axios.get(
                                `${process.env.REACT_APP_BASE_URL}/api/v1/categories`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            );
                            if (categoriesResponse.data.success) {
                                setCategories(categoriesResponse.data.data || []);
                            }
                        }
                    } catch (categoryError) {
                        console.log('Categories fetch failed:', categoryError);
                        // Don't set error state for category fetch failure
                    }
                }
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch search results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchQuery, categoryFilter, minPrice, maxPrice]);

    useEffect(() => {
        // Hide tooltip after 5 seconds
        const timer = setTimeout(() => {
            setShowTooltip(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleProductClick = (product) => {
        // Get all products from the same seller
        const sellerProducts = results.filter(p => p.userID === product.userID);
        
        // Prepare seller data
        const sellerData = {
            id: product.userID,
            name: `${product.firstname} ${product.lastname}`,
            image: product.userImage,
            products: sellerProducts
        };
        
        setSelectedSeller(sellerData);
        setShowModal(true);
    };

    const addToGuestCart = async (product) => {
        const isAuthenticated = localStorage.getItem("token");
        const cartKey = isAuthenticated ? "cart" : "guestCart";
        
        try {
            // First validate product availability with server
            const response = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`
            );
            
            const currentProduct = response.data.data.find(p => p.id === product.id);
            if (!currentProduct) {
                toast.error(
                    <div>
                        <h6>Product Unavailable</h6>
                        <p>This product is no longer available.</p>
                    </div>,
                    { autoClose: 5000 }
                );
                return;
            }

            if (currentProduct.quantity <= 0) {
                toast.error(
                    <div>
                        <h6>Out of Stock</h6>
                        <p>Sorry, this product is currently out of stock.</p>
                    </div>,
                    { autoClose: 5000 }
                );
                return;
            }

            const existingCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
            
            // Check for mixed sellers
            if (existingCart.length > 0) {
                const currentSellerId = existingCart[0].sellerId;
                const currentSellerName = existingCart[0].sellerName;

                if (product.userID !== currentSellerId) {
                    toast.error(
                        <div>
                            <h6 className="mb-2">Cannot Mix Sellers in Cart</h6>
                            <p>Your cart has items from: <strong>{currentSellerName}</strong></p>
                            <p>Please either:</p>
                            <ul className="mb-0">
                                <li>Complete your current cart</li>
                                <li>Clear your cart to add items from a different seller</li>
                            </ul>
                            <div className="mt-3">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => {
                                        localStorage.setItem(cartKey, "[]");
                                        addToGuestCart(product); // Retry adding after clearing
                                    }}
                                >
                                    Clear Cart
                                </Button>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => isAuthenticated ? navigate('/cart') : setShowGuestCartModal(true)}
                                >
                                    View Cart
                                </Button>
                            </div>
                        </div>,
                        {
                            autoClose: false,
                            position: "top-center",
                            style: { backgroundColor: '#fff3cd', color: '#664d03' }
                        }
                    );
                    return;
                }
            }

            // Check for existing product
            const existingProduct = existingCart.find(item => item.id === product.id);
            if (existingProduct) {
                toast.info(
                    <div>
                        <h6 className="mb-2">Product Already in Cart</h6>
                        <p>Current quantity: {existingProduct.quantity}</p>
                        <p>Maximum available: {currentProduct.quantity}</p>
                        <Button 
                            variant="success"
                            size="sm"
                            className="w-100"
                            onClick={() => isAuthenticated ? navigate('/cart') : setShowGuestCartModal(true)}
                        >
                            View Cart
                        </Button>
                    </div>,
                    {
                        autoClose: 8000,
                        position: "top-center",
                        style: { backgroundColor: '#cff4fc', color: '#055160' }
                    }
                );
                return;
            }

            // Add to cart with updated product data
            const cartItem = {
                id: product.id,
                name: product.name,
                price: currentProduct.price,
                image: product.image,
                quantity: 1,
                availableQuantity: currentProduct.quantity,
                sellerId: product.userID,
                sellerName: `${product.firstname} ${product.lastname}`.trim()
            };

            localStorage.setItem(cartKey, JSON.stringify([...existingCart, cartItem]));
            
            toast.success(
                <div>
                    <h6 className="mb-2">{product.name} added to cart!</h6>
                    <small>Go to cart to adjust quantity if needed.</small>
                    <Button 
                        variant="success"
                        size="sm"
                        className="w-100 mt-2"
                        onClick={() => isAuthenticated ? navigate('/cart') : setShowGuestCartModal(true)}
                    >
                        View Cart
                    </Button>
                </div>,
                {
                    position: "top-right",
                    autoClose: 3000,
                    style: { backgroundColor: '#d1e7dd', color: '#0f5132' }
                }
            );

        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error(
                <div>
                    <h6>Error Adding to Cart</h6>
                    <p>Please try again or contact support if the problem persists.</p>
                </div>,
                { autoClose: 5000 }
            );
        }
    };

    if (loading) return <div className="search-loading">Loading...</div>;
    if (error) return <div className="search-error">{error}</div>;

    return (
        <div className="search-results-container">
            <button 
                className="search-close-button" 
                onClick={handleClose}
                aria-label="Close search results"
            >
                <FaTimes />
            </button>

            {/* Add the user guide tooltip */}
            {showTooltip && (
                <div className="user-guide-tooltip">
                    <div className="tooltip-content">
                        <FaCartPlus className="tooltip-icon" />
                        Click any product to view details and add to cart
                    </div>
                </div>
            )}

            {categories.length > 0 && (
                <div className="search-filters">
                    <h3><FaFilter className="filter-icon" /> Filters</h3>
                    <div className="category-filter">
                        <label>Category</label>
                        <select 
                            value={categoryFilter || ''}
                            onChange={(e) => {
                                const newParams = new URLSearchParams(searchParams);
                                if (e.target.value) {
                                    newParams.set('category', e.target.value);
                                } else {
                                    newParams.delete('category');
                                }
                                navigate(`/search?${newParams.toString()}`);
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="price-filter">
                        <label>Price Range</label>
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={minPrice || ''}
                            onChange={(e) => {
                                const newParams = new URLSearchParams(searchParams);
                                if (e.target.value) {
                                    newParams.set('minPrice', e.target.value);
                                } else {
                                    newParams.delete('minPrice');
                                }
                                navigate(`/search?${newParams.toString()}`);
                            }}
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={maxPrice || ''}
                            onChange={(e) => {
                                const newParams = new URLSearchParams(searchParams);
                                if (e.target.value) {
                                    newParams.set('maxPrice', e.target.value);
                                } else {
                                    newParams.delete('maxPrice');
                                }
                                navigate(`/search?${newParams.toString()}`);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="search-results">
                <h2>
                    Search Results for "{searchQuery}"
                    <span className="results-count">
                        {results.length} {results.length === 1 ? 'product' : 'products'}
                    </span>
                </h2>
                {results.length === 0 ? (
                    <p>No products found matching your search.</p>
                ) : (
                    <div className="results-grid">
                        {results.map((product) => (
                            <div 
                                key={product.id} 
                                className="product-card"
                                onClick={() => handleProductClick(product)}
                            >
                                <img 
                                    src={product.image.startsWith('http') ? product.image : `${process.env.REACT_APP_BASE_URL}${product.image}`}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/140x140?text=No+Image';
                                    }}
                                />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="price">
                                        <FaTag className="icon" />
                                        ${product.price?.toFixed(2)}
                                    </p>
                                    <p className="stock">
                                        <FaBox className="icon" />
                                        Stock: {product.quantity}
                                    </p>
                                    {product.category && (
                                        <p className="category">
                                            Category: {product.category.name}
                                        </p>
                                    )}
                                    <p className="seller">
                                        <FaUser className="icon" />
                                        {product.firstname} {product.lastname}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && selectedSeller && (
                <SellerProductsModal
                    seller={selectedSeller}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedSeller(null);
                    }}
                    onAddToCart={addToGuestCart}
                    showGuestCartModal={setShowGuestCartModal}
                />
            )}

            {/* Guest Cart Modal */}
            <GuestCartModal 
                show={showGuestCartModal}
                onHide={() => setShowGuestCartModal(false)}
            />

            {/* Add ToastContainer here */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <style jsx="true">{`
                .search-close-button {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #ffffff;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transition: all 0.3s ease;
                }

                .search-close-button:hover {
                    background: #f8f9fa;
                    transform: scale(1.1);
                }

                .search-close-button svg {
                    color: #666;
                    font-size: 20px;
                }

                .search-close-button:hover svg {
                    color: #dc3545;
                }

                @media (max-width: 768px) {
                    .search-close-button {
                        top: 10px;
                        right: 10px;
                        width: 35px;
                        height: 35px;
                    }
                }

                .user-guide-tooltip {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;
                    animation: fadeInUp 0.5s ease-out;
                }

                .tooltip-content {
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                }

                .tooltip-icon {
                    color: #4ade80;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }

                .results-grid .product-card {
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    background: white;
                    border-radius: 8px;
                    overflow: visible;
                }

                .results-grid .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .results-grid .product-card::after {
                    content: "Click to view details";
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                    white-space: nowrap;
                    z-index: 1;
                }

                .results-grid .product-card:hover::after {
                    opacity: 1;
                }

                @media (max-width: 768px) {
                    .user-guide-tooltip {
                        bottom: 10px;
                        width: 90%;
                    }

                    .tooltip-content {
                        font-size: 13px;
                        padding: 10px 20px;
                        text-align: center;
                    }

                    .results-grid .product-card::after {
                        bottom: -25px;
                        font-size: 11px;
                    }
                }

                .modal-product-card {
                    height: 100%;
                    max-width: 340px;
                    margin: 0 auto;
                    background-color: #f0f7f0;
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    border-radius: 8px;
                    overflow: hidden;
                    border: none;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .modal-product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
                }

                .modal-product-image {
                    position: relative;
                    width: 100%;
                    height: 200px;
                    overflow: hidden;
                    background-color: #f8f9fa;
                }

                .modal-product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .modal-product-card:hover .modal-product-image img {
                    transform: scale(1.05);
                }

                .product-title {
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                    color: #15803d;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .product-description {
                    font-size: 0.9rem;
                    color: #666;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }

                .row.g-5 {
                    --bs-gutter-x: 3rem;
                    --bs-gutter-y: 3rem;
                    margin-right: calc(var(--bs-gutter-x) * -.5);
                    margin-left: calc(var(--bs-gutter-x) * -.5);
                    padding: 1rem;
                }
            `}</style>
        </div>
    );
};

export default SearchResults; 