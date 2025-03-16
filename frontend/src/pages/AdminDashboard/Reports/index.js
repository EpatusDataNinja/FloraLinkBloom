import UserActivityReport from './UserActivityReport';
import ReportLayout from './ReportLayout';
import SalesReport from './SalesReport';
import ProductPerformanceReport from './ProductPerformanceReport';
import SeasonalTrendsReport from './SeasonalTrendsReport';
import StockPerishabilityReport from './StockPerishabilityReport';

// Add debug logging
console.log('index.js - StockPerishabilityReport imported:', StockPerishabilityReport);

// Export all components
export {
    UserActivityReport,
    ReportLayout,
    SalesReport,
    ProductPerformanceReport,
    SeasonalTrendsReport,
    StockPerishabilityReport
};

// Also provide default export
export default {
    UserActivityReport,
    ReportLayout,
    SalesReport,
    ProductPerformanceReport,
    SeasonalTrendsReport,
    StockPerishabilityReport
};

