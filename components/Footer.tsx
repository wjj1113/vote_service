import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Footer = ({ onFeedbackClick }: { onFeedbackClick?: () => void }) => {
  const router = useRouter();

  const handleTabClick = (tab: 'service' | 'ai' | 'dashboard') => {
    router.push('/');
    setTimeout(() => {
      const tabButton = document.querySelector(`button[data-tab="${tab}"]`);
      if (tabButton) {
        (tabButton as HTMLButtonElement).click();
      }
    }, 100);
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">서비스</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleTabClick('service')}
                  className="hover:text-blue-400 transition-colors text-left w-full"
                >
                  후보자 비교
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabClick('ai')}
                  className="hover:text-blue-400 transition-colors text-left w-full"
                >
                  AI 추천
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleTabClick('dashboard')}
                  className="hover:text-blue-400 transition-colors text-left w-full"
                >
                  여론조사 대시보드
                </button>
              </li>
              <li>
                <a 
                  href="/info" 
                  className="text-gray-100 hover:text-blue-400 transition-colors text-left w-full block appearance-none bg-transparent border-none outline-none font-inherit cursor-pointer py-2 px-0 text-left no-underline"
                  style={{ display: 'block', width: '100%', textAlign: 'left', textDecoration: 'none' }}
                >
                  서비스 소개
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold mb-4">문의</h3>
            <p className="text-gray-400 mb-2">
              서비스 이용 중 문의사항이 있으시면<br />
              아래 이메일로 연락주세요.
            </p>
            {typeof onFeedbackClick === 'function' ? (
              <button
                onClick={onFeedbackClick}
                className="text-blue-400 hover:text-blue-300 font-medium text-lg transition-colors underline"
                type="button"
              >
                aipoliticslab@gmail.com
              </button>
            ) : (
              <a 
                href="mailto:aipoliticslab@gmail.com" 
                className="text-blue-400 hover:text-blue-300 font-medium text-lg transition-colors"
              >
                aipoliticslab@gmail.com
              </a>
            )}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2025 정치 성향 분석 서비스. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 