import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const API_VERSION = process.env.REACT_APP_API_VERSION || 'v1';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  Accept: 'application/json',
});

class ReportService {
  async getStockReport(threshold) {
    try {
      if (!threshold || isNaN(threshold) || threshold < 1) {
        throw new Error('Invalid threshold value');
      }

      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/stock`,
        {
          headers: getAuthHeaders(),
          params: { threshold }
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const transformedData = {
        success: true,
        data: {
          highRiskCount: response.data.data.summary.highRisk,
          mediumRiskCount: response.data.data.summary.mediumRisk,
          lowRiskCount: response.data.data.summary.lowRisk,
          riskDistribution: {
            highRisk: response.data.data.summary.highRisk,
            mediumRisk: response.data.data.summary.mediumRisk,
            lowRisk: response.data.data.summary.lowRisk
          },
          items: response.data.data.stockMetrics.map(item => ({
            name: item.name,
            category: item.category,
            currentStock: item.currentStock,
            daysUntilStockout: item.daysUntilStockout,
            riskLevel: item.perishabilityRisk
          }))
        }
      };

      return transformedData;
    } catch (error) {
      console.error('Error in getStockReport:', error);
      if (error.response?.status === 404) {
        throw new Error('Report endpoint not found. Please check API configuration.');
      }
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch stock report',
        status: error.response?.status,
        error
      };
    }
  }

  // Enhanced error handling and response formatting
  async makeRequest(endpoint, params) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/${endpoint}`,
        {
          headers: getAuthHeaders(),
          params,
        }
      );
      console.log(`${endpoint} API Response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in ${endpoint}:`, error);
      throw {
        message: error.response?.data?.message || `Failed to fetch ${endpoint} report`,
        status: error.response?.status,
        error
      };
    }
  }

  // Simplified method calls using makeRequest
  async getSalesReport(filters) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/sales`,
        {
          headers: getAuthHeaders(),
          params: {
            startDate: filters.startDate,
            endDate: filters.endDate,
            status: filters.status,
            limit: filters.limit,
            offset: filters.offset
          }
        }
      );
      console.log('sales API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getSalesReport:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch sales report',
        status: error.response?.status,
        error
      };
    }
  }

  async getProductPerformance(filters) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/products`,
        {
          headers: getAuthHeaders(),
          params: filters
        }
      );
      console.log('Product performance API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getProductPerformance:', error);
      throw {
        message: error.response?.data?.message || 'Failed to fetch product performance report',
        status: error.response?.status,
        error
      };
    }
  }

  async getUserActivity(filters) {
    try {
      console.log('getUserActivity called with filters:', filters);
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/users`,
        {
          headers: getAuthHeaders(),
          params: filters
        }
      );
      console.log('getUserActivity response:', response);
      return response.data;
    } catch (error) {
      console.error('getUserActivity error:', error);
      throw {
        message: 'Failed to fetch users report',
        status: error.response?.status,
        error
      };
    }
  }

  async getSeasonalReport(year, season = 'all') {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/seasonal`,
        {
          headers: getAuthHeaders(),
          params: { year, season }
        }
      );
      console.log('Seasonal report response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getSeasonalReport:', error);
      throw error;
    }
  }

  async getStockPerishability(threshold) {
    return this.makeRequest('stock', { threshold });
  }

  // New methods to support enhanced reporting
  async getCategoryPerformance(categoryId, dateRange) {
    return this.makeRequest('category-performance', { categoryId, ...dateRange });
  }

  async getPaymentAnalytics(filters) {
    return this.makeRequest('payment-analytics', filters);
  }

  async getInventoryForecast(productId) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/inventory-forecast/${productId}`,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in getInventoryForecast:', error);
      throw {
        message: error.response?.data?.message || 'Failed to generate forecast',
        status: error.response?.status,
        error
      };
    }
  }

  async getRealtimeMetrics(productIds) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/${API_VERSION}/reports/realtime-metrics`,
        {
          headers: getAuthHeaders(),
          params: {
            productIds: productIds.join(',')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in getRealtimeMetrics:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

export const reportService = new ReportService();