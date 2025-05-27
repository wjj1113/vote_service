import { PrismaClient } from '@prisma/client'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

function safeParseJson(filePath: string) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error(`JSON 파싱 오류: ${filePath}`)
    console.error(e)
    process.exit(1)
  }
}

async function main() {
  // 1. 기존 데이터 전체 삭제
  await prisma.policy.deleteMany({})
  await prisma.candidate.deleteMany({})
  await prisma.party.deleteMany({})

  // 정당 데이터 생성
  const parties = [
    { name: '더불어민주당', policy: '민주주의, 복지국가, 평화' },
    { name: '국민의힘', policy: '자유민주주의, 시장경제, 안보' },
    { name: '개혁신당', policy: '정치개혁, 청년정책, 혁신' },
    { name: '새로운미래', policy: '미래지향, 혁신, 통합' },
  ];

  for (const party of parties) {
    await prisma.party.upsert({
      where: { name: party.name },
      update: {},
      create: party,
    });
  }

  // 후보자 데이터 생성
  const candidates = [
    {
      name: '이재명',
      party: '더불어민주당',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153692/gicho/thumbnail.100153692.JPG',
      policies: [
        {
          title: '기본소득 도입',
          content: '모든 국민에게 기본소득 지급',
          categories: ['복지'],
          order: 1,
          budget: '연간 30조원',
          duration: '2024-2028',
          goal: '모든 국민의 기본생활 보장',
          implementation: '단계적 도입 및 재원 마련',
          summary: '모든 국민에게 기본소득 지급'
        },
        {
          title: '기후변화 대응',
          content: '탄소중립 2050 목표 달성',
          categories: ['환경'],
          order: 2,
          budget: '연간 10조원',
          duration: '2024-2050',
          goal: '탄소중립 달성',
          implementation: '재생에너지 확대 및 산업 구조 전환',
          summary: '탄소중립 2050 목표 달성'
        }
      ]
    },
    {
      name: '윤석열',
      party: '국민의힘',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG',
      policies: [
        {
          title: '시장경제 활성화',
          content: '규제 완화로 경제 성장 촉진',
          categories: ['경제'],
          order: 1,
          budget: '연간 20조원',
          duration: '2024-2028',
          goal: '경제 성장률 3% 달성',
          implementation: '규제 완화 및 기업 투자 유도',
          summary: '규제 완화로 경제 성장 촉진'
        },
        {
          title: '안보 강화',
          content: '한미동맹 강화 및 국방력 증강',
          categories: ['안보'],
          order: 2,
          budget: '연간 15조원',
          duration: '2024-2028',
          goal: '국방력 강화',
          implementation: '한미동맹 강화 및 국방력 증강',
          summary: '한미동맹 강화 및 국방력 증강'
        }
      ]
    },
    {
      name: '김문수',
      party: '국민의힘',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153710/gicho/thumbnail.100153710.JPG',
      policies: [
        {
          title: '노동개혁',
          content: '노동시장 유연화 및 일자리 창출',
          categories: ['노동'],
          order: 1,
          budget: '연간 5조원',
          duration: '2024-2028',
          goal: '노동시장 유연화',
          implementation: '노동법 개정 및 일자리 창출',
          summary: '노동시장 유연화 및 일자리 창출'
        }
      ]
    },
    {
      name: '이준석',
      party: '개혁신당',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153689/gicho/thumbnail.100153689.JPG',
      policies: [
        {
          title: '정치개혁',
          content: '정치 시스템 전면 개혁',
          categories: ['정치'],
          order: 1,
          budget: '연간 5조원',
          duration: '2024-2028',
          goal: '정치 시스템 개혁',
          implementation: '정치 시스템 전면 개혁',
          summary: '정치 시스템 전면 개혁'
        },
        {
          title: '청년정책',
          content: '청년 일자리 창출 및 주거비용 지원',
          categories: ['청년'],
          order: 2,
          budget: '연간 10조원',
          duration: '2024-2028',
          goal: '청년 실업률 5% 이하',
          implementation: '청년 일자리 창출 및 주거비용 지원',
          summary: '청년 일자리 창출 및 주거비용 지원'
        }
      ]
    },
    {
      name: '권영국',
      party: '노동당',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153725/gicho/thumbnail.100153725.JPG',
      policies: [
        {
          title: '노동자 권익 강화',
          content: '노동자 권리 보호 및 임금 인상',
          categories: ['노동'],
          order: 1,
          budget: '연간 3조원',
          duration: '2024-2028',
          goal: '노동자 권익 강화',
          implementation: '노동법 강화 및 임금 인상',
          summary: '노동자 권리 보호 및 임금 인상'
        }
      ]
    },
    {
      name: '황교안',
      party: '국민의힘',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153708/gicho/thumbnail.100153708.JPG',
      policies: [
        {
          title: '안보 강화',
          content: '국방력 증강 및 안보 정책 강화',
          categories: ['안보'],
          order: 1,
          budget: '연간 8조원',
          duration: '2024-2028',
          goal: '국방력 강화',
          implementation: '국방 예산 증액 및 정책 강화',
          summary: '국방력 증강 및 안보 정책 강화'
        }
      ]
    },
    {
      name: '송진호',
      party: '무소속',
      imageUrl: 'https://cdn.nec.go.kr/photo_20250603/Gsg1/Hb100153722/gicho/thumbnail.100153722.JPG',
      policies: [
        {
          title: '서민 복지 확대',
          content: '서민을 위한 복지 정책 확대',
          categories: ['복지'],
          order: 1,
          budget: '연간 2조원',
          duration: '2024-2028',
          goal: '서민 복지 확대',
          implementation: '복지 예산 증액 및 정책 확대',
          summary: '서민을 위한 복지 정책 확대'
        }
      ]
    }
  ];

  for (const candidate of candidates) {
    const { policies, ...candidateData } = candidate;
    const party = await prisma.party.findUnique({
      where: { name: candidate.party }
    });

    if (!party) continue;

    const createdCandidate = await prisma.candidate.create({
      data: {
        ...candidateData,
        partyId: party.id
      }
    });

    // 정책 데이터 생성
    for (const policy of policies) {
      await prisma.policy.create({
        data: {
          ...policy,
          candidateId: createdCandidate.id
        }
      });
    }
  }

  // DB 저장 결과 출력
  const partyCount = await prisma.party.count();
  const candidateCount = await prisma.candidate.count();
  const policyCount = await prisma.policy.count();
  console.log('DB 저장 결과:', { partyCount, candidateCount, policyCount });

  // --- 여론조사 백데이터 시드 추가 ---
  const total = 1000;
  // 투표 의향 분포
  const voteIntentDist = [
    { value: 'definitely_vote', count: 860 },
    { value: 'likely_vote', count: 108 },
    { value: 'unlikely_vote', count: 27 },
    { value: 'definitely_not_vote', count: 5 }
  ];
  // 정당 분포
  const supportedPartyDist = [
    { value: 'democratic_party', count: 503 },
    { value: 'peoples_power', count: 320 },
    { value: 'reform_party', count: 76 },
    { value: 'labor_party', count: 3 },
    { value: 'no_party', count: 98 }
  ];
  // 이슈 분포
  const keyIssueDist = [
    { value: 'economy', count: 350 },
    { value: 'welfare', count: 150 },
    { value: 'fairness', count: 150 },
    { value: 'security', count: 100 },
    { value: 'climate', count: 80 },
    { value: 'political_reform', count: 80 },
    { value: 'youth_policy', count: 70 },
    { value: 'other', count: 20 }
  ];
  // 지역 분포
  const regionDist = [
    { value: 'seoul', count: 190 },
    { value: 'gyeonggi', count: 260 },
    { value: 'gangwon', count: 30 },
    { value: 'chungcheong', count: 90 },
    { value: 'jeolla', count: 90 },
    { value: 'gyeongsang', count: 190 },
    { value: 'jeju', count: 10 },
    { value: 'overseas', count: 10 }
  ];
  // 연령대 분포
  const ageDist = [
    { value: '18-29', count: 150 },
    { value: '30s', count: 170 },
    { value: '40s', count: 180 },
    { value: '50s', count: 220 },
    { value: '60+', count: 280 }
  ];
  // 성별 분포
  const genderDist = [
    { value: 'male', count: 490 },
    { value: 'female', count: 510 }
  ];

  // 분포별로 인덱스
  let vi = 0, sp = 0, ki = 0, rg = 0, ag = 0, gd = 0;
  let viCount = 0, spCount = 0, kiCount = 0, rgCount = 0, agCount = 0, gdCount = 0;

  for (let i = 0; i < total; i++) {
    // 인덱스가 배열 끝을 넘지 않도록 방어
    if (vi >= voteIntentDist.length) vi = voteIntentDist.length - 1;
    if (sp >= supportedPartyDist.length) sp = supportedPartyDist.length - 1;
    if (ki >= keyIssueDist.length) ki = keyIssueDist.length - 1;
    if (rg >= regionDist.length) rg = regionDist.length - 1;
    if (ag >= ageDist.length) ag = ageDist.length - 1;
    if (gd >= genderDist.length) gd = genderDist.length - 1;

    while (viCount >= voteIntentDist[vi].count && vi < voteIntentDist.length - 1) { vi++; viCount = 0; }
    while (spCount >= supportedPartyDist[sp].count && sp < supportedPartyDist.length - 1) { sp++; spCount = 0; }
    while (kiCount >= keyIssueDist[ki].count && ki < keyIssueDist.length - 1) { ki++; kiCount = 0; }
    while (rgCount >= regionDist[rg].count && rg < regionDist.length - 1) { rg++; rgCount = 0; }
    while (agCount >= ageDist[ag].count && ag < ageDist.length - 1) { ag++; agCount = 0; }
    while (gdCount >= genderDist[gd].count && gd < genderDist.length - 1) { gd++; gdCount = 0; }

    await prisma.surveySubmission.create({
      data: {
        ipAddress: `seed-${i}`,
        formData: {
          vote_intent: voteIntentDist[vi].value,
          supported_party: supportedPartyDist[sp].value,
          key_issue: keyIssueDist[ki].value,
          region: regionDist[rg].value,
          age_group: ageDist[ag].value,
          gender: genderDist[gd].value
        },
        createdAt: new Date(2025, 4, 1 + Math.floor(i / 50)), // 5월 1일부터 분산
      }
    });
    viCount++; spCount++; kiCount++; rgCount++; agCount++; gdCount++;
  }

  const surveyCount = await prisma.surveySubmission.count();
  console.log('SurveySubmission 시드 완료! 전체:', surveyCount);

  console.log('DB 시드 완료!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 