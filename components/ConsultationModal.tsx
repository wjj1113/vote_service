import React, { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CONSULT_TYPES = [
  '사업 아이디어 검토',
  'MVP 개발',
  '마케팅/브랜딩 전략',
  '투자 유치 준비',
];
const STAGES = [
  '아이디어만 있음',
  '기획서 있음',
  'MVP 있음',
  '이미 운영 중',
];

export default function ConsultationModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [consultType, setConsultType] = useState('');
  const [consultMemo, setConsultMemo] = useState('');
  const [stage, setStage] = useState<string[]>([]);
  const [concern, setConcern] = useState('');
  const [timePref, setTimePref] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleStageChange = (val: string) => {
    setStage((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          consultType,
          consultMemo,
          stage: stage.join(', '),
          concern,
          timePref,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
      } else {
        setError(data.error || '신청에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-0 relative animate-fadeInUp mx-2"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* 상단: 닫기 버튼, 안내문구 */}
        <div className="relative px-4 pt-4 pb-2">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl" onClick={onClose}>&times;</button>
          <div className="text-base sm:text-lg font-bold text-center text-gray-800 mb-2">
            아이디어만 있어도 괜찮습니다.<br />
            빠르게 실행하고 싶은 분들을 위해 1:1 무료 상담을 도와드려요.
          </div>
        </div>
        {/* 스크롤 영역: 입력 폼 */}
        <div className="overflow-y-auto px-4 pb-4" style={{ flex: 1, minHeight: 0 }}>
          {done ? (
            <div className="text-center py-12 sm:py-16">
              <div className="text-3xl mb-4">✅</div>
              <div className="text-xl font-bold mb-2 text-gray-800">상담 신청이 완료되었습니다!</div>
              <div className="text-gray-500 mb-6">빠른 시일 내에 연락드리겠습니다.<br/>감사합니다.</div>
              <button className="mt-4 px-6 py-2 rounded-full bg-black text-white font-semibold" onClick={onClose}>닫기</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">이름 / 닉네임 <span className="text-red-500">*</span></label>
                <input className="w-full border rounded px-3 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" value={name} onChange={e => setName(e.target.value)} required maxLength={30} />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">이메일 또는 연락처 <span className="text-red-500">*</span></label>
                <input className="w-full border rounded px-3 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" value={contact} onChange={e => setContact(e.target.value)} required maxLength={50} />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">희망 상담 내용 <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {CONSULT_TYPES.map(type => (
                    <label key={type} className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${consultType === type ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <input type="radio" name="consultType" value={type} checked={consultType === type} onChange={() => setConsultType(type)} className="hidden" />
                      {type}
                    </label>
                  ))}
                </div>
                <textarea className="w-full border rounded px-3 py-2 mt-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="상담에 대해 간단히 메모해 주세요 (선택)" value={consultMemo} onChange={e => setConsultMemo(e.target.value)} rows={2} maxLength={200} />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">현재 준비 단계 (선택)</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map(s => (
                    <label key={s} className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${stage.includes(s) ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <input type="checkbox" value={s} checked={stage.includes(s)} onChange={() => handleStageChange(s)} className="hidden" />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">가장 고민되는 점 (선택)</label>
                <textarea className="w-full border rounded px-3 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="ex. 시장 진입이 어려움, 개발 리소스 부족 등" value={concern} onChange={e => setConcern(e.target.value)} rows={2} maxLength={200} />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">상담 희망 시간대 (선택)</label>
                <input className="w-full border rounded px-3 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="평일/주말, 오전/오후 등" value={timePref} onChange={e => setTimePref(e.target.value)} maxLength={50} />
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <button type="submit" className="w-full py-3 rounded-full bg-black text-white font-bold text-lg mt-2 disabled:opacity-50" disabled={loading}>
                {loading ? '신청 중...' : '🚀 지금 바로 무료 상담 신청'}
              </button>
              <div className="text-center text-xs text-gray-400 mt-2">📩 아이디어만 있어도 괜찮아요! 1분 신청</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 