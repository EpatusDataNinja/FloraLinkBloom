import React from 'react';
import { Card } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';

const DashboardChart = ({ title, data, labels, colors }) => {
  const chartData = {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors,
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Card className="chart-card">
      <Card.Body>
        <Card.Title className="chart-title">{title}</Card.Title>
        <div className="chart-container">
          <Pie data={chartData} options={options} />
        </div>
      </Card.Body>

      <style jsx="true">{`
        .chart-card {
          height: 100%;
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .chart-title {
          color: #2c3e50;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        .chart-container {
          height: 300px;
          position: relative;
        }
      `}</style>
    </Card>
  );
};

export default DashboardChart;