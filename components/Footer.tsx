import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">투표 서비스</h3>
            <p className="text-gray-300">
              정치 성향 분석과 투표 의향을 파악하는 서비스입니다.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">문의하기</h3>
            <a 
              href="mailto:aipoliticslab@gmail.com" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              aipoliticslab@gmail.com
            </a>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/survey" className="text-gray-300 hover:text-white">
                  성향 분석
                </Link>
              </li>
              <li>
                <Link href="/recommendation" className="text-gray-300 hover:text-white">
                  추천 후보
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} 투표 서비스. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 