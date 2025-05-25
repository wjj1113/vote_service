import React, { useState } from 'react';

const initialState = {
  vote_intent: '',
  supported_party: '',
  key_issue: '',
  region: '',
  age_group: '',
  gender: '',
};

const partyOptions = [
  '더불어민주당 (이재명)',
  '국민의힘 (김문수)',
  '개혁신당 (이준석)',
  '민주노동당 (권영국)',
  '무소속 (황교안)',
  '무소속 (송진호)',
  '지지하는 후보는 있지만 정당은 없음',
  '지지 정당 없음 / 모르겠음',
];

const issueOptions = [
  '경제', '복지', '공정', '안보', '기후위기', '정치개혁', '청년정책', '기타 / 잘 모르겠다'
];

const regionOptions = [
  '서울', '경기 / 인천', '강원', '충청', '전라', '경상', '제주', '해외'
];

const ageOptions = [
  '18–29세', '30대', '40대', '50대', '60세 이상'
];

const genderOptions = [
  '남성', '여성', '선택하지 않음'
];

export default function VoteSurvey({ onSubmit }: { onSubmit: (answers: typeof initialState) => void }) {
  const [answers, setAnswers] = useState(initialState);

  const handleChange = (key: keyof typeof initialState, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto p-8 bg-white rounded shadow space-y-6">
      <div>
        <label className="block font-semibold mb-2">1. 다가오는 대선에서 투표하실 계획이 있으신가요?</label>
        {['반드시 투표할 것이다', '가능하면 투표할 것이다', '아마 투표하지 않을 것이다', '투표하지 않을 것이다'].map(opt => (
          <label key={opt} className="block">
            <input type="radio" name="vote_intent" value={opt} checked={answers.vote_intent === opt} onChange={e => handleChange('vote_intent', e.target.value)} required />
            {opt}
          </label>
        ))}
      </div>
      <div>
        <label className="block font-semibold mb-2">2. 현재 지지하는 정당이 있으신가요?</label>
        {partyOptions.map(opt => (
          <label key={opt} className="block">
            <input type="radio" name="supported_party" value={opt} checked={answers.supported_party === opt} onChange={e => handleChange('supported_party', e.target.value)} required />
            {opt}
          </label>
        ))}
      </div>
      <div>
        <label className="block font-semibold mb-2">3. 정치에서 가장 중요하게 생각하는 이슈는 무엇인가요?</label>
        {issueOptions.map(opt => (
          <label key={opt} className="block">
            <input type="radio" name="key_issue" value={opt} checked={answers.key_issue === opt} onChange={e => handleChange('key_issue', e.target.value)} required />
            {opt}
          </label>
        ))}
      </div>
      <div>
        <label className="block font-semibold mb-2">4. 현재 거주하시는 지역은 어디인가요?</label>
        {regionOptions.map(opt => (
          <label key={opt} className="block">
            <input type="radio" name="region" value={opt} checked={answers.region === opt} onChange={e => handleChange('region', e.target.value)} required />
            {opt}
          </label>
        ))}
      </div>
      <div>
        <label className="block font-semibold mb-2">5. 연령대를 선택해주세요.</label>
        {ageOptions.map(opt => (
          <label key={opt} className="block">
            <input type="radio" name="age_group" value={opt} checked={answers.age_group === opt} onChange={e => handleChange('age_group', e.target.value)} required />
            {opt}
          </label>
        ))}
      </div>
      <div>
        <label className="block font-semibold mb-2">6. 성별을 선택해주세요.</label>
        {genderOptions.map(opt => (
          <label key={opt} className="block">
            <input type="radio" name="gender" value={opt} checked={answers.gender === opt} onChange={e => handleChange('gender', e.target.value)} required />
            {opt}
          </label>
        ))}
      </div>
      <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">제출하기</button>
    </form>
  );
} 