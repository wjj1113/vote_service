import React, { useState } from 'react';

// Kakao 타입 선언
declare global {
  interface Window {
    Kakao?: any;
  }
}
import { GA_EVENT_DETAILED } from '../lib/gtag';

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
    keyPolicies: { title: string; description: string }[];
    userType: string;
    politicalValues: {
      leaning: string;
      coreValues: string[];
      policyInterests: string[];
      votingCriterion: string;
    };
  };
}

const CandidateResult: React.FC<CandidateResultProps> = ({ resultData }) => {
  const [userAgreement, setUserAgreement] = useState<null | boolean>(null);

  const handleAgreement = (agrees: boolean) => {
    setUserAgreement(agrees);
    // 서버 저장 로직 등
  };

  const handleShare = async (platform: 'twitter' | 'threads' | 'kakaotalk' | 'copy') => {
    const shareText = `추천 후보자: ${resultData.recommendedCandidate.name}\n추천 사유: ${resultData.recommendationReason}`;
    const shareUrl = window.location.href;
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
    } else if (platform === 'threads') {
      window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
    } else if (platform === 'kakaotalk') {
      if (window.Kakao && window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
          objectType: 'text',
          text: shareText + '\n' + shareUrl,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        });
      } else {
        alert('카카오톡 공유가 지원되지 않습니다.');
      }
    } else {
      await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 py-10 px-4 sm:px-6 lg:px-8">
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
                  <img src={resultData.recommendedCandidate.image} alt={resultData.recommendedCandidate.name} className="w-full h-full object-cover" />
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
                        <p className="text-gray-600">{policy.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 동의 여부 */}
            {userAgreement === null && (
              <div className="bg-gray-900 p-6 rounded-lg text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  이 후보자가 내 성향과 일치한다고 생각하시나요?
                </h3>
                <div className="flex flex-col gap-4 items-center w-full max-w-xs mx-auto">
                  <button
                    className="w-full py-4 bg-black text-white rounded-lg text-lg font-bold hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => { GA_EVENT_DETAILED('click_agree_yes'); handleAgreement(true); }}
                  >
                    네, 일치해요
                  </button>
                  <button
                    className="w-full py-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-lg font-bold hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => { GA_EVENT_DETAILED('click_agree_no'); handleAgreement(false); }}
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
                  className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
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

export default CandidateResult; 