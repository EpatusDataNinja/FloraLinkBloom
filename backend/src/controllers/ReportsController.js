import db from "../database/models/index.js";
import ReportsService from "../services/ReportsService.js";
import { Op } from "sequelize";
const { Products, Orders, Categories, Users, Payments } = db;

// Basic report generators
export const generateSalesReport = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      limit: parseInt(req.query.limit) || 10,
      offset: parseInt(req.query.offset) || 0
    };

    // Build where clause based on filters
    const whereClause = {
      createdAt: {
        [Op.between]: [
          new Date(filters.startDate),
          new Date(filters.endDate + ' 23:59:59')
        ]
      }
    };

    // Add status filter if not 'all'
    if (filters.status && filters.status !== 'all') {
      whereClause.status = filters.status;
    }

    // Fetch orders with related data
    const orders = await Orders.findAll({
      where: whereClause,
      include: [
        {
          model: Users,
          as: 'buyer',
          attributes: ['firstname', 'lastname']
        },
        {
          model: Products,
          as: 'product',
          attributes: ['name', 'price']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit,
      offset: filters.offset
    });

    // Calculate summary statistics
    const totalOrders = await Orders.count({ where: whereClause });
    const totalRevenue = await Orders.sum('totalAmount', { where: whereClause }) || 0;
    const completedOrders = await Orders.count({
      where: {
        ...whereClause,
        status: 'delivered'
      }
    });

    // Format the response data
    const formattedOrders = orders.map(order => ({
      id: order.id,
      createdAt: order.createdAt,
      buyer: {
        firstname: order.buyer?.firstname || 'Unknown',
        lastname: order.buyer?.lastname || 'User'
      },
      product: {
        name: order.product?.name || 'Unknown Product'
      },
      quantity: parseInt(order.quantity) || 0,
      totalAmount: parseFloat(order.totalAmount) || 0,
      status: order.status
    }));

    const summary = {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue) || 0,
      averageOrderValue: totalOrders > 0 ? parseFloat(totalRevenue) / totalOrders : 0,
      completedOrders
    };

    return res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        summary
      }
    });
  } catch (error) {
    console.error('Error in generateSalesReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

export const generateProductPerformanceReport = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryId: req.query.categoryId
    };

    // Build where clause for date filtering
    const whereClause = {
      createdAt: {
        [Op.between]: [
          new Date(filters.startDate),
          new Date(filters.endDate + ' 23:59:59')
        ]
      }
    };

    if (filters.categoryId && filters.categoryId !== 'all') {
      whereClause.categoryID = filters.categoryId;
    }

    // Fetch products with related data
    const products = await Products.findAll({
      where: whereClause,
      include: [
        {
          model: Categories,
          as: 'category',
          attributes: ['name']
        },
        {
          model: Users,
          as: 'user',
          attributes: ['firstname', 'lastname']
        },
        {
          model: Orders,
          as: 'orders',
          attributes: ['quantity', 'totalAmount', 'status', 'createdAt']
        }
      ]
    });

    // Process and format product data
    const formattedProducts = await Promise.all(products.map(async (product) => {
      const orders = product.orders || [];
      const totalOrders = orders.length;
      const totalQuantitySold = orders.reduce((sum, order) => sum + (parseInt(order.quantity) || 0), 0);
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      const completedOrders = orders.filter(order => order.status === 'completed').length;

      return {
        id: product.id,
        name: product.name,
        category: {
          name: product.category?.name || 'Uncategorized'
        },
        user: {
          firstname: product.user?.firstname || 'Unknown',
          lastname: product.user?.lastname || 'Seller'
        },
        price: parseFloat(product.price) || 0,
        currentStock: parseInt(product.quantity) || 0,
        status: product.status,
        totalOrders,
        totalQuantitySold,
        totalRevenue,
        completedOrders,
        lastStockUpdate: product.updatedAt
      };
    }));

    // Calculate summary statistics
    const summary = formattedProducts.reduce((acc, product) => {
      acc.totalProducts += 1;
      acc.totalRevenue += product.totalRevenue;
      acc.totalQuantitySold += product.totalQuantitySold;
      acc.totalOrders += product.totalOrders;
      acc.completedOrders += product.completedOrders;
      return acc;
    }, {
      totalProducts: 0,
      totalRevenue: 0,
      totalQuantitySold: 0,
      totalOrders: 0,
      completedOrders: 0
    });

    // Calculate average order value
    summary.averageOrderValue = summary.totalOrders > 0 
      ? summary.totalRevenue / summary.totalOrders 
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        summary
      }
    });

  } catch (error) {
    console.error('Error in generateProductPerformanceReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate product performance report',
      error: error.message
    });
  }
};

