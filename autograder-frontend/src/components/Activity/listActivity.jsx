import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import env from "react-dotenv";

function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const apiUrl = env.API_URL || "";

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/activities`);
        setActivities(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
    <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Suivi des Activités des Utilisateurs</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">Utilisateur</th>
              <th className="py-3 px-6 text-left">Action</th>
              <th className="py-3 px-6 text-left">Description</th>
              <th className="py-3 px-6 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {activities.length > 0 ? (
              activities.map(activity => (
                <tr key={activity._id} className="border-b border-gray-200">
                  <td className="py-3 px-6 text-left">{activity.userId}</td>
                  <td className="py-3 px-6 text-left">{activity.action}</td>
                  <td className="py-3 px-6 text-left">{activity.description}</td>
                  <td className="py-3 px-6 text-left">{new Date(activity.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-3 px-6 text-center text-gray-500">Aucune activité trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default AdminActivityPage;
