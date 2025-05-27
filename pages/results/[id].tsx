import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GA_EVENT_DETAILED } from '../../lib/gtag';
import { FaTwitter, FaCopy } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import { RiKakaoTalkFill } from 'react-icons/ri';
import Script from 'next/script';

interface AnalysisResult {
  politicalOrientation: {
    tendency: string;
    valueBase: string;
    interests: string[];
    voteBase: string;
  };
  scores: {
    progressiveConservative: number;
    economicFreedomControl: number;
    socialFreedomControl: number;
    environmentIndustry: number;
    welfareEfficiency: number;
  };
  confidence: number;
  reasoning: string;
  recommendation: {
    name: string;
    party: string;
    imageUrl: string;
    matchScore: number;
    recommendation: string;
    matchingPoints: string[];
    differences: string[];
    detailedAnalysis: {
      policyMatch: { score: number; reason: string };
      valueMatch: { score: number; reason: string };
      demographicMatch: { score: number; reason: string };
      leadershipMatch: { score: number; reason: string };
    };
  } | null;
}

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">맞춤형 후보자를 찾는 중...</h2>
        <p className="text-gray-600">
          당신의 정치 성향과 가치관을 분석하여 가장 적합한 후보자를 매칭하고 있습니다.
        </p>
        <div className="mt-6 bg-gray-900 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 rounded-full bg-black mr-2"></div>
            <p className="text-sm text-gray-700">정치 성향 분석 중...</p>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 rounded-full bg-black mr-2"></div>
            <p className="text-sm text-gray-700">후보자 데이터 검색 중...</p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-black mr-2"></div>
            <p className="text-sm text-gray-700">최적의 매칭 계산 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// CandidateResult 컴포넌트의 props 타입 정의
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
    keyPolicies: {
      title: string;
      description: string;
      details: {
        goal: string;
        implementation: string;
        duration: string;
        budget: string;
      };
    }[];
    userType: string;
    politicalValues: {
      leaning: string;
      coreValues: string[];
      policyInterests: string[];
      votingCriterion: string;
    };
    detailedAnalysis: {
      policyMatch: { score: number; reason: string };
      valueMatch: { score: number; reason: string };
      demographicMatch: { score: number; reason: string };
      leadershipMatch: { score: number; reason: string };
    };
  };
}

