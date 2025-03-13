"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reports extends Model {
    static associate(models) {
      Reports.belongsTo(models.Products, { foreignKey: "productID", as: "product" });
      Reports.belongsTo(models.Users, { foreignKey: "userID", as: "user" });
    }
  }

  Reports.init(
    {
      // Product Performance Metrics
      productID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      avgDailySales: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      salesTrends: {
        type: DataTypes.JSON, // Store historical sales data
      },
      forecastData: {
        type: DataTypes.JSON, // Store prediction data
      },

      // Sales Metrics
      dailyRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      monthlyRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      yearlyRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      salesGrowth: {
        type: DataTypes.DECIMAL(5, 2), // Percentage
        defaultValue: 0,
      },

      // Seasonal Metrics
      seasonalMetrics: {
        type: DataTypes.JSON,
      },
      weatherImpact: {
        type: DataTypes.JSON,
      },
      peakSeasons: {
        type: DataTypes.JSON,
      },
      productTrends: {
        type: DataTypes.JSON,
      },
      inventoryOptimization: {
        type: DataTypes.JSON,
      },

      // Stock Metrics
      perishabilityRisk: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Low',
      },
      daysUntilStockout: {
        type: DataTypes.INTEGER,
      },
      riskDistribution: {
        type: DataTypes.JSON,
      },

      // User Activity Metrics
      userID: {
        type: DataTypes.INTEGER,
      },
      lastActive: {
        type: DataTypes.DATE,
      },
      activityMetrics: {
        type: DataTypes.JSON,
      },
      engagementScore: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },

      // Common fields
      reportType: {
        type: DataTypes.ENUM(
          'product_performance',
          'sales',
          'seasonal',
          'stock',
          'user_activity'
        ),
        allowNull: false,
      },
      reportDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      sequelize,
      modelName: "Reports",
      indexes: [
        {
          fields: ['reportType', 'reportDate'],
        },
        {
          fields: ['productID'],
        },
        {
          fields: ['userID'],
        }
      ]
    }
  );

  return Reports;
};