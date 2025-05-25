import React from 'react';
import DashboardChart from '../components/DashboardChart';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">실시간 대시보드</h1>
      <DashboardChart />
    </div>
  );
} 