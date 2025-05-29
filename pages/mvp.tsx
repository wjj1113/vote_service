import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import ConsultationModal from '../components/ConsultationModal';

export default function MVPPage() {
  // 애니메이션 효과
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const processRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, observerOptions);
    // features
    featureRefs.current.forEach((el) => {
      if (el) {
        el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
        observer.observe(el);
      }
    });
    // process
    processRefs.current.forEach((el) => {
      if (el) {
        el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
        observer.observe(el);
      }
    });
    // story
    if (storyRef.current) {
      storyRef.current.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
      observer.observe(storyRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // CTA 버튼 핸들러
  const handleMeeting = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setModalOpen(true);
  };
  const handlePortfolio = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert('포트폴리오 페이지로 이동합니다.\n\n✅ 대선 정책 비교 서비스 (3일 개발)\n✅ 기타 빠른 MVP 사례들\n✅ 개발 과정 상세 설명');
    // window.open('/portfolio', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>빠른 MVP 개발 서비스</title>
        <meta name="description" content="빠른 MVP 개발 서비스 소개" />
      </Head>
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center min-h-screen py-16 overflow-hidden">
        {/* 도트 패턴 배경 */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'dots\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'><circle cx=\'10\' cy=\'10\' r=\'1\' fill=\'rgba(255,255,255,0.1)\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23dots)\'/></svg>')`}} />
        <div className="container mx-auto px-4 relative z-10 w-full">
          <div className="max-w-4xl mx-auto w-full">
            {/* 히어로 */}
            <div className="mb-12 text-center mvp-hero">
              <div className="inline-block bg-white bg-opacity-10 backdrop-blur px-6 py-3 rounded-full font-semibold border border-white border-opacity-30 mb-8">💡 검증된 빠른 MVP 개발</div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-fadeInUp">이런 서비스를 빠르게 만들고 싶으신가요?</h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto animate-fadeInUp delay-200">
                정치 정보 서비스부터 다양한 분야의 MVP까지<br />
                <span className="font-bold">기획부터 개발까지 원스톱</span>으로 해드립니다
              </p>
            </div>
            {/* 실제 성공 사례 */}
            <div ref={storyRef} className="success-story bg-white bg-opacity-10 backdrop-blur border-2 border-white border-opacity-20 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-8 text-6xl opacity-20 pointer-events-none select-none">⚡</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400 text-center">🎯 실제 개발 사례: 현재 서비스</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-6">
                <div className="story-item text-center p-4 bg-gray-900 bg-opacity-60 rounded-xl border border-white border-opacity-10">
                  <span className="story-number text-3xl md:text-4xl text-white">📺</span>
                  <div className="story-label text-white font-medium mt-2 text-sm md:text-base">대선 토론 시청 중<br />아이디어 발견</div>
                </div>
                <div className="story-item text-center p-4 bg-gray-900 bg-opacity-60 rounded-xl border border-white border-opacity-10">
                  <span className="story-number text-2xl md:text-3xl font-bold text-yellow-300">1명</span>
                  <div className="story-label text-white font-medium mt-2 text-sm md:text-base">기획·개발·마케팅<br />올인원 담당</div>
                </div>
                <div className="story-item text-center p-4 bg-gray-900 bg-opacity-60 rounded-xl border border-white border-opacity-10">
                  <span className="story-number text-2xl md:text-3xl font-bold text-yellow-300">3일</span>
                  <div className="story-label text-white font-medium mt-2 text-sm md:text-base">아이디어부터<br />런칭까지</div>
                </div>
                <div className="story-item text-center p-4 bg-gray-900 bg-opacity-60 rounded-xl border border-white border-opacity-10">
                  <span className="story-number text-3xl md:text-4xl text-white">🚀</span>
                  <div className="story-label text-white font-medium mt-2 text-sm md:text-base">즉석 배포<br />서비스 오픈</div>
                </div>
              </div>
              <div className="story-highlight bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent font-bold text-base md:text-lg text-center mt-4">
                "대선 토론을 보다가 '이런 게 있으면 좋겠다' 싶어서 바로 만들기 시작했습니다.<br />1주일도 안 걸려서 완성된 실제 케이스입니다."
              </div>
            </div>
            {/* 후기 */}
            <div className="testimonial bg-white bg-opacity-10 border-l-4 border-yellow-400 rounded-xl p-6 md:p-8 mb-12 italic text-gray-200 text-center text-base md:text-lg">
              "아이디어가 떠오르는 순간부터 실제 사용자들이 이용할 수 있는 서비스까지, 이 속도가 바로 우리의 차별화 포인트입니다."
            </div>
            {/* 서비스 특징 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                {icon: '⚡', title: '초고속 개발', desc: '아이디어부터 런칭까지 1-2주 내 완성\n실제로 정치 서비스를 6일 만에 개발한 경험'},
                {icon: '🎯', title: '원스톱 서비스', desc: '기획-개발-마케팅-런칭까지\n한 명의 전문가가 모든 과정을 담당'},
                {icon: '💻', title: '풀스택 개발', desc: '프론트엔드부터 백엔드, 배포까지\n완전한 서비스로 제공'},
                {icon: '📈', title: '검증된 결과', desc: '실제 유저가 사용하는 라이브 서비스\n바로 수익 창출 가능한 수준'},
              ].map((f, i) => (
                <div key={f.title} ref={el => { featureRefs.current[i] = el; }} className="mvp-feature bg-white bg-opacity-10 backdrop-blur p-8 rounded-2xl border border-white border-opacity-20 hover:scale-105 transition-transform text-center">
                  <span className="feature-icon text-4xl mb-4 block">{f.icon}</span>
                  <h4 className="text-lg font-semibold mb-3 text-white">{f.title}</h4>
                  <p className="text-gray-200 text-base whitespace-pre-line">{f.desc}</p>
                </div>
              ))}
            </div>
            {/* 개발 프로세스 */}
            <div className="process-section bg-white bg-opacity-5 rounded-2xl p-4 sm:p-8 md:p-12 mb-16 border border-white border-opacity-10">
              <h3 className="process-title text-xl sm:text-2xl md:text-3xl font-bold mb-8 text-black text-center">🛠️ 개발 프로세스</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[
                  {num: '1', title: '아이디어 정리', desc: '30분 통화로 핵심 기능 정의'},
                  {num: '2', title: '빠른 기획', desc: '1일 내 와이어프레임 완성'},
                  {num: '3', title: '개발 시작', desc: '3-5일 집중 개발'},
                  {num: '4', title: '배포 & 런칭', desc: '즉시 사용 가능한 서비스'},
                ].map((p, i) => (
                  <div key={p.num} ref={el => { processRefs.current[i] = el; }} className="process-step text-center relative bg-gray-900 bg-opacity-60 rounded-xl p-4 sm:p-6 md:p-8 mx-1 sm:mx-2">
                    <div className="step-number w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-4 border-white border-opacity-20 text-lg sm:text-xl font-bold text-white">{p.num}</div>
                    <h5 className="text-base sm:text-lg font-semibold mb-2 text-white">{p.title}</h5>
                    <p className="text-white text-xs sm:text-sm">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* CTA 버튼 */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12 mb-16 mvp-cta-buttons">
              <a href="#" className="cta-primary bg-gradient-to-r from-white to-gray-100 text-gray-900 font-bold px-8 py-4 rounded-full shadow transition-all text-lg border-2 border-transparent hover:-translate-y-2 hover:shadow-xl" onClick={handleMeeting}>🚀 무료 상담 미팅 신청</a>
            </div>
            {/* 연락처 */}
            <div className="contact-info mt-12 text-center">
              <p className="text-gray-300 mb-3">또는 직접 연락하세요</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl">📧</span>
                <a href="mailto:aipoliticslab@gmail.com" className="underline text-white font-medium bg-white bg-opacity-10 px-6 py-2 rounded-full border border-white border-opacity-20 hover:bg-opacity-20 transition-all">aipoliticslab@gmail.com</a>
              </div>
              <p className="text-gray-400 text-xs italic">24시간 내 답변 보장 | 첫 상담 무료</p>
            </div>
          </div>
        </div>
        <ConsultationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </section>
      <style jsx>{`
        .mvp-hero h1, .mvp-hero p { animation: fadeInUp 1s ease-out; }
        .mvp-hero p { animation-delay: 0.2s; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 