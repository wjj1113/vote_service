import React, { useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FeedbackModalContext } from '../components/Layout';
import ConsultationModal from '../components/ConsultationModal';

export default function Info() {
  const router = useRouter();
  const openFeedbackModal = useContext(FeedbackModalContext);
  const [consultModalOpen, setConsultModalOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>서비스 소개 - 2025 대선 정책 비교</title>
        <meta name="description" content="서비스 소개" />
      </Head>
      {/* 상단 탭 메뉴 + 뒤로가기 */}
      <div className="container mx-auto px-4 pt-8 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-8 w-full">
        <button
          onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2 rounded-none font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 border-b-2 border-transparent sm:border-none"
        >
          ← 뒤로가기
        </button>
        <button
          onClick={() => { window.location.href = '/'; }}
          className={`w-full sm:w-auto px-6 py-3 rounded-none font-medium transition-colors bg-black text-white border-b-2 border-transparent sm:border-none`}
          data-tab="service"
        >
          후보자 비교
        </button>
        <button
          onClick={() => { window.location.href = '/#ai'; }}
          className={`w-full sm:w-auto px-6 py-3 rounded-none font-medium transition-colors bg-black text-white border-b-2 border-transparent sm:border-none`}
          data-tab="ai"
        >
          AI 추천
        </button>
        <button
          onClick={() => { window.location.href = '/#dashboard'; }}
          className={`w-full sm:w-auto px-6 py-3 rounded-none font-medium transition-colors bg-black text-white border-b-2 border-transparent sm:border-none`}
          data-tab="dashboard"
        >
          여론조사 대시보드
        </button>
        <button
          onClick={() => { window.location.href = '/info'; }}
          className={`w-full sm:w-auto px-6 py-3 rounded-none font-medium transition-colors bg-gray-900 text-gray-100 border-b-2 border-transparent sm:border-none`}
          data-tab="info"
        >
          서비스 소개
        </button>
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white py-20 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'><path d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'0.5\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/></svg>")'}} />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-block bg-white bg-opacity-10 backdrop-blur px-6 py-3 rounded-full font-semibold border border-white border-opacity-30 mb-8">🗳️ 2025 대선 정보 서비스</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow">올바른 선택을 위한<br />중립적 정보 플랫폼</h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">정치적 중립을 지향하며, 민주주의 발전을 위해<br />객관적이고 신뢰할 수 있는 정보를 제공합니다</p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* 사명 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">🎯 우리의 사명</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">2025년 대선을 앞두고, 유권자들이 합리적이고 올바른 선택을 할 수 있도록 정치적으로 중립적인 정보를 제공하는 것이 우리의 사명입니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-2xl shadow p-8 border-t-4 border-black flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">🤝</span>
              <h3 className="text-xl font-semibold text-black mb-2">정치적 중립 지향</h3>
              <p className="text-gray-600">특정 후보나 정당을 지지하지 않으며, 모든 정치적 견해를 존중하고 공정하게 다룹니다. 편향 없는 시각으로 정보를 제공하여 유권자의 자율적 판단을 지원합니다.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-8 border-t-4 border-black flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">💙</span>
              <h3 className="text-xl font-semibold text-black mb-2">올바른 정치에 대한 바람</h3>
              <p className="text-gray-600">정치가 국민을 위해 봉사하고, 사회 발전에 기여하는 것이어야 한다고 믿습니다. 투명하고 책임감 있는 정치 문화가 정착되기를 바라며 이 서비스를 운영합니다.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-8 border-t-4 border-black flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-4">🎓</span>
              <h3 className="text-xl font-semibold text-black mb-2">유권자 교육과 참여</h3>
              <p className="text-gray-600">민주주의는 시민의 적극적인 참여로 완성됩니다. 정책에 대한 이해를 높이고, 정치에 대한 관심을 증진시켜 건전한 민주주의 문화 조성에 기여하고자 합니다.</p>
            </div>
          </div>
        </section>

        {/* 중립성 배너 */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl text-center py-10 px-6 mb-20">
          <h3 className="text-2xl font-bold text-yellow-800 mb-2">⚖️ 중립성 원칙</h3>
          <p className="text-yellow-900 font-medium">"우리는 특정 후보나 정당의 이익을 대변하지 않으며, 오직 유권자의 알 권리와 선택권을 보장하기 위해 존재합니다."</p>
        </div>

        {/* 투명성/데이터 */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl shadow p-10 border-l-8 border-black grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">📊 투명한 데이터 운영</h3>
              <p className="text-gray-600 mb-3">모든 정책 정보와 데이터는 공개된 자료를 바탕으로 수집되며, 출처를 명확히 표기합니다.</p>
              <p className="text-gray-600">데이터 수집과 분석 과정에서 편향을 배제하기 위해 체계적인 검증 절차를 거칩니다.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-black mb-3">📋 주요 데이터 출처</h4>
              <ul className="text-gray-600 space-y-2 list-disc list-inside">
                <li>각 후보 공식 홈페이지 및 공약집</li>
                <li>중앙선거관리위원회 등록 자료</li>
                <li>공개 토론회 및 언론 인터뷰</li>
                <li>공인 여론조사기관 결과</li>
                <li>정부 공식 통계 및 백서</li>
                <li>국정감사 및 국회 회의록</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 핵심 가치 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">🌟 핵심 가치</h2>
            <p className="text-gray-600 text-lg">우리가 지키고자 하는 가치들입니다</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition-transform border-2 border-transparent hover:border-black">
              <span className="text-4xl mb-4">🛡️</span>
              <h4 className="text-lg font-semibold text-black mb-2">신뢰성</h4>
              <p className="text-gray-600">검증된 정보만을 제공하며, 불확실한 내용은 명확히 표시합니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition-transform border-2 border-transparent hover:border-black">
              <span className="text-4xl mb-4">🔍</span>
              <h4 className="text-lg font-semibold text-black mb-2">투명성</h4>
              <p className="text-gray-600">정보의 출처와 수집 방법을 공개하여 신뢰할 수 있는 서비스를 제공합니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition-transform border-2 border-transparent hover:border-black">
              <span className="text-4xl mb-4">⚖️</span>
              <h4 className="text-lg font-semibold text-black mb-2">공정성</h4>
              <p className="text-gray-600">모든 후보를 동등하게 다루며, 편향 없는 정보를 제공합니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition-transform border-2 border-transparent hover:border-black">
              <span className="text-4xl mb-4">🔒</span>
              <h4 className="text-lg font-semibold text-black mb-2">개인정보 보호</h4>
              <p className="text-gray-600">사용자의 정치적 성향과 개인정보를 철저히 보호합니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition-transform border-2 border-transparent hover:border-black">
              <span className="text-4xl mb-4">📚</span>
              <h4 className="text-lg font-semibold text-black mb-2">교육적 가치</h4>
              <p className="text-gray-600">정치와 정책에 대한 이해를 높이는 교육적 콘텐츠를 제공합니다.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition-transform border-2 border-transparent hover:border-black">
              <span className="text-4xl mb-4">🌐</span>
              <h4 className="text-lg font-semibold text-black mb-2">접근성</h4>
              <p className="text-gray-600">누구나 쉽게 이용할 수 있는 직관적이고 포용적인 서비스를 구현합니다.</p>
            </div>
          </div>
        </section>

        {/* 이용 안내 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-black">⚠️ 이용 안내</h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-10 border-l-8 border-black grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-black">
              <h4 className="text-lg font-bold text-black mb-2">📖 정보 제공 목적</h4>
              <p className="text-gray-600">본 서비스는 정보 제공을 목적으로 하며, 특정 후보에 대한 투표를 강요하거나 유도하지 않습니다.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-green-600">
              <h4 className="text-lg font-bold text-green-700 mb-2">🧠 개인 판단 존중</h4>
              <p className="text-gray-600">최종 투표 결정은 유권자 개인의 가치관과 판단에 따라 이루어져야 합니다.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-yellow-500">
              <h4 className="text-lg font-bold text-yellow-700 mb-2">🔄 지속적 업데이트</h4>
              <p className="text-gray-600">정책과 공약은 변경될 수 있으므로, 공식 발표를 통해서도 확인하시기 바랍니다.</p>
            </div>
          </div>
        </section>

        {/* 피드백/문의 */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-2xl text-white text-center py-16 px-6 mt-20">
          <h3 className="text-2xl font-bold mb-4">💬 소통과 피드백</h3>
          <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">더 나은 서비스를 위해 여러분의 의견을 기다립니다. 정확하지 않은 정보나 개선사항이 있다면 언제든 알려주세요.</p>
          <button
            type="button"
            onClick={openFeedbackModal}
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold shadow hover:scale-105 transition-transform"
          >
            피드백 보내기
          </button>
        </div>

        {/* MVP 개발 서비스 CTA 섹션 */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl mt-20 px-6 py-16 overflow-hidden text-center shadow-xl">
          {/* 도트 패턴 배경 */}
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'dots\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'><circle cx=\'10\' cy=\'10\' r=\'1\' fill=\'rgba(255,255,255,0.1)\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23dots)\'/></svg>')`}} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-block bg-white bg-opacity-10 backdrop-blur px-6 py-3 rounded-full font-semibold border border-white border-opacity-30 mb-8">💡 검증된 빠른 MVP 개발</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">이런 서비스를 빠르게 만들고 싶으신가요?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 font-medium">
              <strong>바로 이 서비스가 실제 사례입니다!</strong><br />
              대선 토론 보다가 아이디어 떠올려서 <span className="font-bold text-yellow-300">3일 만에 완성</span>한 프로젝트
            </p>
            {/* 개발 스토리 */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
              <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-2xl px-6 py-4 min-w-[120px]">
                <span className="text-3xl mb-2">📺</span>
                <h4 className="font-bold text-lg mb-1">대선 토론 시청</h4>
                <p className="text-gray-200 text-sm">아이디어 발견</p>
              </div>
              <span className="text-3xl text-gray-400">→</span>
              <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-2xl px-6 py-4 min-w-[120px]">
                <span className="text-2xl mb-2 font-bold">1명</span>
                <h4 className="font-bold text-lg mb-1">원스톱 개발</h4>
                <p className="text-gray-200 text-sm">기획-개발-런칭</p>
              </div>
              <span className="text-3xl text-gray-400">→</span>
              <div className="flex flex-col items-center bg-white bg-opacity-10 rounded-2xl px-6 py-4 min-w-[120px]">
                <span className="text-2xl mb-2 font-bold">3일</span>
                <h4 className="font-bold text-lg mb-1">초고속 완성</h4>
                <p className="text-gray-200 text-sm">실제 서비스 오픈</p>
              </div>
            </div>
            {/* 서비스 특징 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="mvp-feature bg-white bg-opacity-10 backdrop-blur p-8 rounded-2xl border border-white border-opacity-20 hover:scale-105 transition-transform">
                <span className="feature-icon text-3xl mb-3 block">⚡</span>
                <h4 className="text-lg font-semibold mb-2 text-white">초고속 개발</h4>
                <p className="text-gray-200 text-sm">1주일 내 MVP 완성<br /><span className="text-yellow-300 text-xs italic">실제 정치 서비스 3일 개발</span></p>
              </div>
              <div className="mvp-feature bg-white bg-opacity-10 backdrop-blur p-8 rounded-2xl border border-white border-opacity-20 hover:scale-105 transition-transform">
                <span className="feature-icon text-3xl mb-3 block">🎯</span>
                <h4 className="text-lg font-semibold mb-2 text-white">원스톱 서비스</h4>
                <p className="text-gray-200 text-sm">기획-개발-마케팅-런칭<br /><span className="text-yellow-300 text-xs italic">한 명이 모든 과정 담당</span></p>
              </div>
              <div className="mvp-feature bg-white bg-opacity-10 backdrop-blur p-8 rounded-2xl border border-white border-opacity-20 hover:scale-105 transition-transform">
                <span className="feature-icon text-3xl mb-3 block">💻</span>
                <h4 className="text-lg font-semibold mb-2 text-white">완전한 서비스</h4>
                <p className="text-gray-200 text-sm">즉시 사용 가능한 수준<br /><span className="text-yellow-300 text-xs italic">바로 수익 창출 가능</span></p>
              </div>
            </div>
            {/* CTA 버튼 */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
              <a href="#" className="cta-primary bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-full shadow transition-colors text-lg" onClick={e => {e.preventDefault(); window.location.href = '/mvp';}}>🚀 자세한 사례 보기</a>
              <a href="#" className="cta-secondary bg-black bg-opacity-20 hover:bg-opacity-40 text-white font-semibold px-8 py-3 rounded-full border border-white border-opacity-30 transition-colors text-lg" onClick={e => {e.preventDefault(); setConsultModalOpen(true);}}>💬 무료 상담 신청</a>
            </div>
            {/* 연락처 */}
            <div className="mt-6 text-center">
              <p className="text-gray-300 mb-2">궁금한 점이 있으시면 언제든 연락하세요</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">📧</span>
                <a href="mailto:mvp@yourcompany.com" className="underline text-white font-medium">aipoliticslab@gmail.com</a>
              </div>
              <p className="text-gray-400 text-xs">24시간 내 답변 보장 | 첫 상담 무료</p>
            </div>
          </div>
        </section>
      </main>
      <ConsultationModal open={consultModalOpen} onClose={() => setConsultModalOpen(false)} />
    </div>
  );
} 