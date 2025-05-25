import React, { useState } from 'react';
import { Button, Card, Typography, Space, Radio, Checkbox, Input, message, Tabs, Spin } from 'antd';
import { ShareAltOutlined, CheckOutlined, CloseOutlined, CopyOutlined } from '@ant-design/icons';
import LightSurveyForm from './LightSurveyForm';
import HeavySurveyForm from './HeavySurveyForm';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface PoliticalOrientation {
  id?: number;
  성향: string;
  가치기준: string;
  관심정책: string[];
  투표기준: string;
}

interface RecommendationResult {
  추천후보자: string;
  추천사유: string;
  핵심공약요약: string[];
  정당?: string;
  이미지?: string;
  매칭점수?: number;
  슬로건?: string;
}

interface GPTRecommendationProps {
  chatHistory: string;
}

interface AnalyzingStateProps {
  progress: number;
  keywords: string[];
}

interface CandidateResultProps {
  resultData: {
    recommendedCandidate: {
      name: string;
      party: string;
      image: string;
      matchScore: number;
      slogan: string;
    };
    recommendationReason: string;
    keyPolicies: Array<{
      title: string;
      description: string;
    }>;
    userType: string;
    politicalValues: {
      leaning: string;
      coreValues: string[];
      policyInterests: string[];
      votingCriterion: string;
    };
  };
}

// fetch에 타임아웃을 거는 유틸 함수
function fetchWithTimeout(resource: RequestInfo, options: any = {}, timeout = 30000) {
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.')), timeout))
  ]);
}

// --- 새 UI 컴포넌트 ---
const UserTypeSelection: React.FC<{ onSelect: (type: string) => void }> = ({ onSelect }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                나에게 맞는 후보자는 누구일까요?
              </h1>
              <p className="text-lg text-gray-600">
                AI 분석으로 당신의 가치관과 일치하는 후보자를 찾아드립니다
              </p>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              GPT와 대화해 보신 적이 있으신가요?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedOption === 'gpt_existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => { setSelectedOption('gpt_existing'); onSelect('gpt_existing'); }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg text-center mb-2">네, GPT와 대화한 적 있어요</h3>
                <p className="text-gray-500 text-sm text-center">대화 내용을 분석해 정확한 성향 매칭을 제공합니다</p>
              </div>
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedOption === 'gpt_new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => { setSelectedOption('gpt_new'); onSelect('gpt_new'); }}
              >
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg text-center mb-2">아니요, GPT는 처음이에요</h3>
                <p className="text-gray-500 text-sm text-center">간단한 설문으로 나에게 맞는 후보자를 찾아드립니다</p>
              </div>
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedOption === 'quick_result' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => { setSelectedOption('quick_result'); onSelect('quick_result'); }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg text-center mb-2">결과만 빠르게 보기</h3>
                <p className="text-gray-500 text-sm text-center">지역 인기 후보자 정보를 바로 확인하세요</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4">
            <p className="text-sm text-gray-500 text-center">
              모든 데이터는 익명으로 처리되며, 추천 목적으로만 사용됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 설문 컴포넌트(간단화) ---
const PoliticalSurvey: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  // 기존 설문 로직을 간단화하여 구현 (실제 설문 로직은 기존 코드 참고)
  const [answers, setAnswers] = useState({
    political_leaning: '',
    core_values: [],
    policy_interests: [],
    voting_criterion: ''
  });
  return (
    <Card className="mb-8">
      <Title level={4}>정치 성향 설문 (데모)</Title>
      {/* 실제 설문 폼 구현 생략, onSubmit(answers) 호출 시 기존 추천 로직 연동 */}
      <Button type="primary" onClick={() => onSubmit(answers)}>
        설문 결과로 추천받기 (데모)
      </Button>
    </Card>
  );
};

// 분석 중 상태 컴포넌트
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

