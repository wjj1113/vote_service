import React, { useState } from 'react';
import { FaTwitter, FaCopy } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface ShareView {
  유형: string;
  정치코드: string;
  관심사: string[];
  찔린한마디: string;
  AI반응: string;
  추천후보자?: string;
  이유한줄?: string;
}

interface SaveView {
  성향: string;
  가치기준: string;
  관심정책: string[];
  투표기준: string;
  추천후보자?: string;
  추천사유?: string;
  관련공약?: string[];
}

interface CandidateInfo {
  name: string;
  party: string;
  imageUrl: string;
  matchScore?: number;
  slogan?: string;
}

interface ResultTabsProps {
  shareView?: ShareView;
  saveView?: SaveView;
  candidate?: CandidateInfo;
  onShare?: (platform: 'twitter' | 'threads' | 'kakaotalk' | 'copy') => void;
  userAgreement?: null | boolean;
  onAgreement?: (agrees: boolean) => void;
}

const ResultTabs: React.FC<ResultTabsProps> = ({ shareView, saveView, candidate, onShare, userAgreement, onAgreement }) => {
  const [view, setView] = useState<'share' | 'save'>('share');

  return (
    <>
      <div className="flex justify-center mb-6 gap-2">
        <button
          onClick={() => setView('share')}
          className={`px-6 py-2 rounded-t-lg font-bold ${view === 'share' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          공유용
        </button>
        <button
          onClick={() => setView('save')}
          className={`px-6 py-2 rounded-t-lg font-bold ${view === 'save' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          내 정보
        </button>
      </div>
      <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
        {view === 'share' && shareView && (
          <div className="p-8">
            {candidate && (
              <div className="flex flex-col md:flex-row items-center mb-8">
                <div className="relative mb-6 md:mb-0 md:mr-8">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                  </div>
                  {candidate.matchScore !== undefined && (
                    <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {candidate.matchScore}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">{candidate.name}</h2>
                  <p className="text-lg text-blue-600 mb-2">{candidate.party}</p>
                  {candidate.slogan && <p className="text-gray-600 italic">"{candidate.slogan}"</p>}
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-4">{shareView.유형}</h2>
            <div className="mb-2 text-blue-700 font-semibold">정치 코드: {shareView.정치코드}</div>
            <div className="mb-2">관심사: {shareView.관심사.join(', ')}</div>
            <div className="mb-2 italic text-gray-600">찔린 한마디: {shareView.찔린한마디}</div>
            <div className="mb-4 font-semibold text-blue-600">AI 반응: {shareView.AI반응}</div>
            {shareView.이유한줄 && <div className="mb-2 text-gray-700">이유 한 줄 요약: {shareView.이유한줄}</div>}
            {onShare && (
              <div className="flex justify-center space-x-4 mt-8">
                <button className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600" onClick={() => onShare('twitter')}><FaTwitter size={24} /></button>
                <button className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800" onClick={() => onShare('threads')}><SiThreads size={24} /></button>
                <button className="w-12 h-12 rounded-full bg-yellow-400 text-white flex items-center justify-center hover:bg-yellow-500" onClick={() => onShare('kakaotalk')}><RiKakaoTalkFill size={24} /></button>
                <button className="w-12 h-12 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600" onClick={() => onShare('copy')}><FaCopy size={24} /></button>
              </div>
            )}
          </div>
        )}
        {view === 'save' && saveView && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">내 정치 성향 상세 정보</h2>
            <div className="mb-2">성향: {saveView.성향}</div>
            <div className="mb-2">가치기준: {saveView.가치기준}</div>
            <div className="mb-2">관심정책: {saveView.관심정책.join(', ')}</div>
            <div className="mb-2">투표기준: {saveView.투표기준}</div>
            {saveView.추천후보자 && <div className="mt-4 font-bold">추천 후보자: {saveView.추천후보자}</div>}
            {saveView.추천사유 && <div className="mb-2">추천 사유: {saveView.추천사유}</div>}
            {saveView.관련공약 && (
              <div className="mb-2">관련 공약:
                <ul className="list-disc ml-6">
                  {saveView.관련공약.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {/* 동의 여부 (공유형에서만) */}
      {view === 'share' && onAgreement && userAgreement === null && (
        <div className="bg-blue-50 p-6 rounded-lg text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            이 후보자가 내 성향과 일치한다고 생각하시나요?
          </h3>
          <div className="flex justify-center space-x-4">
            <button 
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              onClick={() => onAgreement(true)}
            >
              네, 일치해요
            </button>
            <button 
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={() => onAgreement(false)}
            >
              아니요, 다른 것 같아요
            </button>
          </div>
        </div>
      )}
      {view === 'share' && userAgreement !== null && (
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
    </>
  );
};

export default ResultTabs; 