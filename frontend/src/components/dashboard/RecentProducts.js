import React from 'react';
import { Card } from 'react-bootstrap';
import { FaBoxOpen } from 'react-icons/fa';

const RecentProducts = ({ products, baseUrl }) => (
  <Card className="dashboard-card h-100">
    <Card.Body>
      <h5 className="card-title">
        <FaBoxOpen className="me-2" />
        Recently Viewed Products
      </h5>
      <div className="recent-products">
        {products?.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className="recent-product-item">
              <img 
                src={`${baseUrl}${product.image}`}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h6>{product.name}</h6>
                <p className="text-success mb-0">${product.price}</p>
              </div>
              <div className="product-status">
                <FaBoxOpen className="me-1" />
                {product.quantity} in stock
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted text-center mb-0">No recently viewed products</p>
        )}
      </div>
    </Card.Body>
  </Card>
);

export default RecentProducts;
