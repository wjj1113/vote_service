import { useState, useEffect } from 'react';
import Head from 'next/head';
import GPTRecommendation from '../components/GPTRecommendation';
import PolicyCompare from '../components/PolicyCompare';
import PoliticalSurveyModal from '../components/PoliticalSurveyModal';
import PoliticalSurveyDashboard from '../components/PoliticalSurveyDashboard';
import Popup from '../components/Popup';

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
        <title>2025 대선 정책 비교, AI 후보 추천, 공약 이행 모니터링</title>
        <meta name="description" content="AI가 분석한 정치 성향, 후보별 정책 비교, 공약 이행까지 한눈에! 2025 대선 정책 서비스" />
        <meta property="og:title" content="2025 대선 정책 비교, AI 후보 추천, 공약 이행 모니터링" />
        <meta property="og:description" content="AI가 분석한 정치 성향, 후보별 정책 비교, 공약 이행까지 한눈에! 2025 대선 정책 서비스" />
        <meta property="og:image" content="/images/og-thumbnail.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="2025 대선 정책 비교, AI 후보 추천, 공약 이행 모니터링" />
        <meta name="twitter:description" content="AI가 분석한 정치 성향, 후보별 정책 비교, 공약 이행까지 한눈에! 2025 대선 정책 서비스" />
        <meta name="twitter:image" content="/images/og-thumbnail.png" />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* 상단 고정 PoliticalSurveyModal 버튼 */}
        <PoliticalSurveyModal />
        {/* 탭 메뉴 */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-8">
          <button
            onClick={() => { setActiveTab('service'); window.location.hash = '#service'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'service'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            data-tab="service"
          >
            후보자 비교
          </button>
          <button
            onClick={() => { setActiveTab('ai'); window.location.hash = '#ai'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'ai'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            data-tab="ai"
          >
            AI 추천
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); window.location.hash = '#dashboard'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            data-tab="dashboard"
          >
            여론조사 대시보드
          </button>
          <button
            onClick={() => { window.location.href = '/info'; }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors bg-gray-900 text-gray-100`}
            data-tab="info"
          >
            서비스 소개
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className={activeTab === 'service' ? 'block' : 'hidden'}>
          <PolicyCompare />
        </div>
        <div className={activeTab === 'ai' ? 'block' : 'hidden'}>
          <GPTRecommendation onRecommendationComplete={() => {}} />
        </div>
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <PoliticalSurveyDashboard />
        </div>
        <Popup />
      </main>
    </div>
  );
} 