export const generateSeasonalTrendsReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const data = await ReportsService.getSeasonalTrendsData(year);
    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error in generateSeasonalTrendsReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate seasonal trends report',
      error: error.message
    });
  }
};

export const generateStockPerishabilityReport = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const data = await ReportsService.getStockPerishabilityData(threshold);
    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error in generateStockPerishabilityReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate stock perishability report',
      error: error.message
    });
  }
};

export const generateUserActivityReport = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userRole: req.query.userRole,
      userId: req.query.userId
    };

    console.log('Generating user activity report with filters:', filters);

    const data = await ReportsService.getUserActivity(filters);
    
    // Calculate totals only for approved products
    const summary = {
      totalUsers: data.length,
      totalOrders: data.reduce((sum, user) => sum + user.ordersPlaced, 0),
      totalProducts: data.reduce((sum, user) => sum + user.productsListed, 0),
      totalSpent: data.reduce((sum, user) => sum + user.totalSpent, 0)
    };

    return res.status(200).json({
      success: true,
      data: data,
      summary: summary
    });
  } catch (error) {
    console.error('Error in generateUserActivityReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate user activity report',
      error: error.message
    });
  }
};

// Dashboard summary
export const generateDashboardSummary = async (req, res) => {
  try {
    const summary = await ReportsService.getDashboardSummary();
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error in generateDashboardSummary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard summary',
      error: error.message
    });
  }
};

// Export functionality
export const exportSalesReport = async (req, res) => {
  try {
    // Implementation pending
    return res.status(200).json({
      success: true,
      message: "Sales report export initiated",
      data: {}
    });
  } catch (error) {
    console.error('Error in exportSalesReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export sales report',
      error: error.message
    });
  }
};

export const exportProductReport = async (req, res) => {
  try {
    // Implementation pending
    return res.status(200).json({
      success: true,
      message: "Product report export initiated",
      data: {}
    });
  } catch (error) {
    console.error('Error in exportProductReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export product report',
      error: error.message
    });
  }
};

export const generateInventoryForecast = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get product data
    const product = await Products.findByPk(productId, {
      include: [
        {
          model: Orders,
          as: 'orders',
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
            }
          },
          required: false
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate basic forecast
    const orders = product.orders || [];
    const totalSales = orders.reduce((sum, order) => sum + order.quantity, 0);
    const avgDailySales = totalSales / 90; // Average daily sales over last 90 days
    
    const forecast = {
      productId: product.id,
      productName: product.name,
      currentStock: product.quantity,
      averageDailySales: avgDailySales,
      projectedStockout: product.quantity / (avgDailySales || 1),
      recommendations: [],
      predictions: [
        {
          period: '30 days',
          predictedSales: Math.round(avgDailySales * 30),
          confidenceLevel: 85,
          recommendedStock: Math.round(avgDailySales * 45) // 1.5 months stock
        },
        {
          period: '60 days',
          predictedSales: Math.round(avgDailySales * 60),
          confidenceLevel: 75,
          recommendedStock: Math.round(avgDailySales * 90) // 3 months stock
        }
      ]
    };

    // Add recommendations
    if (product.quantity < avgDailySales * 30) {
      forecast.recommendations.push('Stock levels are low. Consider restocking soon.');
    }
    if (avgDailySales === 0) {
      forecast.recommendations.push('No recent sales. Consider promotional activities.');
    }

    return res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error in generateInventoryForecast:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate inventory forecast',
      error: error.message
    });
  }
};

export const getRealtimeMetrics = async (req, res) => {
  try {
    const productIds = req.query.productIds.split(',').map(Number);
    
    // Get real-time metrics from the service
    const metrics = await ReportsService.getRealtimeMetrics(productIds);
    
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching realtime metrics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch realtime metrics',
      error: error.message
    });
  }
};