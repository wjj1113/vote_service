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

interface SurveySubmission {
  id: number;
  formData: {
    vote_intent: string;
    supported_party: string;
    key_issue: string;
    region: string;
    age_group: string;
    gender: string;
  };
  createdAt: string;
}

export default function DashboardChart() {
  const [surveyData, setSurveyData] = useState<SurveySubmission[]>([]);
  const [selectedChart, setSelectedChart] = useState<'age' | 'region' | 'gender' | 'trend'>('age');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 투표 의향 매핑
  const voteIntentMap = {
    'definitely_vote': '반드시 투표할 것이다',
    'likely_vote': '가능하면 투표할 것이다',
    'unlikely_vote': '아마 투표하지 않을 것이다',
    'definitely_not_vote': '투표하지 않을 것이다'
  };

  // 정당 매핑
  const partyMap = {
    'democratic_party': '더불어민주당 (이재명)',
    'peoples_power': '국민의힘 (김문수)',
    'reform_party': '개혁신당 (이준석)',
    'labor_party': '민주노동당 (권영국)',
    'independent_hwang': '무소속 (황교안)',
    'independent_song': '무소속 (송진호)',
    'candidate_only': '지지하는 후보는 있지만 정당은 없음',
    'no_party': '지지 정당 없음 / 모르겠음'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          throw new Error(`데이터를 불러오지 못했습니다. (${res.status})`);
        }
        
        const data = await res.json();
        setSurveyData(data.surveySubmissions || []);
        setRetryCount(0);
      } catch (err) {
        console.error('데이터 로딩 중 오류:', err);
        setError(err as Error);
        
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retryCount]);

  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      
      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === 'survey_update') {
            setSurveyData(prev => [...prev, ...update.data.surveySubmissions]);
          }
        } catch (err) {
          console.error('WebSocket 메시지 처리 중 오류:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket 연결 오류:', err);
      };

      ws.onclose = () => {
        setTimeout(connectWebSocket, 1000);
      };

      return ws;
    };

    const ws = connectWebSocket();
    return () => ws.close();
  }, []);

  // 투표 의향 데이터 계산
  const voteIntentData = {
    labels: Object.values(voteIntentMap),
    datasets: [{
      data: Object.keys(voteIntentMap).map(intent => 
        surveyData.filter(s => s.formData.vote_intent === intent).length
      ),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(255, 99, 132, 0.5)'
      ]
    }]
  };

  // 정당 지지도 데이터 계산
  const partyData = {
    labels: Object.values(partyMap),
    datasets: [{
      data: Object.keys(partyMap).map(party => 
        surveyData.filter(s => s.formData.supported_party === party).length
      ),
      backgroundColor: [
        '#0066CC', '#E61E2B', '#F39C12', '#E74C3C',
        '#95A5A6', '#BDC3C7', '#9B59B6', '#34495E'
      ]
    }]
  };

  // 연령대별 분포 데이터 계산
  const ageData = {
    labels: ['18-29세', '30대', '40대', '50대', '60세 이상'],
    datasets: [{
      data: ['18-29', '30s', '40s', '50s', '60+'].map(age => 
        surveyData.filter(s => s.formData.age_group === age).length
      ),
      backgroundColor: 'rgba(75, 192, 192, 0.5)'
    }]
  };

  // 지역별 분포 데이터 계산
  const regionData = {
    labels: ['서울', '경기/인천', '강원', '충청', '전라', '경상', '제주', '해외'],
    datasets: [{
      data: ['seoul', 'gyeonggi', 'gangwon', 'chungcheong', 'jeolla', 'gyeongsang', 'jeju', 'overseas'].map(region => 
        surveyData.filter(s => s.formData.region === region).length
      ),
      backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }]
  };

  // 성별 분포 데이터 계산
  const genderData = {
    labels: ['남성', '여성', '선택하지 않음'],
    datasets: [{
      data: ['male', 'female', 'prefer_not_to_say'].map(gender => 
        surveyData.filter(s => s.formData.gender === gender).length
      ),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)'
      ]
    }]
  };

  if (loading && retryCount === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600 mb-2">데이터를 불러오는데 실패했습니다.</p>
        <button 
          onClick={() => setRetryCount(0)}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

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
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          연령대별
        </button>
        <button
          onClick={() => setSelectedChart('region')}
          className={`px-4 py-2 rounded-lg ${
            selectedChart === 'region'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          지역별
        </button>
        <button
          onClick={() => setSelectedChart('gender')}
          className={`px-4 py-2 rounded-lg ${
            selectedChart === 'gender'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          성별
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
      </div>
    </div>
  );
} 