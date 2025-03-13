import db from "../database/models/index.js";
import { Op, Sequelize } from "sequelize";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, parseISO, format } from 'date-fns';

const { Orders, Products, Users, Categories, Payments, Reports } = db;

class ReportsService {
  static async getSalesReport(filters) {
    try {
      const whereClause = {};
      
      if (filters.startDate && filters.endDate) {
        whereClause.createdAt = {
          [Op.between]: [startOfDay(new Date(filters.startDate)), endOfDay(new Date(filters.endDate))]
        };
      }

      if (filters.status && filters.status !== 'all') {
        whereClause.status = filters.status;
      }

      const orders = await Orders.findAll({
        where: whereClause,
        include: [
          {
            model: Products,
            as: 'product',
            include: [{ model: Categories, as: 'category' }]
          },
          {
            model: Users,
            as: 'buyer',
            attributes: ['firstname', 'lastname', 'email']
          },
          {
            model: Payments,
            as: 'payments'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const summary = this.calculateSalesSummary(orders);

      return {
        orders,
        summary,
        filters
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }

  static calculateSalesSummary(orders) {
    const summary = {
      totalSales: 0,
      totalOrders: orders.length,
      averageOrderValue: 0,
      paymentMethods: {},
      statusBreakdown: {}
    };

    orders.forEach(order => {
      summary.totalSales += Number(order.totalAmount);
      
      // Status breakdown
      summary.statusBreakdown[order.status] = (summary.statusBreakdown[order.status] || 0) + 1;
      
      // Payment methods
      order.payments?.forEach(payment => {
        summary.paymentMethods[payment.paymentMethod] = 
          (summary.paymentMethods[payment.paymentMethod] || 0) + Number(payment.amount);
      });
    });

    summary.averageOrderValue = summary.totalOrders ? 
      summary.totalSales / summary.totalOrders : 0;

    return summary;
  }

  static async getProductPerformance(filters) {
    try {
      const whereClause = {};
      
      if (filters.categoryId && filters.categoryId !== 'all') {
        whereClause.categoryID = filters.categoryId;
      }

      const products = await Products.findAll({
        include: [
          {
            model: Orders,
            as: 'orders',
            where: filters.startDate && filters.endDate ? {
              createdAt: {
                [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
              }
            } : undefined,
            required: false
          },
          {
            model: Categories,
            as: 'category'
          },
          {
            model: Users,
            as: 'user',
            attributes: ['firstname', 'lastname']
          }
        ]
      });

      return products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category?.name,
        seller: `${product.user?.firstname} ${product.user?.lastname}`,
        totalOrders: product.orders?.length || 0,
        totalQuantitySold: product.orders?.reduce((sum, order) => sum + order.quantity, 0) || 0,
        totalRevenue: product.orders?.reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0,
        currentStock: product.quantity,
        averageOrderValue: product.orders?.length ? 
          (product.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0) / product.orders.length) : 0
      }));
    } catch (error) {
      console.error('Error generating product performance report:', error);
      throw error;
    }
  }

  static async getUserActivity(filters) {
    try {
      const whereClause = {};
      
      if (filters.startDate && filters.endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
        };
      }

      if (filters.userRole && filters.userRole !== 'all') {
        whereClause.role = filters.userRole;
      }

      if (filters.userId && filters.userId !== 'all') {
        whereClause.id = filters.userId;
      }

      const users = await Users.findAll({
        where: whereClause,
        include: [
          {
            model: Orders,
            as: 'orders',
            required: false,
            include: [
              {
                model: Products,
                as: 'product',
                where: { status: 'In Stock' },
                required: false
              }
            ]
          },
          {
            model: Products,
            as: 'Products',
            required: false,
            where: { status: 'In Stock' }
          }
        ],
        attributes: [
          'id',
          'firstname',
          'lastname',
          'email',
          'role',
          'createdAt',
          'updatedAt'
        ]
      });

      return users.map(user => {
        const validOrders = user.orders?.filter(order => order.product?.status === 'In Stock') || [];
        const validProducts = user.Products || [];

        return {
          id: user.id,
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          role: user.role,
          registrationDate: user.createdAt,
          ordersPlaced: validOrders.length,
          productsListed: validProducts.length,
          totalSpent: validOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
          lastActive: user.updatedAt,
          recentActivity: {
            orders: validOrders.slice(0, 5).map(order => ({
              id: order.id,
              date: order.createdAt,
              product: order.product?.name,
              amount: order.totalAmount
            })),
            products: validProducts.slice(0, 5).map(product => ({
              id: product.id,
              name: product.name,
              status: product.status
            }))
          }
        };
      });
    } catch (error) {
      console.error('Error in getUserActivity:', error);
      throw error;
    }
  }

  static async getSeasonalTrends(year) {
    try {
      const orders = await Orders.findAll({
        where: {
          createdAt: {
            [Op.between]: [
              new Date(`${year}-01-01`),
              new Date(`${year}-12-31`)
            ]
          },
          status: 'completed'
        },
        include: [
          {
            model: Products,
            as: 'product',
            include: [{ model: Categories, as: 'category' }]
          }
        ]
      });

      // Process monthly data
      const monthlyData = Array(12).fill(0).map(() => ({
        totalSales: 0,
        orderCount: 0,
        products: {}
      }));

      orders.forEach(order => {
        const month = new Date(order.createdAt).getMonth();
        monthlyData[month].totalSales += Number(order.totalAmount);
        monthlyData[month].orderCount++;

        const productKey = `${order.product.id}-${order.product.name}`;
        if (!monthlyData[month].products[productKey]) {
          monthlyData[month].products[productKey] = {
            name: order.product.name,
            category: order.product.category.name,
            sales: 0,
            quantity: 0
          };
        }
        monthlyData[month].products[productKey].sales += Number(order.totalAmount);
        monthlyData[month].products[productKey].quantity += order.quantity;
      });

      return {
        year,
        monthlyData: monthlyData.map((month, index) => ({
          month: index + 1,
          ...month,
          topProducts: Object.values(month.products)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
        }))
      };
    } catch (error) {
      console.error('Error generating seasonal trends report:', error);
      throw error;
    }
  }

  static async getStockPerishability(threshold) {
    const products = await Products.findAll({
      include: [
        {
          model: Categories,
          as: 'category'
        },
        {
          model: Users,
          as: 'user',
          attributes: ['firstname', 'lastname', 'email']
        },
        {
          model: Orders,
          as: 'orders',
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          required: false
        }
      ]
    });

    return this.processStockData(products, threshold);
  }

  static processSeasonalData(orders, year) {
    // Initialize monthly data
    const monthlyData = Array(12).fill(0).map(() => ({
      totalSales: 0,
      categorySales: {},
      topProducts: [],
      orderCount: 0
    }));

    // Process orders
    orders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      const category = order.product.category.name;
      const amount = Number(order.totalAmount);

      // Update monthly totals
      monthlyData[month].totalSales += amount;
      monthlyData[month].orderCount++;
      
      // Update category sales
      if (!monthlyData[month].categorySales[category]) {
        monthlyData[month].categorySales[category] = 0;
      }
      monthlyData[month].categorySales[category] += amount;

      // Track product performance
      monthlyData[month].topProducts.push({
        name: order.product.name,
        amount: amount,
        quantity: order.quantity,
        category: category
      });
    });

    // Process top products for each month
    monthlyData.forEach(month => {
      const productSummary = {};
      month.topProducts.forEach(product => {
        if (!productSummary[product.name]) {
          productSummary[product.name] = { ...product, count: 1 };
        } else {
          productSummary[product.name].amount += product.amount;
          productSummary[product.name].quantity += product.quantity;
          productSummary[product.name].count++;
        }
      });

      month.topProducts = Object.values(productSummary)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(product => ({
          ...product,
          averageOrderValue: product.amount / product.count
        }));
    });

    // Group by seasons
    const seasonalHighlights = {
      spring: monthlyData.slice(2, 5),   // March to May
      summer: monthlyData.slice(5, 8),   // June to August
      autumn: monthlyData.slice(8, 11),  // September to November
      winter: [...monthlyData.slice(0, 2), monthlyData[11]] // December to February
    };

    return {
      year,
      monthlyData,
      seasonalHighlights,
      yearSummary: {
        totalSales: monthlyData.reduce((sum, month) => sum + month.totalSales, 0),
        totalOrders: monthlyData.reduce((sum, month) => sum + month.orderCount, 0),
        averageOrderValue: monthlyData.reduce((sum, month) => sum + month.totalSales, 0) / 
                         monthlyData.reduce((sum, month) => sum + month.orderCount, 0)
      }
    };
  }

