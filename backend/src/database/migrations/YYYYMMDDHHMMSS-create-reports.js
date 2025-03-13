'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('Reports', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },

        // Foreign Keys
        productID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        userID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },

        // Product Performance Metrics
        avgDailySales: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        salesTrends: {
          type: Sequelize.JSON,
          defaultValue: null
        },
        forecastData: {
          type: Sequelize.JSON,
          defaultValue: null
        },

        // Sales Metrics
        dailyRevenue: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        monthlyRevenue: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        yearlyRevenue: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        salesGrowth: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0
        },

        // Seasonal Metrics
        seasonalMetrics: {
          type: Sequelize.JSON,
          defaultValue: null
        },
        weatherImpact: {
          type: Sequelize.JSON,
          defaultValue: null
        },
        peakSeasons: {
          type: Sequelize.JSON,
          defaultValue: null
        },
        productTrends: {
          type: Sequelize.JSON,
          defaultValue: null
        },
        inventoryOptimization: {
          type: Sequelize.JSON,
          defaultValue: null
        },

        // Stock Metrics
        perishabilityRisk: {
          type: Sequelize.ENUM('Low', 'Medium', 'High'),
          defaultValue: 'Low'
        },
        daysUntilStockout: {
          type: Sequelize.INTEGER,
          defaultValue: null
        },
        riskDistribution: {
          type: Sequelize.JSON,
          defaultValue: null
        },

        // User Activity Metrics
        lastActive: {
          type: Sequelize.DATE,
          defaultValue: null
        },
        activityMetrics: {
          type: Sequelize.JSON,
          defaultValue: null
        },
        engagementScore: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0
        },

        // Common fields
        reportType: {
          type: Sequelize.ENUM(
            'product_performance',
            'sales',
            'seasonal',
            'stock',
            'user_activity'
          ),
          allowNull: false
        },
        reportDate: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },

        // Timestamps
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });

      // Add indexes safely
      const indexes = [
        ['Reports', ['reportType', 'reportDate']],
        ['Reports', ['productID']],
        ['Reports', ['userID']]
      ];

      for (const [tableName, fields] of indexes) {
        try {
          await queryInterface.addIndex(tableName, fields);
        } catch (error) {
          console.log(`Index might already exist for ${fields.join(', ')}`);
        }
      }

    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove indexes first
      const indexes = [
        ['Reports', ['reportType', 'reportDate']],
        ['Reports', ['productID']],
        ['Reports', ['userID']]
      ];

      for (const [tableName, fields] of indexes) {
        try {
          await queryInterface.removeIndex(tableName, fields);
        } catch (error) {
          console.log(`Index might not exist for ${fields.join(', ')}`);
        }
      }

      // Drop the ENUM type after dropping the table
      await queryInterface.dropTable('Reports');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Reports_reportType";');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Reports_perishabilityRisk";');

    } catch (error) {
      console.error('Migration Rollback Error:', error);
      throw error;
    }
  }
}; 