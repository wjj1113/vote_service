import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar as BarChart, Line as LineChart, Pie as PieChart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  pageViews: { page: string; _count: { page: number } }[];
  actionStats: { action: string; _count: { action: number } }[];
  hourlyActivity: { createdAt: Date; _count: { createdAt: number } }[];
  recentActivity: {
    id: string;
    page: string;
    action: string;
    elementId?: string;
    elementType?: string;
    createdAt: Date;
  }[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!data) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  // 페이지뷰 차트 데이터
  const pageViewsData = {
    labels: data.pageViews.map((pv) => pv.page),
    datasets: [
      {
        label: '페이지 방문자 수',
        data: data.pageViews.map((pv) => pv._count.page),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  // 액션 통계 차트 데이터
  const actionStatsData = {
    labels: data.actionStats.map((as) => as.action),
    datasets: [
      {
        data: data.actionStats.map((as) => as._count.action),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  // 시간대별 활동 차트 데이터
  const hourlyActivityData = {
    labels: data.hourlyActivity.map((ha) => 
      new Date(ha.createdAt).toLocaleTimeString()
    ),
    datasets: [
      {
        label: '시간대별 활동',
        data: data.hourlyActivity.map((ha) => ha._count.createdAt),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">사용자 활동 분석</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">페이지별 방문자 수</h2>
          <BarChart data={pageViewsData} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">사용자 액션 분포</h2>
          <PieChart data={actionStatsData} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">시간대별 활동</h2>
        <LineChart data={hourlyActivityData} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">최근 활동</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">시간</th>
                <th className="px-4 py-2">페이지</th>
                <th className="px-4 py-2">액션</th>
                <th className="px-4 py-2">요소</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-4 py-2">
                    {new Date(activity.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{activity.page}</td>
                  <td className="px-4 py-2">{activity.action}</td>
                  <td className="px-4 py-2">
                    {activity.elementType} {activity.elementId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 