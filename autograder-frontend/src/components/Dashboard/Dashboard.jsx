import React, { useEffect, useState, useRef } from 'react';
import { FaQuestionCircle, FaBell, FaEnvelope } from 'react-icons/fa';
import Chart from 'chart.js/auto';
import Sidebar from '../components/Sidebar';
import env from "react-dotenv";
import axios from 'axios';


const Dashboard = () => {
  // State pour les statistiques rapides
  const [quickStats, setQuickStats] = useState({
    scannedCopies: 0,  // Copies uploadées
    correctedExams: 0, // Copies corrigées
  });

  const apiUrl = env.API_URL || "";

  // State pour les notifications
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const chartRef = useRef(null); // Référence pour l'instance du graphique


  // Fonction pour récupérer les statistiques depuis l'API
  const fetchQuickStats = async () => {
    try {
      // Requête pour les copies uploadées
      const uploadedRes = await axios.get(`${apiUrl}/api/feuilles-reponses/count-uploaded-sheets`);
      const uploadedData = await uploadedRes.data;
      
      // Requête pour les copies corrigées
      const correctedRes = await axios.get(`${apiUrl}/api/feuilles-reponses/count-corrected-sheets`);
      const correctedData = await correctedRes.data;

      // Met à jour le state avec les nouvelles données
      setQuickStats({
        scannedCopies: uploadedData.count,
        correctedExams: correctedData.count,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques :', error);
    }
  };

// Récupérer les trois dernières activités depuis le backend
const fetchRecentActivities = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/activities/recent-activities`); 
    const data = await response.data;
    setRecentNotifications(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des activités récentes', error);
  }
};

  useEffect(() => {
    fetchQuickStats();
    fetchRecentActivities();

  }, []);

  useEffect(() => {
    // Fonction pour récupérer les performances semestrielles depuis le backend
    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/feuilles-reponses/performance/semester`); // Adaptez selon votre base URL
        const data = await response.data;
        setPerformanceData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des performances', error);
      }
    };

    fetchPerformanceData();
  }, []);

  useEffect(() => {
    // Crée ou met à jour le graphique seulement si les données sont disponibles
     if (performanceData && performanceData.length > 0) {
      const ctx = document.getElementById('performanceChart').getContext('2d');
      
      // Si un graphique existe déjà, le détruire avant d'en créer un nouveau
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Crée une nouvelle instance de Chart et la stocke dans chartRef
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: performanceData.map(item => `Semestre ${item._id.semester}-${item._id.year}`),
          datasets: [
            {
              label: 'Average Score',
              data: performanceData.map(item => item.averageScore),
              borderColor: '#1f81a9',
              backgroundColor: '#a3c5d9',
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 10,
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
        }
      });
    }
  }, [performanceData]);

  return (
    <div className="flex">
      <Sidebar />

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
              <h3 className="text-lg font-semibold text-gray-800">Copies corrigés</h3>
              <p className="text-3xl font-bold text-gray-900">{quickStats.correctedExams}</p>
            </div>
            <FaQuestionCircle className="text-4xl text-[#1f81a9]" />
          </div>
        </div>

         {/* Notifications */}
         <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Notifications récentes</h2>
          <ul className="space-y-2">
            {recentNotifications.map((activity, index) => (
              <li key={index} className="flex items-start">
                <FaBell className="text-[#1f81a9] mt-1 mr-2" />
                <p className="text-sm text-gray-700">{activity.action} par {activity.userId.name}</p>
              </li>
            ))}
          </ul>
        </div>

         {/* Performance Chart */}
         <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Performance des étudiants par semestre</h2>
          <div className="h-72">
            <canvas id="performanceChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
