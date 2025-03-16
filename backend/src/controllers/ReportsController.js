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
    
    // Build date range for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Fetch orders with related data for the entire year
    const orders = await Orders.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Products,
          as: 'product',
          include: [
            {
              model: Categories,
              as: 'category'
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Initialize monthly data
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      totalSales: 0,
      orderCount: 0,
      products: {},
      categories: {}
    }));

    // Process orders
    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      const totalAmount = parseFloat(order.totalAmount) || 0;
      
      // Update monthly totals
      monthlyData[month].totalSales += totalAmount;
      monthlyData[month].orderCount += 1;

      // Track product performance
      if (order.product) {
        const productId = order.product.id;
        if (!monthlyData[month].products[productId]) {
          monthlyData[month].products[productId] = {
            name: order.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        monthlyData[month].products[productId].quantity += order.quantity;
        monthlyData[month].products[productId].revenue += totalAmount;

        // Track category performance
        if (order.product.category) {
          const categoryId = order.product.category.id;
          if (!monthlyData[month].categories[categoryId]) {
            monthlyData[month].categories[categoryId] = {
              name: order.product.category.name,
              quantity: 0,
              revenue: 0
            };
          }
          monthlyData[month].categories[categoryId].quantity += order.quantity;
          monthlyData[month].categories[categoryId].revenue += totalAmount;
        }
      }
    });

    // Calculate seasonal metrics
    const seasons = {
      spring: monthlyData.slice(2, 5),   // March to May
      summer: monthlyData.slice(5, 8),   // June to August
      autumn: monthlyData.slice(8, 11),  // September to November
      winter: [...monthlyData.slice(11), ...monthlyData.slice(0, 2)] // December to February
    };

    const seasonalMetrics = {};
    Object.entries(seasons).forEach(([season, months]) => {
      seasonalMetrics[season] = {
        totalSales: months.reduce((sum, month) => sum + month.totalSales, 0),
        orderCount: months.reduce((sum, month) => sum + month.orderCount, 0),
        averageOrderValue: 0,
        topProducts: [],
        topCategories: []
      };

      // Calculate average order value
      if (seasonalMetrics[season].orderCount > 0) {
        seasonalMetrics[season].averageOrderValue = 
          seasonalMetrics[season].totalSales / seasonalMetrics[season].orderCount;
      }

      // Aggregate product data for the season
      const productData = {};
      months.forEach(month => {
        Object.entries(month.products).forEach(([productId, data]) => {
          if (!productData[productId]) {
            productData[productId] = { ...data, quantity: 0, revenue: 0 };
          }
          productData[productId].quantity += data.quantity;
          productData[productId].revenue += data.revenue;
        });
      });

      // Get top products
      seasonalMetrics[season].topProducts = Object.entries(productData)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([_, data]) => data);

      // Similar aggregation for categories
      const categoryData = {};
      months.forEach(month => {
        Object.entries(month.categories).forEach(([categoryId, data]) => {
          if (!categoryData[categoryId]) {
            categoryData[categoryId] = { ...data, quantity: 0, revenue: 0 };
          }
          categoryData[categoryId].quantity += data.quantity;
          categoryData[categoryId].revenue += data.revenue;
        });
      });

      seasonalMetrics[season].topCategories = Object.entries(categoryData)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([_, data]) => data);
    });

    return res.status(200).json({
      success: true,
      data: {
        year,
        monthlyData,
        seasonalMetrics,
        summary: {
          totalSales: monthlyData.reduce((sum, month) => sum + month.totalSales, 0),
          totalOrders: monthlyData.reduce((sum, month) => sum + month.orderCount, 0),
          averageOrderValue: monthlyData.reduce((sum, month) => sum + month.totalSales, 0) / 
                           monthlyData.reduce((sum, month) => sum + month.orderCount, 0) || 0
        }
      }
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all products with their categories and recent orders
    const products = await Products.findAll({
      include: [
        {
          model: Categories,
          as: 'category',
          attributes: ['name']
        },
        {
          model: Orders,
          as: 'orders',
          where: {
            createdAt: {
              [Op.gte]: thirtyDaysAgo
            }
          },
          attributes: ['quantity', 'createdAt', 'status'],
          required: false // LEFT JOIN to include products with no orders
        }
      ],
      where: {
        status: 'In Stock' // Only include active products
      }
    });

    // Process products and calculate metrics
    const stockMetrics = products.map(product => {
      // Calculate sales metrics
      const completedOrders = (product.orders || []).filter(order => order.status === 'completed');
      const totalSold = completedOrders.reduce((sum, order) => sum + order.quantity, 0);
      const avgDailySales = totalSold / 30; // Average over 30 days
      const daysUntilStockout = avgDailySales > 0 ? 
        Math.floor(product.quantity / avgDailySales) : 
        (product.quantity > 0 ? null : 0);

      // Determine risk level
      let perishabilityRisk;
      if (product.quantity <= 0) {
        perishabilityRisk = 'High';
      } else if (daysUntilStockout === null || daysUntilStockout > threshold * 2) {
        perishabilityRisk = avgDailySales === 0 ? 'Medium' : 'Low';
      } else if (daysUntilStockout <= threshold) {
        perishabilityRisk = 'High';
      } else {
        perishabilityRisk = 'Medium';
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        currentStock: product.quantity,
        avgDailySales: parseFloat(avgDailySales.toFixed(2)),
        daysUntilStockout,
        perishabilityRisk,
        lastUpdated: product.updatedAt
      };
    });

    // Calculate summary statistics
    const summary = {
      highRisk: stockMetrics.filter(p => p.perishabilityRisk === 'High').length,
      mediumRisk: stockMetrics.filter(p => p.perishabilityRisk === 'Medium').length,
      lowRisk: stockMetrics.filter(p => p.perishabilityRisk === 'Low').length,
      totalProducts: stockMetrics.length,
      averageStock: stockMetrics.length > 0 ? 
        Math.round(stockMetrics.reduce((sum, p) => sum + p.currentStock, 0) / stockMetrics.length) : 
        0
    };

    // Sort metrics by risk level and stock status
    const sortedMetrics = stockMetrics.sort((a, b) => {
      const riskOrder = { High: 3, Medium: 2, Low: 1 };
      const riskCompare = riskOrder[b.perishabilityRisk] - riskOrder[a.perishabilityRisk];
      
      if (riskCompare === 0) {
        // If same risk level, sort by days until stockout (null values last)
        if (a.daysUntilStockout === null && b.daysUntilStockout === null) return 0;
        if (a.daysUntilStockout === null) return 1;
        if (b.daysUntilStockout === null) return -1;
        return a.daysUntilStockout - b.daysUntilStockout;
      }
      
      return riskCompare;
    });

    return res.status(200).json({
      success: true,
      data: {
        summary,
        stockMetrics: sortedMetrics,
        metadata: {
          generatedAt: new Date(),
          threshold,
          daysAnalyzed: 30
        }
      }
    });

  } catch (error) {
    console.error('Error generating stock perishability report:', error);
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

export const generateStockReport = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    // Get all products with their categories and recent orders
    const products = await Products.findAll({
      include: [
        {
          model: Categories,
          as: 'category',
          attributes: ['name']
        },
        {
          model: Orders,
          as: 'orders',
          attributes: ['quantity', 'createdAt'],
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          required: false
        }
      ]
    });

    // Calculate metrics for each product
    const stockMetrics = products.map(product => {
      const orders = product.orders || [];
      const totalSold = orders.reduce((sum, order) => sum + order.quantity, 0);
      const avgDailySales = totalSold / 30; // Based on 30 days
      const daysUntilStockout = avgDailySales > 0 ? Math.floor(product.quantity / avgDailySales) : null;
      
      // Determine risk level
      let perishabilityRisk;
      if (daysUntilStockout === null || daysUntilStockout > threshold * 2) {
        perishabilityRisk = 'Low';
      } else if (daysUntilStockout <= threshold) {
        perishabilityRisk = 'High';
      } else {
        perishabilityRisk = 'Medium';
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        currentStock: product.quantity,
        avgDailySales: parseFloat(avgDailySales.toFixed(2)),
        daysUntilStockout,
        perishabilityRisk,
        lastUpdated: product.updatedAt
      };
    });

    // Calculate summary statistics
    const summary = {
      highRisk: stockMetrics.filter(p => p.perishabilityRisk === 'High').length,
      mediumRisk: stockMetrics.filter(p => p.perishabilityRisk === 'Medium').length,
      lowRisk: stockMetrics.filter(p => p.perishabilityRisk === 'Low').length,
      totalProducts: stockMetrics.length,
      averageStock: Math.round(
        stockMetrics.reduce((sum, p) => sum + p.currentStock, 0) / stockMetrics.length
      )
    };

    return res.status(200).json({
      success: true,
      data: {
        summary,
        stockMetrics: stockMetrics.sort((a, b) => {
          // Sort by risk level (High > Medium > Low)
          const riskOrder = { High: 3, Medium: 2, Low: 1 };
          return riskOrder[b.perishabilityRisk] - riskOrder[a.perishabilityRisk];
        })
      }
    });

  } catch (error) {
    console.error('Error generating stock report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate stock report',
      error: error.message
    });
  }
};