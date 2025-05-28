import React, { useEffect, useState, useCallback } from 'react';
import { saveEmail } from '../utils/email';

const GROUP_CHAT_URL = 'https://open.kakao.com/o/your-group-link'; // 실제 단톡방 링크로 교체

const POPUP_SHOWN_KEY = 'popup_shown';

interface PopupProps {
  forceOpen?: boolean; // 결과페이지에서 바로 노출
}

const Popup: React.FC<PopupProps> = ({ forceOpen = false }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 팝업 노출 조건
  useEffect(() => {
    if (localStorage.getItem(POPUP_SHOWN_KEY)) return;
    if (forceOpen) {
      setOpen(true);
      localStorage.setItem(POPUP_SHOWN_KEY, 'true');
      return;
    }
    // 스크롤 50% 이상
    const onScroll = () => {
      if (window.scrollY > (document.body.scrollHeight - window.innerHeight) / 2) {
        setOpen(true);
        localStorage.setItem(POPUP_SHOWN_KEY, 'true');
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll);
    // 체류 30초 이상
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(POPUP_SHOWN_KEY, 'true');
      window.removeEventListener('scroll', onScroll);
    }, 30000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [forceOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await saveEmail(email);
      setSubmitted(true);
    } catch (err) {
      setError('이메일 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 md:p-8 relative animate-fadeIn">
        <button 
          type="button" 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" 
          onClick={() => setOpen(false)} 
          aria-label="닫기"
        >
          ✕
        </button>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">🗳️ 대선, 그 다음이 더 중요합니다</h2>
              <p className="text-gray-700 mb-4">정책 이행, 사회 변화… <span className="font-semibold">매주 요약해드립니다</span></p>
            </div>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="이메일 주소 입력"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <div className="flex flex-col md:flex-row gap-3 w-full">
              <button
                type="submit"
                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-900 transition disabled:opacity-60"
                disabled={loading || !email}
              >
                리포트 받아보기
              </button>
              <a
                href={GROUP_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-yellow-400 text-black rounded-lg font-semibold text-lg text-center hover:bg-yellow-300 transition flex items-center justify-center"
                style={{ minWidth: 0 }}
              >
                실시간 소식방 초대
              </a>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="text-gray-500 text-sm mt-2 flex flex-col items-center">
              <span>✉️ 스팸 없이, 관심 정책만 골라서 전해드려요</span>
              <span className="underline mt-1 cursor-not-allowed select-none opacity-70">개인정보는 리포트 발송 외에 사용되지 않아요</span>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-2xl font-bold mb-3">🎉 리포트 구독 완료! 매주 알림드릴게요.</h2>
            <p className="mb-6 text-center">👉 실시간 소식은 <a href={GROUP_CHAT_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">토론방에서 같이 보시겠어요?</a></p>
            <a
              href={GROUP_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-yellow-400 text-black rounded-lg font-semibold text-lg text-center hover:bg-yellow-300 transition"
            >
              오픈채팅방 참여하기
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup; 