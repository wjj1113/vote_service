import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface VoteIntent {
  id: number;
  candidateId: number;
  ageGroup: string;
  region: string;
  gender: string;
  candidate: {
    id: number;
    name: string;
    party: string;
  };
}

export default function DashboardChart() {
  const [voteIntents, setVoteIntents] = useState<VoteIntent[]>([]);
  const [selectedChart, setSelectedChart] = useState<'age' | 'region' | 'gender' | 'trend'>('age');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => setVoteIntents(data));
  }, []);

  // 연령대별 투표 의향
  const ageData = {
    labels: ['10대', '20대', '30대', '40대', '50대', '60대 이상'],
    datasets: voteIntents.reduce((acc: any[], candidate) => {
      const existingDataset = acc.find(
        (dataset) => dataset.label === `${candidate.candidate.name} (${candidate.candidate.party})`
      );

      if (existingDataset) {
        const ageIndex = ageData.labels.indexOf(candidate.ageGroup);
        existingDataset.data[ageIndex]++;
      } else {
        acc.push({
          label: `${candidate.candidate.name} (${candidate.candidate.party})`,
          data: new Array(ageData.labels.length).fill(0),
          backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        });
      }

      return acc;
    }, []),
  };

  // 지역별 투표 의향
  const regionData = {
    labels: [
      '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산',
      '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
    ],
    datasets: voteIntents.reduce((acc: any[], candidate) => {
      const existingDataset = acc.find(
        (dataset) => dataset.label === `${candidate.candidate.name} (${candidate.candidate.party})`
      );

      if (existingDataset) {
        const regionIndex = regionData.labels.indexOf(candidate.region);
        existingDataset.data[regionIndex]++;
      } else {
        acc.push({
          label: `${candidate.candidate.name} (${candidate.candidate.party})`,
          data: new Array(regionData.labels.length).fill(0),
          backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        });
      }

      return acc;
    }, []),
  };

  // 성별 투표 의향
  const genderData = {
    labels: ['남성', '여성'],
    datasets: voteIntents.reduce((acc: any[], candidate) => {
      const existingDataset = acc.find(
        (dataset) => dataset.label === `${candidate.candidate.name} (${candidate.candidate.party})`
      );

      if (existingDataset) {
        const genderIndex = genderData.labels.indexOf(candidate.gender);
        existingDataset.data[genderIndex]++;
      } else {
        acc.push({
          label: `${candidate.candidate.name} (${candidate.candidate.party})`,
          data: new Array(genderData.labels.length).fill(0),
          backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        });
      }

      return acc;
    }, []),
  };

  // 시간대별 투표 의향 추이
  const trendData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}시`),
    datasets: voteIntents.reduce((acc: any[], candidate) => {
      const existingDataset = acc.find(
        (dataset) => dataset.label === `${candidate.candidate.name} (${candidate.candidate.party})`
      );

      if (existingDataset) {
        const hour = new Date().getHours();
        existingDataset.data[hour]++;
      } else {
        acc.push({
          label: `${candidate.candidate.name} (${candidate.candidate.party})`,
          data: new Array(24).fill(0),
          borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
          tension: 0.1,
        });
      }

      return acc;
    }, []),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '투표 의향 분석',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* 차트 선택 버튼 */}
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedChart('age')}
          className={`px-4 py-2 rounded-lg ${
            selectedChart === 'age'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          연령대별
        </button>
        <button
          onClick={() => setSelectedChart('region')}
          className={`px-4 py-2 rounded-lg ${
            selectedChart === 'region'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          지역별
        </button>
        <button
          onClick={() => setSelectedChart('gender')}
          className={`px-4 py-2 rounded-lg ${
            selectedChart === 'gender'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          성별
        </button>
        <button
          onClick={() => setSelectedChart('trend')}
          className={`px-4 py-2 rounded-lg ${
            selectedChart === 'trend'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          시간대별 추이
        </button>
      </div>

      {/* 차트 표시 */}
      <div className="bg-white p-6 rounded-lg shadow">
        {selectedChart === 'age' && (
          <Bar options={chartOptions} data={ageData} />
        )}
        {selectedChart === 'region' && (
          <Bar options={chartOptions} data={regionData} />
        )}
        {selectedChart === 'gender' && (
          <Pie options={chartOptions} data={genderData} />
        )}
        {selectedChart === 'trend' && (
          <Line options={chartOptions} data={trendData} />
        )}
      </div>
    </div>
  );
} 