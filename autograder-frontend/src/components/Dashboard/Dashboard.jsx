import React, { useEffect } from 'react';
import { FaQuestionCircle, FaBell, FaEnvelope } from 'react-icons/fa';
import Chart from 'chart.js/auto';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  // Simulated data for quick stats
  const quickStats = {
    scannedCopies: 1234,
    correctedExams: 567,
    // Add more stats as needed
  };

  // Simulated recent notifications/messages
  const recentNotifications = [
    { id: 1, text: 'New exam added for Physics' },
    { id: 2, text: 'Reminder: Staff meeting tomorrow' },
    // Add more notifications/messages as needed
  ];

  useEffect(() => {
    // Simulated recent student performance data for chart
    const studentPerformanceData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average Score',
          data: [75, 80, 85, 78, 82, 79],
          borderColor: '#1f81a9',
          backgroundColor: '#a3c5d9',
        },
      ],
    };

    // Initialize chart using Chart.js
    const ctx = document.getElementById('performanceChart');
    let performanceChart = null;

    if (ctx) {
      performanceChart = new Chart(ctx, {
        type: 'line',
        data: studentPerformanceData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 100,
              grid: {
                display: true,
                color: '#e5e7eb',
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    // Clean up function to destroy chart when component unmounts
    return () => {
      if (performanceChart) {
        performanceChart.destroy();
      }
    };
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 pl-64 bg-[#f3fbfa]"> 
        <h2 className="text-2xl font-semibold mb-4">Aperçu</h2>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Copies uploadées</h3>
              <p className="text-3xl font-bold text-gray-900">{quickStats.scannedCopies}</p>
            </div>
            <FaEnvelope className="text-4xl text-[#1f81a9]" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Examens corrigés</h3>
              <p className="text-3xl font-bold text-gray-900">{quickStats.correctedExams}</p>
            </div>
            <FaQuestionCircle className="text-4xl text-[#1f81a9]" />
          </div>
          {/* Add more quick stats boxes as needed */}
        </div>

        {/* Notifications */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Notifications récentes</h2>
          <ul className="space-y-2">
            {recentNotifications.map((notification) => (
              <li key={notification.id} className="flex items-start">
                <FaBell className="text-[#1f81a9] mt-1 mr-2" />
                <p className="text-sm text-gray-700">{notification.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Performance des étudiants</h2>
          <div className="h-72">
            <canvas id="performanceChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