  static processStockData(products, threshold) {
    const stockMetrics = products.map(product => {
      const monthlyOrders = product.orders || [];
      const avgDailySales = monthlyOrders.reduce((sum, order) => 
        sum + order.quantity, 0) / 30;

      const daysUntilStockout = avgDailySales > 0 
        ? Math.round(product.quantity / avgDailySales)
        : null;

      // Determine perishability risk
      let perishabilityRisk = 'Low';
      if (product.quantity > threshold && avgDailySales < 1) {
        perishabilityRisk = 'High';
      } else if (product.quantity > threshold/2 && avgDailySales < 2) {
        perishabilityRisk = 'Medium';
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        seller: `${product.user.firstname} ${product.user.lastname}`,
        currentStock: product.quantity,
        avgDailySales: Number(avgDailySales.toFixed(2)),
        daysUntilStockout,
        perishabilityRisk,
        lastUpdated: product.updatedAt,
        sellerEmail: product.user.email,
        turnoverRate: avgDailySales > 0 ? (avgDailySales * 30 / product.quantity) : 0
      };
    });

    // Group by risk level
    const riskLevels = {
      high: stockMetrics.filter(p => p.perishabilityRisk === 'High'),
      medium: stockMetrics.filter(p => p.perishabilityRisk === 'Medium'),
      low: stockMetrics.filter(p => p.perishabilityRisk === 'Low')
    };

    return {
      stockMetrics,
      riskLevels,
      summary: {
        totalProducts: stockMetrics.length,
        lowStock: stockMetrics.filter(p => p.currentStock < threshold).length,
        highRisk: riskLevels.high.length,
        mediumRisk: riskLevels.medium.length,
        lowRisk: riskLevels.low.length,
        averageTurnoverRate: stockMetrics.reduce((sum, p) => sum + p.turnoverRate, 0) / stockMetrics.length
      }
    };
  }

