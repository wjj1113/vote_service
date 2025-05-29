import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, SurveySubmission, VoteIntent } from '@prisma/client';

const prisma = new PrismaClient();

// 영문 → 한글 매핑 테이블
const voteIntentMap: Record<string, string> = {
  'definitely_vote': '반드시 투표할 것이다',
  'likely_vote': '가능하면 투표할 것이다',
  'unlikely_vote': '아마 투표하지 않을 것이다',
  'definitely_not_vote': '투표하지 않을 것이다',
};
const partyMap: Record<string, string> = {
  'democratic_party': '더불어민주당 (이재명)',
  'peoples_power': '국민의힘 (김문수)',
  'reform_party': '개혁신당 (이준석)',
  'labor_party': '민주노동당 (권영국)',
  'independent_hwang': '무소속 (황교안)',
  'independent_song': '무소속 (송진호)',
  'candidate_only': '지지하는 후보는 있지만 정당은 없음',
  'no_party': '지지 정당 없음 / 모르겠음',
};
const genderMap: Record<string, string> = {
  'male': '남성',
  'female': '여성',
  'other': '선택하지 않음',
};
const regionMap: Record<string, string> = {
  'seoul': '서울',
  'gyeonggi': '경기',
  'incheon': '인천',
  'busan': '부산',
  'daegu': '대구',
  'gwangju': '광주',
  'daejeon': '대전',
  'ulsan': '울산',
  'sejong': '세종',
  'gangwon': '강원',
  'chungbuk': '충북',
  'chungnam': '충남',
  'jeonbuk': '전북',
  'jeonnam': '전남',
  'gyeongbuk': '경북',
  'gyeongnam': '경남',
  'jeju': '제주',
  'overseas': '해외',
};
const ageMap: Record<string, string> = {
  '18-29': '18–29세',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60+': '60세 이상',
};

// 주요 관심 이슈 라벨 및 유틸 함수 상단에 선언
const keyIssueLabels = [
  { label: '경제', value: 'economy' },
  { label: '복지', value: 'welfare' },
  { label: '공정', value: 'fairness' },
  { label: '안보', value: 'security' },
  { label: '기후위기', value: 'climate' },
  { label: '정치개혁', value: 'political_reform' },
  { label: '청년정책', value: 'youth_policy' },
  { label: '기타 / 잘 모르겠다', value: 'other' }
];
const isObject = (v: any): v is Record<string, any> => v && typeof v === 'object' && !Array.isArray(v);

type DashboardVoteIntent = {
  label: string;
  value: string;
  count: number;
  percentage: string | number;
};
type DashboardSupportedParty = {
  label: string;
  value: string;
  color: string;
  count: number;
  percentage: string | number;
};

type DashboardData = {
  totalResponses: number;
  lastUpdated: string;
  voteIntent: DashboardVoteIntent[];
  supportedParty: DashboardSupportedParty[];
  keyIssues: { label: string; value: string; count: number; percentage: string | number }[];
  regionDistribution: { label: string; value: string; count: number; percentage: string | number }[];
  ageDistribution: { label: string; value: string; count: number; percentage: string | number }[];
  genderDistribution: { label: string; value: string; count: number; percentage: string | number }[];
  voteIntentStats: { label: string; count: number }[];
  partyStats: { label: string; count: number }[];
  regionStats: { label: string; count: number }[];
  ageStats: { label: string; count: number }[];
  genderStats: { label: string; count: number }[];
  totalSurveyResponses: number;
  totalVoteIntentResponses: number;
  voteIntentPercentage: string;
  topPartyLabel: string;
  topPartyPercentage: string | number;
};

