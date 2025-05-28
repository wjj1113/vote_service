import React from 'react';

interface AnalyzingStateProps {
  progress: number;
  keywords: string[];
}

const AnalyzingState: React.FC<AnalyzingStateProps> = ({ progress, keywords }) => {
  const getAnalysisStage = () => {
    if (progress < 30) return '대화 내용 수집 중...';
    if (progress < 60) return '정치적 성향 분석 중...';
    if (progress < 90) return '후보자 매칭 중...';
    return '결과 최종화 중...';
  };
  
  return (
    <div className="p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          대화 내용 분석 중
        </h1>
        <p className="text-lg text-gray-600">
          {getAnalysisStage()}
        </p>
      </div>
      
      {/* 진행 상태 표시 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>분석 진행 중</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* 키워드 표시 */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="font-medium text-gray-800 mb-4">감지된 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span 
              key={index}
              className="inline-block bg-white px-3 py-1 rounded-full text-blue-600 text-sm animate-fadeIn"
            >
              {keyword}
            </span>
          ))}
          {keywords.length === 0 && (
            <p className="text-gray-500 text-sm">키워드 추출 중...</p>
          )}
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm">
        <p>분석이 완료될 때까지 잠시만 기다려 주세요</p>
        <p>이 과정은 최대 1분 정도 소요될 수 있습니다</p>
      </div>
    </div>
  );
};

export default AnalyzingState; 