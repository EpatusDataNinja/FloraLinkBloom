import React, { useEffect, useState } from "react";
import { Container, Table, Card, Row, Col, Pagination, Button } from "react-bootstrap";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Title from "../../components_part/TitleCard";
import { 
  FaLeaf, FaCalendarAlt, FaSeedling, FaChartLine, 
  FaClipboardList, FaFileExcel, FaDollarSign, FaExclamationTriangle,
  FaBoxOpen, FaShoppingCart, FaPercentage
} from "react-icons/fa";

const SalesReport = () => {
  const [salesData, setSalesData] = useState({
    summary: {
      totalSales: 0,
      totalEarnings: 0,
      totalRefundDeductions: 0,
      totalUnpaidOrders: 0,
      totalCompletedOrders: 0,
      averageOrderValue: 0,
      pendingPayments: 0
    },
    orderStats: {
      pending: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      refunded: 0
    },
    paymentStats: {
      totalPaid: 0,
      pendingPayments: 0,
      refundedAmount: 0
    },
    categoryPerformance: [],
    productPerformance: [],
    orderHistory: [],
    revenueTimeline: {
      daily: [],
      weekly: [],
      monthly: [],
      yearToDate: 0
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/v1/users/seller/sales-report`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "*/*",
        },
      });

      const data = response.data;
      const orders = data.report || [];

      // Calculate all metrics
      const orderStats = calculateOrderStatistics(orders);
      const paymentStats = calculatePaymentStatistics(orders);
      const productPerformance = calculateProductPerformance(orders);
      const timeMetrics = calculateTimeBasedMetrics(orders);
      const categoryStats = calculateCategoryPerformance(orders);

      setSalesData({
        summary: {
          totalSales: orders.length,
          totalEarnings: paymentStats.totalPaid,
          totalRefundDeductions: paymentStats.refundedAmount,
          totalUnpaidOrders: orderStats.pending,
          totalCompletedOrders: orderStats.completed,
          averageOrderValue: orders.length > 0 ? 
            paymentStats.totalPaid / orders.length : 0,
          pendingPayments: paymentStats.pendingPayments
        },
        orderStats,
        paymentStats,
        categoryPerformance: categoryStats,
        productPerformance,
        orderHistory: orders,
        revenueTimeline: timeMetrics
      });

    } catch (error) {
      console.error("Error fetching sales report:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrowthPercentage = (orders, categoryName) => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth - 1;
    
    const currentMonthOrders = orders.filter(order => 
      new Date(order.createdAt).getMonth() === currentMonth &&
      order.product?.category?.name === categoryName
    );
    
    const lastMonthOrders = orders.filter(order => 
      new Date(order.createdAt).getMonth() === lastMonth &&
      order.product?.category?.name === categoryName
    );

    const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const lastRevenue = lastMonthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    if (lastRevenue === 0) return currentRevenue > 0 ? 100 : 0;
    return ((currentRevenue - lastRevenue) / lastRevenue * 100).toFixed(2);
  };

  const getDailyRevenue = (orders, days) => {
    const dailyData = new Array(days).fill(0);
    const now = new Date();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      if (dayDiff < days) {
        dailyData[dayDiff] += parseFloat(order.totalAmount);
      }
    });
    
    return dailyData;
  };

  const getWeeklyRevenue = (orders, weeks) => {
    const weeklyData = new Array(weeks).fill(0);
    const now = new Date();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const weekDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24 * 7));
      if (weekDiff < weeks) {
        weeklyData[weekDiff] += parseFloat(order.totalAmount);
      }
    });
    
    return weeklyData;
  };

  const getMonthlyRevenue = (orders, months) => {
    const monthlyData = new Array(months).fill(0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();
      
      const monthDiff = (currentYear - orderYear) * 12 + (currentMonth - orderMonth);
      
      if (monthDiff < months) {
        monthlyData[monthDiff] += parseFloat(order.totalAmount);
      }
    });
    
    return monthlyData;
  };

  const calculateTimeBasedMetrics = (orders) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return {
      daily: getDailyRevenue(orders, 30),
      weekly: getWeeklyRevenue(orders, 12),
      monthly: getMonthlyRevenue(orders, 12),
      yearToDate: orders
        .filter(order => new Date(order.createdAt).getFullYear() === thisYear)
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
    };
  };

  const calculateOrderStatistics = (orders) => {
    return {
      pending: orders.filter(order => order.status === 'pending').length,
      paid: orders.filter(order => order.status === 'paid').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      completed: orders.filter(order => order.status === 'completed').length,
      refunded: orders.filter(order => order.status === 'refunded').length
    };
  };

  const calculatePaymentStatistics = (orders) => {
    return {
      totalPaid: orders.filter(order => order.status === 'paid' || order.status === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      pendingPayments: orders.filter(order => order.status === 'pending')
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      refundedAmount: orders.filter(order => order.status === 'refunded')
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0)
    };
  };

  const calculateProductPerformance = (orders) => {
    const productMap = new Map();
    
    orders.forEach(order => {
      if (!order.product) return;
      
      const productId = order.product.id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,
          name: order.product.name,
          totalSold: 0,
          revenue: 0,
          orders: 0
        });
      }
      
      const stats = productMap.get(productId);
      stats.totalSold += order.quantity;
      stats.revenue += parseFloat(order.totalAmount);
      stats.orders += 1;
    });
    
    return Array.from(productMap.values());
  };

  const calculateCategoryPerformance = (orders) => {
    const categoryMap = new Map();
    orders.forEach(order => {
      if (order.product && order.product.category) {
        const category = order.product.category.name;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category,
            itemsSold: 0,
            revenue: 0,
            orders: 0
          });
        }
        const stats = categoryMap.get(category);
        stats.itemsSold += order.quantity;
        stats.revenue += parseFloat(order.totalAmount);
        stats.orders += 1;
      }
    });
    return Array.from(categoryMap.values()).map(category => ({
      ...category,
      growth: calculateGrowthPercentage(orders, category.name)
    }));
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salesData.orderHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesData.orderHistory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Export functions
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(dataBlob, `${filename}.xlsx`);
  };

  const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
      return <div className="error-container">
        <h3>Something went wrong loading the sales report.</h3>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>;
    }

    return children;
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="content-wrapper">
      <Title title="Sales Analytics" />
      
      <div className="content-card">
        {/* Summary Cards */}
        <div className="stats-grid">
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon" style={{ backgroundColor: "#15803d20", color: "#15803d" }}>
                  <FaChartLine />
                </div>
                <div className="ms-3">
                  <h6 className="stat-title">Total Sales</h6>
                  <h3 className="stat-value" style={{ color: "#15803d" }}>
                    {salesData.summary.totalSales}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon" style={{ backgroundColor: "#0369a120", color: "#0369a1" }}>
                  <FaDollarSign />
                </div>
                <div className="ms-3">
                  <h6 className="stat-title">Total Earnings</h6>
                  <h3 className="stat-value" style={{ color: "#0369a1" }}>
                    Rwf{salesData.summary.totalEarnings}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon" style={{ backgroundColor: "#ca8a0420", color: "#ca8a04" }}>
                  <FaExclamationTriangle />
                </div>
                <div className="ms-3">
                  <h6 className="stat-title">Refund Deductions</h6>
                  <h3 className="stat-value" style={{ color: "#ca8a04" }}>
                    Rwf{salesData.summary.totalRefundDeductions}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon" style={{ backgroundColor: "#dc262620", color: "#dc2626" }}>
                  <FaClipboardList />
                </div>
                <div className="ms-3">
                  <h6 className="stat-title">Unpaid Orders</h6>
                  <h3 className="stat-value" style={{ color: "#dc2626" }}>
                    {salesData.summary.totalUnpaidOrders}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Category Performance */}
        <Row className="mt-4">
          <Col lg={12} className="mb-4">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">
                    <FaLeaf className="me-2" />
                    Sales by Category
                  </h5>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => exportToExcel(salesData.categoryPerformance, 'Category_Performance')}
                  >
                    <FaFileExcel className="me-2" />
                    Export
                  </Button>
                </div>
                <Table responsive className="align-middle">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Items Sold</th>
                      <th>Revenue</th>
                      <th>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.categoryPerformance.map((category, index) => (
                      <tr key={index}>
                        <td>{category.name}</td>
                        <td>{category.itemsSold}</td>
                        <td>Rwf{category.revenue}</td>
                        <td>
                          <span className={`text-${category.growth >= 0 ? 'success' : 'danger'}`}>
                            {category.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Order History Table */}
        <Card className="mt-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">
                <FaClipboardList className="me-2" />
                Recent Orders
              </h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => exportToExcel(salesData.orderHistory, 'Order_History')}
              >
                <FaFileExcel className="me-2" />
                Export Orders
              </Button>
            </div>
            
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((order, index) => (
                    <tr key={order.orderId}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{order.orderId}</td>
                      <td>{order.productName}</td>
                      <td>{order.quantity}</td>
                      <td>Rwf{order.totalAmount}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No sales data available</td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            <Pagination className="justify-content-center">
              <Pagination.Prev
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item 
                  key={index} 
                  active={index + 1 === currentPage} 
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Body>
        </Card>
      </div>

      <style jsx="true">{`
        .content-wrapper {
          padding: 20px;
          background: #f8f9fa;
        }

        .content-card {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 15px;
          }

          .content-card {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesReport;
