import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Candidate {
  id: number;
  name: string;
  party: string;
  policies: Policy[];
}

interface Policy {
  id: string;
  title: string;
  categories: string[];
  summary?: string;
}

interface VoteFormData {
  ageGroup: string;
  region: string;
  gender: string;
  interests: string[];
  candidateId?: number;
}

export default function VoteForm() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [formData, setFormData] = useState<VoteFormData>({
    ageGroup: '',
    region: '',
    gender: '',
    interests: [],
  });
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/candidates')
      .then((res) => res.json())
      .then((data) => setCandidates(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 투표 의향 저장
      if (formData.candidateId) {
        await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: formData.candidateId,
            ageGroup: formData.ageGroup,
            region: formData.region,
            gender: formData.gender,
          }),
        });
      }

      // 정책 추천 요청
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: formData.interests,
          ageGroup: formData.ageGroup,
          region: formData.region,
        }),
      });
      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(category)
        ? prev.interests.filter((c) => c !== category)
        : [...prev.interests, category],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">투표 의향 조사</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연령대
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) =>
                setFormData({ ...formData, ageGroup: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">선택하세요</option>
              <option value="10대">10대</option>
              <option value="20대">20대</option>
              <option value="30대">30대</option>
              <option value="40대">40대</option>
              <option value="50대">50대</option>
              <option value="60대 이상">60대 이상</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              지역
            </label>
            <select
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">선택하세요</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="광주">광주</option>
              <option value="대전">대전</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
              <option value="강원">강원</option>
              <option value="충북">충북</option>
              <option value="충남">충남</option>
              <option value="전북">전북</option>
              <option value="전남">전남</option>
              <option value="경북">경북</option>
              <option value="경남">경남</option>
              <option value="제주">제주</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              성별
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">선택하세요</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </div>
        </div>

        {/* 관심 분야 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            관심 있는 정책 분야 (복수 선택 가능)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              '경제·산업',
              '복지·보건',
              '교육',
              '환경',
              '안보·외교',
              '행정·개혁',
              '노동·고용',
              '문화·체육',
              '과학·기술',
              '통일',
            ].map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.interests.includes(category)}
                  onChange={() => handleInterestChange(category)}
                  className="rounded text-blue-600"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 투표 의향 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            투표 의향
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {candidates.map((candidate) => (
              <label
                key={candidate.id}
                className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="candidate"
                  checked={formData.candidateId === candidate.id}
                  onChange={() =>
                    setFormData({ ...formData, candidateId: candidate.id })
                  }
                  className="text-blue-600"
                />
                <span>
                  {candidate.name} ({candidate.party})
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isLoading ? '처리 중...' : '제출하기'}
        </button>
      </form>

      {/* 정책 추천 결과 */}
      {recommendation && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">맞춤형 정책 추천</h3>
          <p className="text-gray-700">{recommendation}</p>
        </div>
      )}
    </div>
  );
} 