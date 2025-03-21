import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/SearchSuggestions.css';

const SearchSuggestions = ({ searchTerm, onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchTerm || searchTerm.length < 1) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/api/v1/product/approved`
                );

                if (response.data.success) {
                    // Filter products that start with the search term
                    const allMatchingProducts = response.data.data.filter(product => 
                        product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
                    ).sort((a, b) => {
                        const aName = a.name.toLowerCase();
                        const bName = b.name.toLowerCase();
                        return aName.localeCompare(bName);
                    });

                    // Set suggestions to first 10 products
                    setSuggestions(allMatchingProducts.slice(0, 10));
                    setTotalResults(allMatchingProducts.length);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setTotalResults(0);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleProductClick = (product) => {
        if (onSelect) onSelect();
        
        // Navigate to search results with the product name as the search query
        navigate(`/search?q=${encodeURIComponent(product.name)}`);
    };

    if (!searchTerm) return null;

    return (
        <div className="search-suggestions" onClick={e => e.stopPropagation()}>
            <div className="suggestions-header">
                <h3 className="suggestions-title">
                    {loading ? 'Searching...' : `Products starting with "${searchTerm}"`}
                </h3>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    Loading suggestions...
                </div>
            ) : suggestions.length === 0 ? (
                <div className="no-results">
                    No products found starting with "{searchTerm}"
                </div>
            ) : (
                <>
                    <div className="suggestions-grid">
                        {suggestions.map((product) => (
                            <div
                                key={product.id}
                                className="suggestion-item"
                                onClick={() => handleProductClick(product)}
                            >
                                <img 
                                    src={product.image.startsWith('http') ? 
                                        product.image : 
                                        `${process.env.REACT_APP_BASE_URL}${product.image}`
                                    }
                                    alt={product.name} 
                                    className="suggestion-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                    }}
                                />
                                <div className="suggestion-info">
                                    <div className="suggestion-name">{product.name}</div>
                                    <div className="suggestion-price">
                                        ${product.price?.toFixed(2)}
                                    </div>
                                    <div className="suggestion-seller">
                                        <span>By: {product.firstname} {product.lastname}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {suggestions.length > 0 && (
                        <div 
                            className="view-all"
                            onClick={() => {
                                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                                if (onSelect) onSelect();
                            }}
                        >
                            View all {totalResults} {totalResults === 1 ? 'product' : 'products'}
                            {totalResults > 10 && ' (showing first 10)'}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchSuggestions; 