// 결과 페이지 컴포넌트
const CandidateResult: React.FC<CandidateResultProps> = ({ resultData }) => {
  const [userAgreement, setUserAgreement] = useState<boolean | null>(null);
  
  const handleAgreement = (agrees: boolean) => {
    setUserAgreement(agrees);
    // TODO: 서버에 데이터 저장 로직 추가
  };
  
  const handleShare = (platform: 'twitter' | 'threads' | 'kakaotalk' | 'copy') => {
    // TODO: 공유 기능 구현
    console.log(`${platform}에 공유하기`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 결과 헤더 */}
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">당신에게 추천하는 후보자</h1>
            <p className="text-lg opacity-90">AI가 분석한 정치 성향과 가치관에 기반한 추천입니다</p>
          </div>
          
          {/* 후보자 프로필 */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img src={resultData.recommendedCandidate.image} alt={resultData.recommendedCandidate.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {resultData.recommendedCandidate.matchScore}%
                  </div>
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{resultData.recommendedCandidate.name}</h2>
                <p className="text-lg text-blue-600 mb-2">{resultData.recommendedCandidate.party}</p>
                <p className="text-gray-600 italic">"{resultData.recommendedCandidate.slogan}"</p>
              </div>
            </div>
            
            {/* 추천 이유 */}
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                추천 이유
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {resultData.recommendationReason}
              </p>
            </div>
            
            {/* 사용자 정치 성향 요약 */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                당신의 정치 성향 요약
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">정치 성향</p>
                  <p className="font-medium">{resultData.politicalValues.leaning}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">중시하는 가치</p>
                  <p className="font-medium">{resultData.politicalValues.coreValues.join(', ')}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">관심 정책</p>
                  <p className="font-medium">{resultData.politicalValues.policyInterests.join(', ')}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">투표 기준</p>
                  <p className="font-medium">{resultData.politicalValues.votingCriterion}</p>
                </div>
              </div>
            </div>
            
            {/* 핵심 공약 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                핵심 공약
              </h3>
              <div className="space-y-4">
                {resultData.keyPolicies.map((policy, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{policy.title}</h4>
                        <p className="text-gray-600">{policy.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 동의 여부 */}
            {userAgreement === null && (
              <div className="bg-blue-50 p-6 rounded-lg text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  이 후보자가 내 성향과 일치한다고 생각하시나요?
                </h3>
                <div className="flex justify-center space-x-4">
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => handleAgreement(true)}
                  >
                    네, 일치해요
                  </button>
                  <button 
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => handleAgreement(false)}
                  >
                    아니요, 다른 것 같아요
                  </button>
                </div>
              </div>
            )}
            
            {userAgreement !== null && (
              <div className="bg-green-50 p-6 rounded-lg text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  피드백 감사합니다!
                </h3>
                <p className="text-gray-600">
                  {userAgreement 
                    ? '귀하의 성향이 정확히 반영된 것 같아 기쁩니다.' 
                    : '더 정확한 추천을 위해 피드백을 반영하겠습니다.'}
                </p>
              </div>
            )}
            
            {/* 공유 옵션 */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-center text-xl font-semibold text-gray-800 mb-4">
                결과 공유하기
              </h3>
              <div className="flex justify-center space-x-4">
                <button 
                  className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
                  onClick={() => handleShare('twitter')}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                
                <button 
                  className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                  onClick={() => handleShare('threads')}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5006 1H10.1506C9.97495 1 9.83557 1.13938 9.83557 1.31503V19.572C9.83557 19.7476 9.97495 19.887 10.1506 19.887H13.5006C13.6763 19.887 13.8156 19.7476 13.8156 19.572V1.31503C13.8156 1.13938 13.6763 1 13.5006 1Z"/>
                    <path d="M20.8949 15.2196C20.8949 15.854 20.8751 16.4098 20.7963 16.9397C20.2861 20.3282 17.5123 22.9999 14.0302 22.9999H9.6194C6.13734 22.9999 3.36352 20.3282 2.85332 16.9397C2.77464 16.4098 2.75473 15.854 2.75473 15.2196C2.75473 14.586 2.77464 14.0302 2.85332 13.5002C3.36352 10.1118 6.13734 7.4401 9.6194 7.4401H14.0302C17.5123 7.4401 20.2861 10.1118 20.7963 13.5002C20.8751 14.0302 20.8949 14.586 20.8949 15.2196Z"/>
                  </svg>
                </button>
                
                <button 
                  className="w-12 h-12 rounded-full bg-yellow-400 text-white flex items-center justify-center hover:bg-yellow-500"
                  onClick={() => handleShare('kakaotalk')}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C5.92 1 1 5.02 1 10C1 13.11 2.98 15.83 6 17.35V23L11.89 17.66C11.96 17.67 12.03 17.67 12.1 17.67C18.17 17.67 23.09 13.66 23.09 8.68C23.09 3.7 18.17 1 12 1Z"/>
                  </svg>
                </button>
                
                <button 
                  className="w-12 h-12 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600"
                  onClick={() => handleShare('copy')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GPTRecommendation: React.FC<GPTRecommendationProps> = ({ chatHistory }): React.ReactElement => {
  const [entry, setEntry] = useState<'select' | 'survey' | 'gpt' | 'quick' | 'heavy'>('select');
  const [surveyResult, setSurveyResult] = useState<any | null>(null);
  const [orientation, setOrientation] = useState<PoliticalOrientation | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [matchVote, setMatchVote] = useState<boolean | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('orientation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisKeywords, setAnalysisKeywords] = useState<string[]>([]);
  const [userType, setUserType] = useState<'existing' | 'new'>('new');

  // GPT 미사용자를 위한 상태
  const [politicalOrientation, setPoliticalOrientation] = useState<string>('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [policyKeywords, setPolicyKeywords] = useState<string>('');
  const [voteCriteria, setVoteCriteria] = useState<string>('');

  const valueOptions = [
    { label: '공정', value: '공정' },
    { label: '복지', value: '복지' },
    { label: '경제성장', value: '경제성장' },
    { label: '정치개혁', value: '정치개혁' },
    { label: '안보', value: '안보' },
    { label: '기후', value: '기후' },
  ];

  const voteOptions = [
    { label: '정당 중심', value: '정당' },
    { label: '후보자 중심', value: '후보자' },
    { label: '공약 중심', value: '공약' },
  ];

  const orientationPrompt = `🧠 당신은 개인화된 정치 어시스턴트입니다.

제가 지금까지 당신과 나눈 대화를 기반으로 분석하여, 제 정치적 성향과 관심 주제를 객관적으로 요약해주세요.

🎯 요약 항목:
1. 정치 성향 (진보 / 보수 / 중도 / 실용주의 등)  
2. 가치 기준 (공정성 / 경제 성장 / 복지 우선 등)  
3. 주요 관심 정책 키워드 (최대 3개)  
4. 나의 투표 기준 (정당 / 후보자 능력 / 공약 중심 등)

✍️ 출력 예시:
{
  "성향": "중도",
  "가치기준": "실용주의 + 정치개혁",
  "관심정책": ["청년복지", "노동시장", "디지털경제"],
  "투표기준": "정당보다 후보자의 정책 실현력 중시"
}`;

  const recommendationPrompt = `당신은 대선 후보 분석 전문 정치봇입니다.

제가 지금까지 당신과 나눈 대화를 기반으로,  
제 정치 성향, 가치관, 관심 정책을 고려해  
이번 대선에서 **저에게 가장 잘 맞는 후보자**를 하나 추천해주세요.

📌 고려 기준:
- 성향 요약 (대화 기반 자동 분석)
- 후보자의 공약/가치 기준 매칭
- 추천 이유는 3~4문장으로 제시

✍️ 출력 예시:
추천 후보자: OOO  
추천 사유: 당신은 실용주의와 경제정책을 중시하고, 청년 일자리 문제에 관심이 많습니다. 이 후보는 청년 일자리 공약에 강점을 가지고 있으며, 중도 실용주의 성향을 가지고 있어 잘 맞습니다.  
관련 공약: 청년 창업 지원 / 디지털 산업 인프라 확충 / 규제 완화`;

  const handleUserTypeSelect = (type: 'existing' | 'new') => {
    setUserType(type);
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    message.success('프롬프트가 클립보드에 복사되었습니다.');
  };

  // 분석 진행 상황을 시뮬레이션하는 함수
  const simulateAnalysis = () => {
    setAnalysisProgress(0);
    setAnalysisKeywords([]);
    
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    const keywords = [
      '경제성장', '일자리', '공정', '규제개혁', '청년창업', 
      '디지털경제', '혁신', '실용정책', '4차산업', '중소기업'
    ];
    
    let displayedKeywords: string[] = [];
    const keywordInterval = setInterval(() => {
      if (displayedKeywords.length >= keywords.length) {
        clearInterval(keywordInterval);
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * keywords.length);
      const keyword = keywords[randomIndex];
      
      if (!displayedKeywords.includes(keyword)) {
        displayedKeywords.push(keyword);
        setAnalysisKeywords([...displayedKeywords]);
      }
    }, 600);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(keywordInterval);
    };
  };

  // handleSubmitGPTResult 함수 수정
  const handleSubmitGPTResult = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    simulateAnalysis(); // 분석 시뮬레이션 시작
    
    try {
      if (activeTab === 'orientation') {
        // 1. 사용자 입력 정제
        const cleanedInput = userInput.trim();
        // 2. GPT API 호출
        const response = await fetchWithTimeout('/api/analyze-orientation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatHistory: cleanedInput }),
        }) as Response;
        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.error || '정치 성향 분석에 실패했습니다.');
          return;
        }
        const data = await response.json();
        setOrientation({
          id: data.id,
          성향: data.tendency,
          가치기준: data.valueBase,
          관심정책: data.interests,
          투표기준: data.voteBase,
        });
        message.success('정치 성향이 분석되었습니다.');
        setUserInput('');
        setActiveTab('recommendation');
      } else {
        if (!orientation?.id) {
          message.error('먼저 정치 성향을 분석해주세요.');
          return;
        }
        const response = await fetchWithTimeout('/api/get-recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orientationId: orientation.id }),
        }) as Response;
        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.error || '후보자 추천에 실패했습니다.');
          return;
        }
        const data = await response.json();
        setRecommendation({
          추천후보자: data.candidate,
          추천사유: data.reason,
          핵심공약요약: data.policies,
          정당: data.party,
          이미지: data.image,
          매칭점수: data.matchScore,
          슬로건: data.slogan,
        });
        message.success('후보자 추천이 완료되었습니다.');
        setUserInput('');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserSubmit = async () => {
    setIsLoading(true);
    try {
      const newOrientation: PoliticalOrientation = {
        성향: politicalOrientation,
        가치기준: selectedValues.join(', '),
        관심정책: policyKeywords.split(',').map(k => k.trim()),
        투표기준: voteCriteria,
      };
      // 1. 설문 결과를 DB에 저장
      const saveRes = await fetchWithTimeout('/api/analyze-orientation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: JSON.stringify(newOrientation, null, 2),
        }),
      }) as Response;
      if (!saveRes.ok) {
        throw new Error('정치 성향 저장에 실패했습니다.');
      }
      const saved = await saveRes.json();
      setOrientation({
        id: saved.id,
        성향: saved.tendency,
        가치기준: saved.valueBase,
        관심정책: saved.interests,
        투표기준: saved.voteBase,
      });
      // 2. 저장된 id로 추천 요청
      const response = await fetchWithTimeout('/api/get-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orientationId: saved.id }),
      }) as Response;
      if (!response.ok) {
        throw new Error('후보자 추천에 실패했습니다.');
      }
      const data = await response.json();
      console.log('추천 API 응답:', data);
      setRecommendation({
        추천후보자: data.candidate,
        추천사유: data.reason,
        핵심공약요약: data.policies,
        정당: data.party,
        이미지: data.image,
        매칭점수: data.matchScore,
        슬로건: data.slogan,
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '후보자 추천 중 오류가 발생했습니다.');
      console.error('Error getting recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchVote = async (match: boolean) => {
    setMatchVote(match);
    try {
      await fetch('/api/save-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendation,
          match,
        }),
      });
      message.success('응답이 저장되었습니다.');
    } catch (error) {
      message.error('응답 저장 중 오류가 발생했습니다.');
      console.error('Error saving match:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'AI 후보자 추천 결과',
        text: `추천 후보자: ${recommendation?.추천후보자}\n추천 사유: ${recommendation?.추천사유}\n핵심 공약: ${recommendation?.핵심공약요약.join(', ')}`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        message.success('결과가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      message.error('공유 중 오류가 발생했습니다.');
      console.error('Error sharing:', error);
    }
  };

  // 후보자 추천 자동 실행 함수
  const handleAutoRecommend = async (orientationData: PoliticalOrientation) => {
    setActiveTab('recommendation');
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout('/api/get-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orientationId: orientationData.id }),
      }) as Response;
      if (!response.ok) {
        throw new Error('후보자 추천에 실패했습니다.');
      }
      const data = await response.json();
      console.log('추천 API 응답:', data);
      setRecommendation({
        추천후보자: data.candidate,
        추천사유: data.reason,
        핵심공약요약: data.policies,
        정당: data.party,
        이미지: data.image,
        매칭점수: data.matchScore,
        슬로건: data.slogan,
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '후보자 추천 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 설문 완료 시 기존 추천 로직 연동
  const handleSurveySubmit = async (answers: any) => {
    if (isSubmitting) return; // 이미 제출 중이면 중복 제출 방지
    
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      const newOrientation: PoliticalOrientation = {
        성향: answers.political_leaning,
        가치기준: (answers.core_values || []).join(', '),
        관심정책: answers.policy_interests || [],
        투표기준: answers.voting_criterion || '',
      };
      
      // 1. 설문 결과를 DB에 저장
      const saveRes = await fetchWithTimeout('/api/analyze-orientation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: JSON.stringify(newOrientation, null, 2),
        }),
      }) as Response;
      
      if (!saveRes.ok) {
        throw new Error('정치 성향 저장에 실패했습니다.');
      }
      
      const saved = await saveRes.json();
      setOrientation({
        id: saved.id,
        성향: saved.tendency,
        가치기준: saved.valueBase,
        관심정책: saved.interests,
        투표기준: saved.voteBase,
      });
      
      // 2. 저장된 id로 추천 요청
      const response = await fetchWithTimeout('/api/get-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orientationId: saved.id }),
      }) as Response;
      
      if (!response.ok) {
        throw new Error('후보자 추천에 실패했습니다.');
      }
      
      const data = await response.json();
      setRecommendation({
        추천후보자: data.candidate,
        추천사유: data.reason,
        핵심공약요약: data.policies,
        정당: data.party,
        이미지: data.image,
        매칭점수: data.matchScore,
        슬로건: data.slogan,
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '후보자 추천 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const [lightResult, setLightResult] = useState<any | null>(null);
  const [heavyResult, setHeavyResult] = useState<any | null>(null);
  const [heavyInitial, setHeavyInitial] = useState<any | null>(null);

  if (entry === 'select') {
    return <UserTypeSelection onSelect={(type) => {
      if (type === 'gpt_new') setEntry('survey');
      else if (type === 'gpt_existing') setEntry('gpt');
      else if (type === 'quick_result') {
        message.info('기존 서비스로 이동합니다.');
        window.location.href = '/';
      }
    }} />;
  }

  if (entry === 'survey') {
    if (lightResult) {
      return (
        <Card className="max-w-lg mx-auto mt-8 p-8 bg-white rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">추천 결과</h2>
          <div className="mb-4">
            <div><b>추천 후보자:</b> {lightResult.candidate || '홍길동'}</div>
            <div><b>추천 사유:</b> {lightResult.reason || '정치 성향, 가치, 관심 정책을 고려한 추천입니다.'}</div>
          </div>
          <Button 
            type="primary" 
            onClick={() => { setEntry('heavy'); setHeavyInitial(lightResult.answers); }}
            disabled={isSubmitting}
          >
            결과가 부족하다면?
          </Button>
          <Button 
            style={{marginLeft: 8}} 
            onClick={() => { setLightResult(null); setEntry('survey'); }}
            disabled={isSubmitting}
          >
            다시 설문하기
          </Button>
        </Card>
      );
    }
    return <LightSurveyForm onSubmit={async (answers: any) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        setLightResult({
          candidate: '이재명',
          reason: `${answers.tendency} 성향, ${answers.values.join(', ')} 가치를 중시하고, ${answers.interests.join(', ')}에 관심이 많은 유권자에게 적합한 후보입니다.`,
          answers
        });
      } finally {
        setIsSubmitting(false);
      }
    }} />;
  }

  if (entry === 'heavy') {
    if (heavyResult) {
      return (
        <Card className="max-w-lg mx-auto mt-8 p-8 bg-white rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">정교한 추천 결과</h2>
          <div className="mb-4">
            <div><b>추천 후보자:</b> {heavyResult.candidate || '홍길동'}</div>
            <div><b>추천 사유:</b> {heavyResult.reason || '심화 설문을 바탕으로 한 맞춤형 추천입니다.'}</div>
          </div>
          <Button onClick={() => { setHeavyResult(null); setEntry('heavy'); }}>다시 심화 설문하기</Button>
          <Button style={{marginLeft: 8}} onClick={() => { setHeavyResult(null); setEntry('survey'); }}>라이트 설문으로 돌아가기</Button>
        </Card>
      );
    }
    return <HeavySurveyForm initialAnswers={heavyInitial} onSubmit={async (answers: any) => {
      setHeavyResult({
        candidate: '김문수',
        reason: `${answers.tendency} 성향, ${answers.values?.join(', ')} 가치, ${answers.interests?.join(', ')} 관심, ${answers.lifestyle} 라이프스타일, ${answers.policyPriority?.join(' > ')} 우선순위를 반영한 추천입니다.`
      });
    }} />;
  }

  if (entry === 'gpt') {
    if (recommendation) {
      return (
        <CandidateResult
          resultData={{
            recommendedCandidate: {
              name: recommendation.추천후보자,
              party: recommendation.정당 || '',
              image: recommendation.이미지 || 'https://via.placeholder.com/150',
              matchScore: recommendation.매칭점수 || 80,
              slogan: recommendation.슬로건 || ''
            },
            recommendationReason: recommendation.추천사유,
            keyPolicies: (recommendation.핵심공약요약 || []).map(title => ({
              title,
              description: ''
            })),
            userType: 'gpt_existing',
            politicalValues: {
              leaning: orientation?.성향 || '',
              coreValues: orientation?.가치기준 ? orientation.가치기준.split(',') : [],
              policyInterests: orientation?.관심정책 || [],
              votingCriterion: orientation?.투표기준 || ''
            }
          }}
        />
      );
    }

    if (isLoading) {
      return (
        <AnalyzingState 
          progress={analysisProgress} 
          keywords={analysisKeywords} 
        />
      );
    }

    if (errorMessage) {
      return (
        <Card className="max-w-lg mx-auto mt-8 p-8 bg-white rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">분석 실패</h2>
          <div className="mb-4 text-gray-700">{errorMessage}</div>
          <Button type="primary" onClick={() => setErrorMessage(null)}>
            다시 시도하기
          </Button>
        </Card>
      );
    }

    return (
      <Card className="mb-8">
        <Title level={4}>GPT 기반 후보자 추천</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <Spin size="large" tip="분석 중입니다..." />
            </div>
          )}
          {!isLoading && !orientation && !recommendation && (
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane 
                tab={
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    ① 나의 정치 성향 요약 요청
                  </span>
                } 
                key="orientation"
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card type="inner">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, marginRight: 16 }}>
                          <Title level={5}>📝 사용 방법</Title>
                          <Text>
                            1. 오른쪽의 프롬프트를 복사하세요<br />
                            2. ChatGPT에 붙여넣어 실행하세요<br />
                            3. GPT가 출력한 결과를 아래 입력창에 붙여넣으세요
                          </Text>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong>프롬프트</Text>
                            <Button 
                              type="primary" 
                              icon={<CopyOutlined />}
                              onClick={() => handleCopyPrompt(orientationPrompt)}
                              size="small"
                            >
                              복사하기
                            </Button>
                          </div>
                          <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 4,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                              {orientationPrompt}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Space>
                  </Card>
                  <Input.TextArea 
                    placeholder="GPT의 출력값을 여기에 붙여넣어 주세요."
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    rows={6}
                  />
                  <Button 
                    type="primary"
                    onClick={handleSubmitGPTResult}
                    disabled={!userInput}
                    block
                  >
                    결과 제출하기
                  </Button>
                </Space>
              </TabPane>
              <TabPane tab="② 나에게 맞는 후보자 추천 요청" key="recommendation">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card type="inner">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, marginRight: 16 }}>
                          <Title level={5}>📝 사용 방법</Title>
                          <Text>
                            1. 오른쪽의 프롬프트를 복사하세요<br />
                            2. ChatGPT에 붙여넣어 실행하세요<br />
                            3. GPT가 출력한 결과를 아래 입력창에 붙여넣으세요
                          </Text>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong>프롬프트</Text>
                            <Button 
                              type="primary" 
                              icon={<CopyOutlined />}
                              onClick={() => handleCopyPrompt(recommendationPrompt)}
                              size="small"
                            >
                              복사하기
                            </Button>
                          </div>
                          <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: 12, 
                            borderRadius: 4,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                              {recommendationPrompt}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Space>
                  </Card>
                  <Input.TextArea 
                    placeholder="GPT의 출력값을 여기에 붙여넣어 주세요."
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    rows={6}
                  />
                  <Button 
                    type="primary"
                    onClick={handleSubmitGPTResult}
                    disabled={!userInput}
                    block
                  >
                    결과 제출하기
                  </Button>
                </Space>
              </TabPane>
            </Tabs>
          )}

          {!isLoading && orientation && !recommendation && (
            <>
              <Card title="나의 정치 성향" type="inner">
                <Space direction="vertical">
                  <Text><strong>성향:</strong> {orientation.성향}</Text>
                  <Text><strong>가치 기준:</strong> {orientation.가치기준}</Text>
                  <Text><strong>관심 정책:</strong> {orientation.관심정책.join(', ')}</Text>
                  <Text><strong>투표 기준:</strong> {orientation.투표기준}</Text>
                </Space>
              </Card>
              <Button
                type="primary"
                block
                style={{ marginTop: 16 }}
                onClick={() => handleAutoRecommend(orientation)}
              >
                이 성향으로 후보자 추천받기
              </Button>
            </>
          )}
        </Space>
      </Card>
    );
  }

  if (entry === 'quick') {
    return <Card>빠른 결과 보기(준비중)</Card>;
  }

  return <Card>잘못된 접근입니다.</Card>;
};

export default GPTRecommendation; 