const CandidateResult: React.FC<CandidateResultProps> = ({ resultData }) => {
  const router = useRouter();
  const { id } = router.query;
  const [userAgreement, setUserAgreement] = useState<boolean | null>(null);
  const [kakaoInitialized, setKakaoInitialized] = useState(false);

  useEffect(() => {
    // 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
      setKakaoInitialized(true);
    }
  }, []);

  const handleAgreement = (agrees: boolean) => {
    setUserAgreement(agrees);
    console.log('사용자 동의 여부:', agrees);
  };

  const handleShare = async (platform: 'twitter' | 'threads' | 'kakaotalk' | 'copy') => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/results/${id}`;
    const shareText = `AI가 분석한 나의 정치 성향과 가장 잘 맞는 후보자: ${resultData.recommendedCandidate.name}\n\n#정치성향분석 #AI분석 #대선2024`;

    try {
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
          break;
        case 'threads':
          window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
          break;
        case 'kakaotalk':
          if (window.Kakao && window.Kakao.Share) {
            window.Kakao.Share.sendDefault({
              objectType: 'feed',
              content: {
                title: 'AI 정치 성향 분석 결과',
                description: `나와 가장 잘 맞는 후보자: ${resultData.recommendedCandidate.name}`,
                imageUrl: resultData.recommendedCandidate.image,
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
              social: {
                likeCount: 0,
                commentCount: 0,
                sharedCount: 0,
              },
              buttons: [
                {
                  title: '결과 보기',
                  link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl,
                  },
                },
              ],
            });
          } else {
            alert('카카오톡 공유가 지원되지 않습니다. 잠시 후 다시 시도해주세요.');
          }
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
          alert('결과가 클립보드에 복사되었습니다!');
          break;
      }
      GA_EVENT_DETAILED(`share_${platform}`);
    } catch (error) {
      console.error('공유 중 오류 발생:', error);
      alert('공유하기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 이미지 로딩 실패 시 대체 이미지 표시
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const candidateName = e.currentTarget.alt;
    console.log('이미지 로딩 실패:', candidateName);
    console.log('현재 이미지 URL:', e.currentTarget.src);
    
    // 후보자 이름으로 매핑된 URL이 있는지 확인
    const mappedUrl = candidateImageUrls[candidateName];
    if (mappedUrl) {
      console.log('매핑된 URL로 재시도:', mappedUrl);
      e.currentTarget.src = mappedUrl;
    } else {
      console.log('기본 이미지로 대체');
      e.currentTarget.src = '/images/default-candidate.png';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 결과 헤더 */}
          <div className="bg-black p-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">당신에게 추천하는 후보자</h1>
            <p className="text-lg opacity-90">AI가 분석한 정치 성향과 가치관에 기반한 추천입니다</p>
          </div>
          
          {/* 후보자 프로필 */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center mb-8">
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={resultData.recommendedCandidate.image} 
                    alt={resultData.recommendedCandidate.name} 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                    {resultData.recommendedCandidate.matchScore}%
                  </div>
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{resultData.recommendedCandidate.name}</h2>
                <p className="text-lg text-black mb-2">{resultData.recommendedCandidate.party}</p>
                <p className="text-gray-600 italic">"{resultData.recommendedCandidate.slogan}"</p>
              </div>
            </div>
            
            {/* 추천 이유 */}
            <div className="bg-gray-900 p-6 rounded-lg mb-8">
              <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                추천 이유
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {resultData.recommendationReason}
              </p>
            </div>
            
            {/* 사용자 정치 성향 요약 */}
            <div className="bg-gray-900 p-6 rounded-lg mb-8">
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
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-black hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-900 font-bold mr-3 mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{policy.title}</h4>
                        <p className="text-gray-600 mb-2">{policy.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><span className="font-medium">목표:</span> {policy.details.goal}</p>
                          <p><span className="font-medium">이행방법:</span> {policy.details.implementation}</p>
                          <p><span className="font-medium">기간:</span> {policy.details.duration}</p>
                          <p><span className="font-medium">예산:</span> {policy.details.budget}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 다른 후보와 비교 버튼 */}
            <div className="text-center mb-8">
              <button 
                className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                onClick={() => router.push('/#service')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                다른 후보와 비교하기
              </button>
            </div>
            
            {/* 동의 여부 */}
            {userAgreement === null && (
              <div className="bg-gray-900 p-6 rounded-lg text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  이 후보자가 내 성향과 일치한다고 생각하시나요?
                </h3>
                <div className="flex justify-center space-x-4">
                  <button 
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors duration-200"
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
              <div className="bg-gray-900 p-6 rounded-lg text-center mb-8">
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
                  className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-900"
                  onClick={() => handleShare('twitter')}
                >
                  <FaTwitter className="w-6 h-6" />
                </button>
                
                <button 
                  className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-900"
                  onClick={() => handleShare('threads')}
                >
                  <SiThreads className="w-6 h-6" />
                </button>
                
                <button 
                  className="w-12 h-12 rounded-full bg-yellow-400 text-white flex items-center justify-center hover:bg-yellow-500"
                  onClick={() => handleShare('kakaotalk')}
                >
                  <RiKakaoTalkFill className="w-6 h-6" />
                </button>
                
                <button 
                  className="w-12 h-12 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600"
                  onClick={() => handleShare('copy')}
                >
                  <FaCopy className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// HTML 태그 제거 함수 추가
const stripHtmlTags = (html: string) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// 후보자별 이미지 URL 매핑
const candidateImageUrls: { [key: string]: string } = {
  '이재명': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG',
  '김문수': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG',
  '이준석': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153689/gicho/thumbnail.100153689.JPG',
  '권영국': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153725/gicho/thumbnail.100153725.JPG',
  '황교안': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG',
  '송진호': 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153722/gicho/thumbnail.100153722.JPG'
};

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateData, setCandidateData] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;

      try {
        // URL에서 결과 데이터 확인
        const resultData = router.query.result;
        if (resultData && typeof resultData === 'string') {
          const parsedResult = JSON.parse(resultData);
          setResult(parsedResult);

          // 후보자 정보 가져오기
          if (parsedResult.recommendation?.name) {
            const candidateResponse = await fetch(`/api/candidates/${encodeURIComponent(parsedResult.recommendation.name)}`);
            const candidateData = await candidateResponse.json();
            
            if (candidateData.success) {
              setCandidateData(candidateData.candidate);
            } else {
              console.error('후보자 정보를 가져오는데 실패했습니다:', candidateData.message);
            }
          }
          
          setLoading(false);
          return;
        }

        // 결과 데이터가 없는 경우 API 호출
        const response = await fetch(`/api/analysis/${id}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '분석 결과를 불러오는데 실패했습니다.');
        }
        
        setResult(data.result);

        // 후보자 정보 가져오기
        if (data.result.recommendation?.name) {
          const candidateResponse = await fetch(`/api/candidates/${encodeURIComponent(data.result.recommendation.name)}`);
          const candidateData = await candidateResponse.json();
          
          if (candidateData.success) {
            setCandidateData(candidateData.candidate);
          } else {
            console.error('후보자 정보를 가져오는데 실패했습니다:', candidateData.message);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '분석 결과를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, router.query]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">오류 발생</h2>
      <p className="text-gray-600 mb-8">{error}</p>
      <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={() => router.back()}>이전 화면으로</button>
    </div>;
  }

  if (!result || !result.recommendation) {
    return <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">추천 결과가 없습니다</h2>
      <p className="text-gray-600 mb-8">정치 성향 분석은 완료되었으나, 추천 후보자를 찾지 못했습니다.</p>
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={() => router.back()}>이전 화면으로</button>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg" onClick={() => router.push('/#ai')}>정밀 분석 하러 가기</button>
      </div>
    </div>;
  }

  // API 데이터를 CandidateResult 컴포넌트에 맞게 변환
  const resultData = {
    recommendedCandidate: {
      name: result.recommendation?.name || '',
      party: result.recommendation?.party || '',
      image: candidateImageUrls[stripHtmlTags(result.recommendation?.name || '').replace(/\s/g, '')] || result.recommendation?.imageUrl || '/images/default-candidate.png',
      matchScore: result.recommendation?.matchScore || 0,
      slogan: result.recommendation?.recommendation || ''
    },
    recommendationReason: result.recommendation?.recommendation || '',
    keyPolicies: (result.recommendation?.matchingPoints || []).map((point, index) => ({
      title: `핵심 공약 ${index + 1}`,
      description: point,
      details: {
        goal: result.recommendation?.detailedAnalysis?.policyMatch?.reason || '',
        implementation: result.recommendation?.detailedAnalysis?.valueMatch?.reason || '',
        duration: result.recommendation?.detailedAnalysis?.demographicMatch?.reason || '',
        budget: result.recommendation?.detailedAnalysis?.leadershipMatch?.reason || ''
      }
    })),
    userType: 'gpt_new',
    politicalValues: {
      leaning: result.politicalOrientation.tendency,
      coreValues: [result.politicalOrientation.valueBase],
      policyInterests: result.politicalOrientation.interests,
      votingCriterion: result.politicalOrientation.voteBase
    },
    detailedAnalysis: result.recommendation?.detailedAnalysis || {
      policyMatch: { score: 0, reason: '' },
      valueMatch: { score: 0, reason: '' },
      demographicMatch: { score: 0, reason: '' },
      leadershipMatch: { score: 0, reason: '' }
    }
  };

  return (
    <>
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
          }
        }}
      />
      <CandidateResult resultData={resultData} />
    </>
  );
} 