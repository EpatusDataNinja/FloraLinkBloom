import React from 'react';
import { Card } from 'react-bootstrap';
import { FaClipboardList, FaClock, FaTruck, FaCheckCircle } from 'react-icons/fa';

const RecentOrders = ({ orders }) => (
  <Card className="dashboard-card h-100">
    <Card.Body>
      <h5 className="card-title">
        <FaClipboardList className="me-2" />
        Recent Orders
      </h5>
      <div className="recent-orders">
        {orders?.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className="recent-order-item">
              <div className="order-icon">
                {order.status === 'pending' && <FaClock />}
                {order.status === 'shipped' && <FaTruck />}
                {order.status === 'delivered' && <FaCheckCircle />}
              </div>
              <div className="order-info">
                <h6>{order.product?.name}</h6>
                <p className="text-muted mb-0">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="order-status">
                <span className={`status-badge ${order.status}`}>
                  {order.status}
                </span>
                <div className="order-amount">
                  ${order.totalAmount}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted text-center mb-0">No recent orders</p>
        )}
      </div>
    </Card.Body>
  </Card>
);

export default RecentOrders;
