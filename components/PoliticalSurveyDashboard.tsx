import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = 'blue', icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      {icon && <div className="text-3xl">{icon}</div>}
    </div>
  </div>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-blue-600">
          {`응답수: ${payload[0].value.toLocaleString()}명`}
        </p>
        <p className="text-gray-600">
          {`비율: ${((payload[0].value / 2847) * 100).toFixed(1)}%`}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#0066CC', '#E61E2B', '#F39C12', '#E74C3C', '#95A5A6', '#BDC3C7', '#9B59B6', '#34495E'];

const PoliticalSurveyDashboard = () => {
  // 실시간 데이터 상태
  const [surveyData, setSurveyData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 더미 데이터 (로딩/에러 fallback)
  const dummyData = {
    totalResponses: 2847,
    responseRate: 94.2,
    lastUpdated: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    voteIntent: [
      { label: '반드시 투표할 것이다', value: 'definitely_vote', count: 1598, percentage: 56.1 },
      { label: '가능하면 투표할 것이다', value: 'likely_vote', count: 823, percentage: 28.9 },
      { label: '아마 투표하지 않을 것이다', value: 'unlikely_vote', count: 284, percentage: 10.0 },
      { label: '투표하지 않을 것이다', value: 'definitely_not_vote', count: 142, percentage: 5.0 }
    ],
    supportedParty: [
      { label: '더불어민주당 (이재명)', value: 'democratic_party', count: 897, percentage: 31.5, color: '#0066CC' },
      { label: '국민의힘 (김문수)', value: 'peoples_power', count: 743, percentage: 26.1, color: '#E61E2B' },
      { label: '개혁신당 (이준석)', value: 'reform_party', count: 412, percentage: 14.5, color: '#F39C12' },
      { label: '민주노동당 (권영국)', value: 'labor_party', count: 198, percentage: 7.0, color: '#E74C3C' },
      { label: '무소속 (황교안)', value: 'independent_hwang', count: 156, percentage: 5.5, color: '#95A5A6' },
      { label: '무소속 (송진호)', value: 'independent_song', count: 113, percentage: 4.0, color: '#BDC3C7' },
      { label: '지지하는 후보는 있지만 정당은 없음', value: 'candidate_only', count: 184, percentage: 6.5, color: '#9B59B6' },
      { label: '지지 정당 없음 / 모르겠음', value: 'no_party', count: 144, percentage: 5.1, color: '#34495E' }
    ],
    keyIssues: [
      { label: '경제', value: 'economy', count: 892, percentage: 31.3 },
      { label: '복지', value: 'welfare', count: 512, percentage: 18.0 },
      { label: '공정', value: 'fairness', count: 398, percentage: 14.0 },
      { label: '안보', value: 'security', count: 341, percentage: 12.0 },
      { label: '청년정책', value: 'youth_policy', count: 284, percentage: 10.0 },
      { label: '정치개혁', value: 'political_reform', count: 227, percentage: 8.0 },
      { label: '기후위기', value: 'climate', count: 142, percentage: 5.0 },
      { label: '기타 / 잘 모르겠다', value: 'other', count: 51, percentage: 1.8 }
    ],
    regionDistribution: [
      { label: '서울', value: 'seoul', count: 681, percentage: 23.9 },
      { label: '경기 / 인천', value: 'gyeonggi', count: 853, percentage: 30.0 },
      { label: '경상', value: 'gyeongsang', count: 512, percentage: 18.0 },
      { label: '충청', value: 'chungcheong', count: 284, percentage: 10.0 },
      { label: '전라', value: 'jeolla', count: 227, percentage: 8.0 },
      { label: '강원', value: 'gangwon', count: 142, percentage: 5.0 },
      { label: '제주', value: 'jeju', count: 85, percentage: 3.0 },
      { label: '해외', value: 'overseas', count: 63, percentage: 2.2 }
    ],
    ageDistribution: [
      { label: '18–29세', value: '18-29', count: 683, percentage: 24.0 },
      { label: '30대', value: '30s', count: 797, percentage: 28.0 },
      { label: '40대', value: '40s', count: 684, percentage: 24.0 },
      { label: '50대', value: '50s', count: 455, percentage: 16.0 },
      { label: '60세 이상', value: '60+', count: 228, percentage: 8.0 }
    ],
    genderDistribution: [
      { label: '남성', value: 'male', count: 1423, percentage: 50.0 },
      { label: '여성', value: 'female', count: 1309, percentage: 46.0 },
      { label: '선택하지 않음', value: 'prefer_not_to_say', count: 115, percentage: 4.0 }
    ],
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/survey-stats');
        if (!res.ok) throw new Error('통계 데이터를 불러오지 못했습니다.');
        const data = await res.json();
        setSurveyData(data);
      } catch (error) {
        console.error('통계 데이터 로딩 중 오류:', error);
        setSurveyData(dummyData);
      } finally {
        setLoading(false);
      }
    };

    // 초기 데이터 로드
    fetchStats();

    // 실시간 업데이트를 위한 WebSocket 연결
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'stats_update') {
        setSurveyData(prevData => ({
          ...prevData,
          ...update.data,
          lastUpdated: new Date().toLocaleString()
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 연결 오류:', error);
    };

    // 컴포넌트 언마운트 시 WebSocket 연결 종료
    return () => {
      ws.close();
    };
  }, []);

  // 실시간 업데이트 표시
  const [lastUpdate, setLastUpdate] = useState<string>('');
  useEffect(() => {
    if (surveyData?.lastUpdated) {
      const updateTime = new Date(surveyData.lastUpdated);
      const now = new Date();
      const diff = now.getTime() - updateTime.getTime();
      
      if (diff < 60000) { // 1분 이내
        setLastUpdate('방금 전');
      } else if (diff < 3600000) { // 1시간 이내
        setLastUpdate(`${Math.floor(diff / 60000)}분 전`);
      } else {
        setLastUpdate(updateTime.toLocaleString());
      }
    }
  }, [surveyData?.lastUpdated]);

  const data = surveyData || dummyData;

  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗳️ 대선 여론조사 결과</h1>
          <p className="text-gray-600">투표 의향, 정당 지지도 및 유권자 성향 분석</p>
          <p className="text-sm text-gray-500 mt-1">마지막 업데이트: {data.lastUpdated}</p>
        </div>

        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="총 응답수" 
            value={data.totalResponses.toLocaleString()} 
            subtitle="전체 설문 참여자" 
            icon="📊"
          />
          <StatCard 
            title="응답률" 
            value={`${data.responseRate}%`} 
            subtitle="설문 완료 비율" 
            icon="✅"
          />
          <StatCard 
            title="투표 의향" 
            value="85.0%" 
            subtitle="투표할 것이라고 답한 비율" 
            icon="🗳️"
          />
          <StatCard 
            title="1위 정당" 
            value="민주당 31.5%" 
            subtitle="가장 높은 지지율" 
            icon="🏆"
          />
        </div>

        {/* 메인 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 투표 의향 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">투표 의향</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.voteIntent ?? []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="label"
                >
                  {(data.voteIntent ?? []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 정당 지지도 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">정당별 지지도</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.supportedParty ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3B82F6">
                  {(data.supportedParty ?? []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 주요 관심 이슈 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 관심 이슈</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.keyIssues ?? []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={80} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 지역별 분포 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지역별 응답 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.regionDistribution ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 인구통계학적 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 연령대별 분포 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">연령대별 분포</h3>
            <div className="space-y-3">
              {((data.ageDistribution ?? [])).map((age: any, index: number) => (
                <div key={age.value} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded mr-3" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-sm">{age.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{age.count}명</div>
                    <div className="text-xs text-gray-500">{age.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 성별 분포 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">성별 분포</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.genderDistribution ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ percentage }) => `${percentage}%`}
                >
                  {((data.genderDistribution ?? [])).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 주요 인사이트 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 주요 인사이트</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 text-sm">높은 투표 참여 의지</h4>
                <p className="text-xs text-blue-700 mt-1">85%가 투표할 의향을 보여 높은 관심도</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 text-sm">양강 구도</h4>
                <p className="text-xs text-green-700 mt-1">민주당과 국민의힘이 1, 2위 경쟁</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 text-sm">경제가 최대 관심사</h4>
                <p className="text-xs text-yellow-700 mt-1">31.3%가 경제를 가장 중요한 이슈로 선택</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 text-sm">수도권 집중</h4>
                <p className="text-xs text-purple-700 mt-1">서울·경기 응답자가 전체의 53.9%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 요약 통계 테이블 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 정당별 상세 현황</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">정당/후보</th>
                  <th className="text-right p-2">응답수</th>
                  <th className="text-right p-2">지지율</th>
                  <th className="text-center p-2">순위</th>
                </tr>
              </thead>
              <tbody>
                {((data.supportedParty ?? [])
                  .sort((a: any, b: any) => b.count - a.count)
                  .map((party: any, index: number) => (
                    <tr key={party.value} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded mr-2" 
                            style={{ backgroundColor: party.color }}
                          ></div>
                          {party.label}
                        </div>
                      </td>
                      <td className="text-right p-2">{party.count.toLocaleString()}명</td>
                      <td className="text-right p-2 font-medium">{party.percentage}%</td>
                      <td className="text-center p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-50 text-blue-800'
                        }`}>
                          {index + 1}위
                        </span>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center text-gray-500 text-sm">
          <p>본 조사는 익명으로 진행되었으며, 통계적 목적으로만 사용됩니다.</p>
          <p className="mt-1">데이터 수집 기간: 2025년 5월 1일 ~ 5월 20일</p>
          
          {/* 내부 링크 */}
          <div className="mt-4 flex justify-center space-x-4">
            <a 
              href="/#service" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                후보자 비교
              </span>
            </a>
            <a 
              href="/#ai" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                AI 추천
              </span>
            </a>
            <a 
              href="/#dashboard" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                여론조사 대시보드
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticalSurveyDashboard; 