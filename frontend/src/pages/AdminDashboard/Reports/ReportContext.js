import React, { createContext, useContext, useState } from 'react';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [globalStats, setGlobalStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    lastUpdate: null
  });

  const updateGlobalStats = (newStats) => {
    setGlobalStats(prev => ({
      ...prev,
      ...newStats,
      lastUpdate: new Date()
    }));
  };

  return (
    <ReportContext.Provider value={{ globalStats, updateGlobalStats }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReportContext = () => useContext(ReportContext); 