function aggregateSurveyData(
  surveySubmissions: SurveySubmission[],
  voteIntents: VoteIntent[]
): DashboardData {
  // 투표 의향 집계
  const voteIntentLabels = [
    { label: '반드시 투표할 것이다', value: 'definitely_vote' },
    { label: '가능하면 투표할 것이다', value: 'likely_vote' },
    { label: '아마 투표하지 않을 것이다', value: 'unlikely_vote' },
    { label: '투표하지 않을 것이다', value: 'definitely_not_vote' },
  ];
  const voteIntentCounts: DashboardVoteIntent[] = voteIntentLabels.map(({ label, value }) => {
    const count = surveySubmissions.filter((s: any) => {
      const v = s.formData.vote_intent;
      return v === label || voteIntentMap[v] === label;
    }).length;
    return { label, value, count, percentage: 0 };
  });
  const totalResponses = surveySubmissions.length;
  voteIntentCounts.forEach((v) => (v.percentage = totalResponses ? (v.count / totalResponses * 100).toFixed(1) : 0));

  // 정당 지지도 집계
  const partyLabels = [
    { label: '더불어민주당 (이재명)', value: 'democratic_party', color: '#0066CC' },
    { label: '국민의힘 (김문수)', value: 'peoples_power', color: '#E61E2B' },
    { label: '개혁신당 (이준석)', value: 'reform_party', color: '#F39C12' },
    { label: '민주노동당 (권영국)', value: 'labor_party', color: '#E74C3C' },
    { label: '무소속 (황교안)', value: 'independent_hwang', color: '#95A5A6' },
    { label: '무소속 (송진호)', value: 'independent_song', color: '#BDC3C7' },
    { label: '지지하는 후보는 있지만 정당은 없음', value: 'candidate_only', color: '#9B59B6' },
    { label: '지지 정당 없음 / 모르겠음', value: 'no_party', color: '#34495E' },
  ];
  const supportedParty: DashboardSupportedParty[] = partyLabels.map(({ label, value, color }) => {
    const count = surveySubmissions.filter((s: any) => {
      const v = s.formData.supported_party;
      return v === label || partyMap[v] === label;
    }).length;
    return {
      label,
      value,
      color,
      count,
      percentage: totalResponses ? (count / totalResponses * 100).toFixed(1) : 0,
    };
  });

  // SurveySubmission에서 집계 (더미 데이터 제거)
  const keyIssues = keyIssueLabels.map(({ label, value }) => {
    const count = surveySubmissions.filter(s => {
      if (!isObject(s.formData)) return false;
      const form = s.formData as Record<string, any>;
      return form.key_issue === label || form.key_issue === value;
    }).length;
    return { label, value, count };
  });
  const totalResponsesForKeyIssues = keyIssues.reduce((sum, item) => sum + item.count, 0);
  const keyIssuesWithPercentage = keyIssues.map(item => ({
    ...item,
    percentage: totalResponsesForKeyIssues ? (item.count / totalResponsesForKeyIssues * 100).toFixed(1) : 0
  }));

  // 지역 분포
  const regionLabels = [
    { label: '서울', value: 'seoul' },
    { label: '경기 / 인천', value: 'gyeonggi' },
    { label: '경상', value: 'gyeongsang' },
    { label: '충청', value: 'chungcheong' },
    { label: '전라', value: 'jeolla' },
    { label: '강원', value: 'gangwon' },
    { label: '제주', value: 'jeju' },
    { label: '해외', value: 'overseas' }
  ];
  const regionDistribution = regionLabels.map(({ label, value }) => {
    const count = surveySubmissions.filter(s => {
      if (!isObject(s.formData)) return false;
      const form = s.formData as Record<string, any>;
      return form.region === label || form.region === value;
    }).length;
    return {
      label,
      value,
      count,
      percentage: totalResponses ? (count / totalResponses * 100).toFixed(1) : 0
    };
  });

  // 연령대 분포
  const ageLabels = [
    { label: '18–29세', value: '18-29' },
    { label: '30대', value: '30s' },
    { label: '40대', value: '40s' },
    { label: '50대', value: '50s' },
    { label: '60세 이상', value: '60+' }
  ];
  const ageDistribution = ageLabels.map(({ label, value }) => {
    const count = surveySubmissions.filter(s => {
      if (!isObject(s.formData)) return false;
      const form = s.formData as Record<string, any>;
      return form.age_group === label || form.age_group === value;
    }).length;
    return {
      label,
      value,
      count,
      percentage: totalResponses ? (count / totalResponses * 100).toFixed(1) : 0
    };
  });

  // 성별 분포
  const genderLabels = [
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
    { label: '선택하지 않음', value: 'prefer_not_to_say' }
  ];
  const genderDistribution = genderLabels.map(({ label, value }) => {
    const count = surveySubmissions.filter(s => {
      if (!isObject(s.formData)) return false;
      const form = s.formData as Record<string, any>;
      return form.gender === label || form.gender === value;
    }).length;
    return {
      label,
      value,
      count,
      percentage: totalResponses ? (count / totalResponses * 100).toFixed(1) : 0
    };
  });

  return {
    totalResponses,
    lastUpdated: new Date().toISOString(),
    voteIntent: voteIntentCounts,
    supportedParty,
    keyIssues: keyIssuesWithPercentage,
    regionDistribution,
    ageDistribution,
    genderDistribution,
    voteIntentStats: voteIntentCounts.map(item => ({
      label: item.label,
      count: item.count
    })),
    partyStats: supportedParty.map(item => ({
      label: item.label,
      count: item.count
    })),
    regionStats: regionDistribution.map(item => ({
      label: item.label,
      count: item.count
    })),
    ageStats: ageDistribution.map(item => ({
      label: item.label,
      count: item.count
    })),
    genderStats: genderDistribution.map(item => ({
      label: item.label,
      count: item.count
    })),
    totalSurveyResponses: totalResponses,
    totalVoteIntentResponses: voteIntents.length,
    voteIntentPercentage: (voteIntentCounts[0].count / totalResponses * 100).toFixed(1),
    topPartyLabel: supportedParty.reduce((a, b) => a.count > b.count ? a : b).label,
    topPartyPercentage: supportedParty.reduce((a, b) => a.count > b.count ? a : b).percentage
  };
}

