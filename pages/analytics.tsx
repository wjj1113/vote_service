import React, { useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useLoading } from '../contexts/LoadingContext';

export default function AnalyticsPage() {
  const {
    setAnalyzing,
    setAnalysisProgress,
    setAnalysisKeywords,
  } = useLoading();

  useEffect(() => {
    const analyzeData = async () => {
      try {
        // 분석 시작
        setAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisKeywords([]);

        // 1단계: 대화 내용 수집 (0-30%)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysisProgress(30);
        setAnalysisKeywords(['정치', '경제', '복지']);

        // 2단계: 정치적 성향 분석 (30-60%)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysisProgress(60);
        setAnalysisKeywords(['정치', '경제', '복지', '교육', '안보']);

        // 3단계: 후보자 매칭 (60-90%)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysisProgress(90);
        setAnalysisKeywords(['정치', '경제', '복지', '교육', '안보', '환경', '노동']);

        // 4단계: 결과 최종화 (90-100%)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalysisProgress(100);

        // 분석 완료
        setAnalyzing(false);
      } catch (error) {
        console.error('Error during analysis:', error);
        setAnalyzing(false);
      }
    };

    analyzeData();
  }, [setAnalyzing, setAnalysisProgress, setAnalysisKeywords]);

  return (
    <div className="min-h-screen bg-gray-100">
      <AnalyticsDashboard />
    </div>
  );
} 