  async updateProductPerformanceMetrics(productId) {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

      const salesMetrics = await Orders.findAll({
        where: {
          productID: productId,
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          },
          status: 'completed'
        },
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold'],
          [Sequelize.fn('AVG', Sequelize.col('quantity')), 'avgDailySales']
        ]
      });

      await Reports.upsert({
        productID: productId,
        reportType: 'product_performance',
        avgDailySales: salesMetrics[0].avgDailySales || 0,
        salesTrends: await this.calculateSalesTrends(productId),
        forecastData: await this.generateSalesForecast(productId),
        reportDate: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error updating product performance metrics:', error);
      throw error;
    }
  }

  // Product Performance Reports
  static async getProductPerformanceData(filters = {}) {
    try {
      console.log('Processing filters:', filters); // Debug log

      const whereClause = {};
      if (filters.categoryId && filters.categoryId !== 'all') {
        whereClause.categoryID = filters.categoryId;
      }

      // Add date range to the main query instead of the orders include
      const dateRange = filters.startDate && filters.endDate ? {
        createdAt: {
          [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
        }
      } : {};

      const products = await Products.findAll({
        where: whereClause,
        include: [
          {
            model: Orders,
            as: 'orders',
            required: false,
            where: {
              ...dateRange,
              status: 'completed'
            }
          },
          {
            model: Categories,
            as: 'category',
            required: false
          },
          {
            model: Users,
            as: 'user',
            required: false,
            attributes: ['firstname', 'lastname']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log(`Found ${products.length} products`); // Debug log

      return products;
    } catch (error) {
      console.error('Error in getProductPerformanceData:', error);
      throw new Error(`Failed to fetch product data: ${error.message}`);
    }
  }

  static calculateGrowth(sales, startDate, endDate) {
    if (!sales.length) return 0;
    
    const midPoint = new Date((new Date(startDate).getTime() + new Date(endDate).getTime()) / 2);
    const firstHalf = sales.filter(sale => new Date(sale.createdAt) < midPoint);
    const secondHalf = sales.filter(sale => new Date(sale.createdAt) >= midPoint);
    
    const firstHalfTotal = firstHalf.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const secondHalfTotal = secondHalf.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    
    if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 100 : 0;
    
    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal * 100).toFixed(2);
  }

  static calculateTrend(sales) {
    if (!sales.length) return 'stable';
    
    const sortedSales = [...sales].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstSale = sortedSales[0];
    const lastSale = sortedSales[sortedSales.length - 1];
    
    const trend = (lastSale.totalAmount - firstSale.totalAmount) / firstSale.totalAmount;
    
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
  }

  // Sales Reports
  static async getSalesData(filters = {}) {
    try {
      const { startDate, endDate, status, limit = 10, offset = 0 } = filters;
      
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      const orders = await Orders.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Products,
            as: 'product',
            include: [{ model: Categories, as: 'category' }]
          },
          {
            model: Users,
            as: 'buyer'
          },
          {
            model: Payments,
            as: 'payments'
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        total: orders.count,
        data: orders.rows.map(order => this.formatOrderData(order))
      };
    } catch (error) {
      console.error('Error in getSalesData:', error);
      throw error;
    }
  }

  // Seasonal Trends
  static async getSeasonalTrendsData(year) {
    try {
      const orders = await Orders.findAll({
        where: {
          createdAt: {
            [Op.between]: [
              new Date(`${year}-01-01`),
              new Date(`${year}-12-31`)
            ]
          },
          status: 'completed'
        },
        include: [
          {
            model: Products,
            as: 'product',
            include: [{ model: Categories, as: 'category' }]
          }
        ]
      });

      return this.processSeasonalData(orders, year);
    } catch (error) {
      console.error('Error in getSeasonalTrendsData:', error);
      throw error;
    }
  }

  // Stock Perishability
  static async getStockPerishabilityData(threshold = 10) {
    try {
      const products = await Products.findAll({
        include: [
          {
            model: Categories,
            as: 'category'
          },
          {
            model: Orders,
            as: 'orders',
            where: {
              createdAt: {
                [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            },
            required: false
          }
        ]
      });

      return this.processStockData(products, threshold);
    } catch (error) {
      console.error('Error in getStockPerishabilityData:', error);
      throw error;
    }
  }

  // Helper Methods
  static formatProductData(product) {
    const sales = product.orders || [];
    const totalSales = sales.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalQuantity = sales.reduce((sum, order) => sum + order.quantity, 0);

    return {
      id: product.id,
      name: product.name,
      category: product.category?.name,
      seller: `${product.user?.firstname} ${product.user?.lastname}`,
      totalSales,
      totalQuantity,
      averageOrderValue: sales.length ? totalSales / sales.length : 0,
      currentStock: product.quantity
    };
  }

  static formatOrderData(order) {
    return {
      id: order.id,
      date: order.createdAt,
      product: order.product?.name,
      category: order.product?.category?.name,
      buyer: `${order.buyer?.firstname} ${order.buyer?.lastname}`,
      quantity: order.quantity,
      amount: Number(order.totalAmount),
      status: order.status,
      payment: order.payments?.[0]?.status || 'pending'
    };
  }

  // Dashboard Summary
  static async getDashboardSummary() {
    try {
      const [totalSales, totalOrders, activeProducts] = await Promise.all([
        Orders.sum('totalAmount', { where: { status: 'completed' } }),
        Orders.count(),
        Products.count({ where: { status: 'In Stock' } })
      ]);

      return {
        totalSales: totalSales || 0,
        totalOrders,
        activeProducts,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      throw error;
    }
  }

  static async getCurrentStockLevels(productIds) {
    try {
      const products = await Products.findAll({
        where: {
          id: {
            [Op.in]: productIds
          }
        },
        attributes: ['id', 'quantity', 'updatedAt']
      });

      return products.reduce((acc, product) => {
        acc[product.id] = {
          quantity: product.quantity,
          updatedAt: product.updatedAt
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting current stock levels:', error);
      throw error;
    }
  }

  static async getRealtimeSalesData(productIds) {
    try {
      const recentSales = await Orders.findAll({
        where: {
          productID: {
            [Op.in]: productIds
          },
          status: 'completed',
          createdAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: [
          {
            model: Products,
            as: 'product'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return recentSales.reduce((acc, sale) => {
        if (!acc[sale.productID]) {
          acc[sale.productID] = {
            recentSales: [],
            lastSaleTime: null
          };
        }
        
        acc[sale.productID].recentSales.push({
          quantity: sale.quantity,
          amount: sale.totalAmount,
          timestamp: sale.createdAt
        });
        
        if (!acc[sale.productID].lastSaleTime || 
            sale.createdAt > acc[sale.productID].lastSaleTime) {
          acc[sale.productID].lastSaleTime = sale.createdAt;
        }
        
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting realtime sales data:', error);
      throw error;
    }
  }

  static async getRealtimeMetrics(productIds) {
    try {
      const currentTime = new Date();
      const oneDayAgo = new Date(currentTime - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(currentTime - 60 * 60 * 1000);

      const orders = await Orders.findAll({
        where: {
          productID: {
            [Op.in]: productIds
          },
          createdAt: {
            [Op.gte]: oneDayAgo
          },
          status: 'completed'
        },
        include: [
          {
            model: Products,
            as: 'product'
          }
        ]
      });

      // Process metrics for each product
      return productIds.reduce((acc, productId) => {
        const productOrders = orders.filter(o => o.productID === productId);
        const recentOrders = productOrders.filter(o => o.createdAt >= oneHourAgo);
        
        acc[productId] = {
          totalOrders: productOrders.length,
          newOrders: recentOrders.length,
          totalQuantitySold: productOrders.reduce((sum, o) => sum + o.quantity, 0),
          recentSales: recentOrders.reduce((sum, o) => sum + o.quantity, 0),
          totalRevenue: productOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
          recentRevenue: recentOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
          lastUpdate: currentTime
        };
        
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting realtime metrics:', error);
      throw error;
    }
  }
}

export default ReportsService; 