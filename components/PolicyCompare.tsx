import React, { useEffect, useState } from 'react';

interface Policy {
  id: string;
  order: number;
  title: string;
  categories: string[];
  goal: string;
  implementation: string;
  duration: string;
  budget: string;
  summary?: string;
  candidateId: number;
  score?: number; // 중요도(옵션)
}

interface Candidate {
  id: number;
  name: string;
  party: string;
  policies: Policy[];
  color?: string; // 후보별 컬러(옵션)
}

interface PolicyModalProps {
  policy: Policy;
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
}

function PolicyModal({ policy, candidate, isOpen, onClose }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{policy.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {normalizeName(candidate.name)} ({candidate.party})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">분야</h3>
            <div className="flex flex-wrap gap-2">
              {policy.categories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">목표</h3>
            <p className="text-gray-800 whitespace-pre-line">{policy.goal}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">이행방법</h3>
            <p className="text-gray-800 whitespace-pre-line">
              {policy.implementation}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">이행기간</h3>
            <p className="text-gray-800">{policy.duration}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">재원조달방안</h3>
            <p className="text-gray-800 whitespace-pre-line">{policy.budget}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 상단 바 컴포넌트
function Header() {
  return (
    <header className="w-full bg-blue-700 text-white py-4 shadow">
      <div className="max-w-5xl mx-auto flex items-center px-4">
        <span className="text-2xl font-extrabold tracking-tight mr-3">🗳️</span>
        <span className="text-xl font-bold tracking-tight">2025 대선 정책 비교 서비스</span>
      </div>
    </header>
  );
}

// 푸터 컴포넌트
function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-gray-500 py-4 mt-12 border-t">
      <div className="max-w-5xl mx-auto px-4 text-xs flex flex-col md:flex-row justify-between items-center gap-2">
        <span>© 2025 대선 정책 비교 서비스</span>
        <span>문의: info@votecompare.kr</span>
      </div>
    </footer>
  );
}

// 후보명에서 공백 제거 함수
const normalizeName = (name: string) => name.replace(/\s/g, '');

// 유사 카테고리 통합 매핑
const categoryMap: { [key: string]: string } = {
  '경제·산업': '경제·산업', '경제': '경제·산업', '산업': '경제·산업', '산업자원': '경제·산업', '산업지원': '경제·산업', '재정': '경제·산업', '재정경제': '경제·산업', '조세': '경제·산업', '사회적경제': '경제·산업', '통상': '경제·산업',
  '복지·보건': '복지·보건', '복지': '복지·보건', '보건': '복지·보건', '보건의료': '복지·보건',
  '교육': '교육', '인적자원': '교육',
  '과학기술': '과학·기술', '과학': '과학·기술', '기술': '과학·기술', '정보통신': '과학·기술', '연구환경': '과학·기술',
  '환경·에너지': '환경·에너지', '환경': '환경·에너지', '에너지': '환경·에너지',
  '문화·체육·관광': '문화·체육·관광', '문화': '문화·체육·관광', '체육': '문화·체육·관광', '관광': '문화·체육·관광', '스포츠': '문화·체육·관광', '문화예술': '문화·체육·관광',
  '행정·개혁': '행정·개혁', '행정': '행정·개혁', '개혁': '행정·개혁', '정치': '행정·개혁', '정치행정': '행정·개혁', '지방자치': '행정·개혁', '인프라': '행정·개혁',
  '안보·외교': '안보·외교', '안보': '안보·외교', '외교': '안보·외교', '국가안보': '안보·외교', '군사': '안보·외교', '외교통상': '안보·외교',
  '교통': '교통', '건설': '교통', '건설교통': '교통',
  '기타(노동)': '기타', '기타(사회안전)': '기타', '사법': '기타',
};

// 후보자 이미지 넘버링 순서
const candidateOrder = [
  '이재명',
  '김문수',
  '이준석',
  '권영국',
  '구주와',
  '황교안',
  '송진호',
];

export default function PolicyCompare() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPolicy, setSelectedPolicy] = useState<{
    policy: Policy;
    candidate: Candidate;
  } | null>(null);
  const [sortBy, setSortBy] = useState<'order' | 'title'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showScores, setShowScores] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/candidates')
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setSelectedCandidates(data.map((c: Candidate) => c.id)); // 기본 전체 선택
      });
  }, []);

  // 후보명(공백 제거) 기준 컬러 매핑
  const candidateBgColors: { [name: string]: string } = {
    '이재명': 'bg-blue-600 text-white',
    '김문수': 'bg-red-600 text-white',
    '이준석': 'bg-orange-500 text-white',
    '권영국': 'bg-yellow-300 text-gray-900',
    '구주와': 'bg-blue-200 text-gray-900',
    '황교안': 'bg-blue-800 text-white',
    '송진호': 'bg-purple-500 text-white',
  };

  // 후보 선택/해제
  const toggleCandidate = (candidateId: number) => {
    if (selectedCandidates.includes(candidateId)) {
      if (selectedCandidates.length > 1) {
        setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId));
      }
    } else {
      setSelectedCandidates([...selectedCandidates, candidateId]);
    }
  };

  // 후보 정렬
  const sortedCandidates: Candidate[] = candidateOrder
    .map((name) => candidates.find((c: Candidate) => normalizeName(c.name) === normalizeName(name)))
    .filter((c): c is Candidate => !!c);
  const sortedSelectedCandidates: Candidate[] = candidateOrder
    .map((name) => sortedCandidates.find((c: Candidate) => normalizeName(c.name) === normalizeName(name)))
    .filter((c): c is Candidate => !!c && selectedCandidates.includes(c.id));

  // 카테고리 통합 적용
  const allCategories = Array.from(
    new Set(
      candidates.flatMap((candidate: Candidate) =>
        candidate.policies.flatMap((policy: Policy) =>
          (policy.categories || []).map((cat: string) => categoryMap[cat] || cat)
        )
      )
    )
  ).sort();

  // 필터링된 정책도 통합 카테고리 기준으로
  const filteredPoliciesByCategory: { [candidateId: number]: Policy[] } = {};
  candidates.forEach((candidate: Candidate) => {
    filteredPoliciesByCategory[candidate.id] = candidate.policies.filter((policy: Policy) => {
      const mappedCategories = (policy.categories || []).map((cat: string) => categoryMap[cat] || cat);
      const matchesCategory =
        selectedCategory === '전체' || mappedCategories.includes(selectedCategory);
      const matchesSearch =
        searchQuery === '' ||
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.implementation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.budget.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  });

  // 정책 순위(order) 기준으로 정렬된 모든 order
  const allOrders = Array.from(
    new Set(
      Object.values(filteredPoliciesByCategory)
        .flat()
        .map((policy: Policy) => policy.order)
    )
  ).sort((a, b) => a - b);

  // 선택한 카테고리에 정책이 1개 이상 있는 후보만 표시
  const filteredCandidates = sortedSelectedCandidates.filter((candidate) =>
    filteredPoliciesByCategory[candidate.id] && filteredPoliciesByCategory[candidate.id].length > 0
  );

  // visibleOrders: 모든 후보가 '-'인 행은 제외
  let visibleOrders = allOrders.filter(order =>
    filteredCandidates.some(candidate =>
      !!filteredPoliciesByCategory[candidate.id]?.find((p) => p.order === order)
    )
  );

  // 각 후보별로 해당 카테고리에 정책이 있는 경우, 그 정책의 우선순위(order)가 가장 높은(숫자가 가장 작은) 행이 표의 최상단에 오도록 visibleOrders를 재정렬
  const topOrders: number[] = filteredCandidates
    .map(candidate => {
      const policies = filteredPoliciesByCategory[candidate.id] || [];
      if (policies.length === 0) return null;
      return Math.min(...policies.map((p) => p.order));
    })
    .filter((order): order is number => order !== null);

  // 중복 제거 및 최상단에 올릴 우선순위만 추출
  const uniqueTopOrders = Array.from(new Set(topOrders));

  // visibleOrders에서 uniqueTopOrders를 최상단에, 나머지는 기존 순서대로
  visibleOrders = [
    ...uniqueTopOrders,
    ...visibleOrders.filter(order => !uniqueTopOrders.includes(order)),
  ];

  // 후보별로 카테고리 내 최상위(가장 order가 작은) 정책만 추출
  const topPoliciesByCandidate = filteredCandidates.map(candidate => {
    const policies = filteredPoliciesByCategory[candidate.id] || [];
    if (policies.length === 0) return null;
    // order가 가장 작은 정책
    const topPolicy = policies.reduce((min, p) => (p.order < min.order ? p : min), policies[0]);
    return { candidate, policy: topPolicy };
  }).filter(Boolean);

  // 후보별로 해당 카테고리의 모든 정책 추출 및 order 기준 정렬
  const policiesByCandidate = filteredCandidates.map(candidate => {
    const policies = (filteredPoliciesByCategory[candidate.id] || []).sort((a, b) => a.order - b.order);
    return { candidate, policies };
  });
  // 가장 많은 정책 개수
  const maxPolicies = Math.max(...policiesByCandidate.map(pc => pc.policies.length));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-2 sm:px-4 py-8">
        {/* 메인 타이틀/설명 */}
        <section className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-2">2025 대선 정책 비교</h1>
          <p className="text-gray-600 text-base sm:text-lg">후보별 주요 공약을 한눈에 비교하고, 나에게 맞는 정책을 찾아보세요.</p>
        </section>

        {/* 후보 선택 영역 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">비교할 후보자 선택</h2>
          <div className="flex flex-wrap gap-2">
            {candidates.map((candidate, idx) => (
              <button
                key={candidate.id}
                className={`px-4 py-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  selectedCandidates.includes(candidate.id)
                    ? candidateBgColors[normalizeName(candidate.name)] || 'bg-gray-200 text-gray-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => toggleCandidate(candidate.id)}
              >
                {normalizeName(candidate.name)} ({candidate.party})
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              key="전체"
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                selectedCategory === '전체'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setSelectedCategory('전체')}
            >
              전체
            </button>
            {allCategories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 보기 옵션/점수 표시 */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded font-semibold ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('table')}
            >
              표 형식
            </button>
            <button
              className={`px-3 py-1 rounded font-semibold ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setViewMode('card')}
            >
              카드 형식
            </button>
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showScores}
                onChange={() => setShowScores(!showScores)}
                className="mr-2 accent-blue-500"
              />
              <span>중요도(점수) 표시</span>
            </label>
          </div>
        </div>

        {/* 정책 비교 영역 */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50">
                  {policiesByCandidate.map(({ candidate }) => (
                    <th key={candidate.id} className="w-[180px] min-w-[180px] max-w-[180px] py-3 px-4 text-left border-b">
                      <div className={`inline-block w-3 h-3 rounded-full mr-2 ${candidateBgColors[normalizeName(candidate?.name ?? '')]}`}></div>
                      {normalizeName(candidate?.name ?? '')} ({candidate?.party})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxPolicies }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {policiesByCandidate.map(({ candidate, policies }) => {
                      const policy = policies[rowIdx];
                      return (
                        <td key={candidate.id} className="w-[180px] min-w-[180px] max-w-[180px] py-3 px-4 border-b align-top">
                          {policy ? (
                            <>
                              <div className="font-medium">{policy.title}</div>
                              <div className="text-xs mt-1 text-gray-700">우선순위: {policy.order}위</div>
                              <div className="text-gray-700">{policy.summary || policy.goal.split('.')[0]}</div>
                            </>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => {
              const policies = filteredPoliciesByCategory[candidate.id] || [];
              return (
                <div
                  key={candidate.id}
                  className={`w-full md:w-[320px] flex-1 border-t-4 shadow-md rounded-lg p-4 mb-2 ${candidateBgColors[normalizeName(candidate?.name ?? '')]}`}
                >
                  <div className="font-medium text-lg mb-2">
                    {normalizeName(candidate?.name ?? '')} ({candidate?.party})
                  </div>
                  {policies.length === 0 && <div className="text-gray-100">해당 분야 정책 없음</div>}
                  {policies.map((policy) => (
                    <div key={policy.id} className="mb-4">
                      <div className="font-bold mb-1">{policy.title}</div>
                      <div className="text-xs mb-1">우선순위: {policy.order}위</div>
                      <p className="mb-1">{policy.summary || policy.goal.split('.')[0]}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      {/* 정책 상세 모달 */}
      {selectedPolicy && (
        <PolicyModal
          policy={selectedPolicy.policy}
          candidate={selectedPolicy.candidate}
          isOpen={true}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </div>
  );
} 