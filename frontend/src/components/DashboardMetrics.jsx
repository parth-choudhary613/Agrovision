import React, { useState, useEffect } from 'react';

const MetricCard = ({ title, value, subtitle, icon, bgColor }) => {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border border-gray-100 ${bgColor} 
                     transition-all hover:scale-105 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-5xl font-bold text-gray-900">{value}</p>
          <p className="text-xl font-semibold text-gray-800 mt-2">{title}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-6xl opacity-90">
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardMetrics = () => {
  const [stats, setStats] = useState({
    cropsScanned: 0,
    diseasesFound: 0,
    upcomingSprays: 0,
    treatmentsDone: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // or wherever you store JWT

        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Crops Scanned"
        value={stats.cropsScanned}
        subtitle="This Season"
        icon="🌱"
        bgColor="bg-emerald-50"
      />

      <MetricCard
        title="Diseases Found"
        value={stats.diseasesFound}
        subtitle="This Season"
        icon="🐛"
        bgColor="bg-amber-50"
      />

      <MetricCard
        title="Upcoming Sprays"
        value={stats.upcomingSprays}
        subtitle="Next 7 Days"
        icon="📅"
        bgColor="bg-blue-50"
      />

      <MetricCard
        title="Treatments Done"
        value={stats.treatmentsDone}
        subtitle="This Season"
        icon="🛡️"
        bgColor="bg-purple-50"
      />
    </div>
  );
};

export default DashboardMetrics;