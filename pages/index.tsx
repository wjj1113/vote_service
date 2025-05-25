import { useState, useEffect } from 'react';
import Head from 'next/head';
import GPTRecommendation from '../components/GPTRecommendation';
import PolicyCompare from '../components/PolicyCompare';
import PoliticalSurveyModal from '../components/PoliticalSurveyModal';
import PoliticalSurveyDashboard from '../components/PoliticalSurveyDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'service' | 'ai' | 'dashboard'>('service');

  // hash 변경 감지 → 탭 전환
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#ai') {
        setActiveTab('ai');
      }
      if (window.location.hash === '#dashboard') {
        setActiveTab('dashboard');
      }
      if (window.location.hash === '' || window.location.hash === '#service') {
        setActiveTab('service');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // mount 시에도 hash 체크
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>투표 서비스</title>
        <meta name="description" content="투표 서비스" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* 상단 고정 PoliticalSurveyModal 버튼 */}
        <PoliticalSurveyModal />
        {/* 탭 메뉴 */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => { setActiveTab('service'); window.location.hash = '#service'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'service'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            기존 서비스
          </button>
          <button
            onClick={() => { setActiveTab('ai'); window.location.hash = '#ai'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            AI 추천
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); window.location.hash = '#dashboard'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            여론조사 대시보드
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'service' ? (
            <PolicyCompare />
          ) : activeTab === 'ai' ? (
            <GPTRecommendation chatHistory="" />
          ) : (
            <PoliticalSurveyDashboard />
          )}
        </div>
      </main>
    </div>
  );
} 