// 텍스트 유사도(부분 일치) 매핑 함수
function matchBySimilarity(input: string, candidates: string[]): string | null {
  if (!input) return null;
  if (candidates.includes(input)) return input;
  for (const c of candidates) {
    if (input.includes(c) || c.includes(input)) return c;
  }
  for (const c of candidates) {
    if (input.replace(/\s/g, '').toLowerCase() === c.replace(/\s/g, '').toLowerCase()) return c;
  }
  return null;
}

function aggregateVoteIntentData(voteIntents: VoteIntent[], candidates: any[]) {
  // 후보 정보 매핑
  const candidateMap = Object.fromEntries(candidates.map((c: any) => [c.id, c]));

  // 전체 응답 수 계산
  const totalResponses = voteIntents.length;

  // 정당별 집계
  const partyLabels = [
    '더불어민주당 (이재명)', '국민의힘 (김문수)', '개혁신당 (이준석)', '민주노동당 (권영국)',
    '무소속 (황교안)', '무소속 (송진호)', '지지하는 후보는 있지만 정당은 없음', '지지 정당 없음 / 모르겠음'
  ];
  const partyStats = partyLabels.map(label => {
    const count = voteIntents.filter(v => {
      const candidate = candidateMap[v.candidateId];
      return candidate && candidate.party === label;
    }).length;
    return { label, count };
  });

  // 지역 분포
  const regionLabels = ['서울', '경기 / 인천', '강원', '충청', '전라', '경상', '제주', '해외'];
  const regionStats = regionLabels.map(label => ({
    label,
    count: voteIntents.filter(v => v.region === label).length
  }));

  // 연령 분포
  const ageLabels = ['18–29세', '30대', '40대', '50대', '60세 이상'];
  const ageStats = ageLabels.map(label => ({
    label,
    count: voteIntents.filter(v => v.ageGroup === label).length
  }));

  // 성별 분포
  const genderLabels = ['남성', '여성', '선택하지 않음'];
  const genderStats = genderLabels.map(label => ({
    label,
    count: voteIntents.filter(v => v.gender === label).length
  }));

  // 투표 의향(전체 row 수)
  const voteIntentStats = [{ label: '투표 의향 응답', count: voteIntents.length }];

  return {
    voteIntentStats,
    partyStats,
    regionStats,
    ageStats,
    genderStats,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const voteIntents = await prisma.voteIntent.findMany({});
    const candidates = await prisma.candidate.findMany();
    const surveySubmissions = await prisma.surveySubmission.findMany();
    const dashboardData = aggregateSurveyData(surveySubmissions, voteIntents);
    const voteIntentData = aggregateVoteIntentData(voteIntents, candidates);

    // 합산 값 계산
    const totalSurveyResponses = surveySubmissions.length;
    const totalVoteIntentResponses = voteIntents.length;
    const totalResponses = totalSurveyResponses + totalVoteIntentResponses;

    // 투표 의향(긍정 응답 합산)
    const positiveSurvey = dashboardData.voteIntent
      .filter(v => v.label === '반드시 투표할 것이다' || v.label === '가능하면 투표할 것이다')
      .reduce((sum, v) => sum + v.count, 0);
    const positiveVoteIntent = voteIntentData.voteIntentStats
      .filter(v => v.label === '투표 의향 응답')
      .reduce((sum, v) => sum + v.count, 0); // 모든 VoteIntent를 긍정으로 간주
    const totalPositive = positiveSurvey + positiveVoteIntent;
    const voteIntentPercentage = totalResponses ? (totalPositive / totalResponses * 100).toFixed(1) : 0;

    // 1위 정당(합산)
    // SurveySubmission 기반
    const partyMap = new Map();
    dashboardData.supportedParty.forEach(p => partyMap.set(p.label, p.count));
    // VoteIntent 기반
    voteIntentData.partyStats.forEach(p => partyMap.set(p.label, (partyMap.get(p.label) || 0) + p.count));
    // 1위 정당 찾기
    const topParty = Array.from(partyMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const topPartyLabel = topParty ? topParty[0] : '';
    const topPartyCount = topParty ? topParty[1] : 0;
    const topPartyPercentage = totalResponses ? (topPartyCount / totalResponses * 100).toFixed(1) : 0;

    res.status(200).json({
      ...dashboardData,
      ...voteIntentData,
      totalResponses,
      totalSurveyResponses,
      totalVoteIntentResponses,
      voteIntentPercentage,
      topPartyLabel,
      topPartyPercentage,
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 