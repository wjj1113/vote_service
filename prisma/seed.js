const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function safeParseJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`JSON 파싱 오류: ${filePath}`);
    console.error(e);
    process.exit(1);
  }
}

async function main() {
  // 1. 기존 데이터 전체 삭제
  await prisma.policy.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.party.deleteMany({});

  // 2. 정당 데이터 입력
  const partyPath = path.join(process.cwd(), 'db_list_party.json');
  const partyJson = safeParseJson(partyPath);
  console.log('정당 JSON 파싱 결과:', partyJson.parties.length, '개');

  for (const party of partyJson.parties) {
    await prisma.party.create({
      data: {
        name: party.name,
        policy: party.platforms.map((p) => p.title).join(', '),
      },
    });
  }

  // 후보-정당 매핑 정보 준비
  const candidateMapping = {};
  if (partyJson.candidateMapping) {
    for (const map of partyJson.candidateMapping) {
      candidateMapping[map.candidate] = map.party;
    }
  }

  // 3. 후보자 데이터 입력
  const candidatePath = path.join(process.cwd(), 'db_list_clean.json');
  const candidateJson = safeParseJson(candidatePath);
  console.log('후보자 JSON 파싱 결과:', candidateJson.candidates.length, '개');
  let totalPledges = 0;
  for (const cand of candidateJson.candidates) {
    console.log(`  - ${cand.name} 공약 수:`, cand.pledges.length);
    totalPledges += cand.pledges.length;
  }
  console.log('전체 공약(pledges) 수:', totalPledges);

  for (const cand of candidateJson.candidates) {
    let partyName = cand.party;
    if (!partyName || !(await prisma.party.findFirst({ where: { name: partyName } }))) {
      if (candidateMapping[cand.name]) {
        partyName = candidateMapping[cand.name];
      }
    }
    let party = await prisma.party.findFirst({ where: { name: partyName } });
    if (!party) {
      party = await prisma.party.create({
        data: { name: partyName || '무소속', policy: '' },
      });
    }
    const createdCandidate = await prisma.candidate.create({
      data: {
        name: cand.name,
        partyId: party.id,
        imageUrl: cand.imageUrl || null,
        party: partyName || '무소속',
      },
    });
    for (const pledge of cand.pledges) {
      await prisma.policy.create({
        data: {
          id: `${createdCandidate.id}-cand-${pledge.rank}`,
          candidateId: createdCandidate.id,
          order: pledge.rank,
          title: pledge.title,
          categories: pledge.categories,
          goal: pledge.goal,
          implementation: Array.isArray(pledge.methods) ? pledge.methods.join('\n') : pledge.methods,
          duration: pledge.period,
          budget: pledge.funding,
          summary: pledge.goal,
        },
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
        createdAt: new Date(2025, 4, 1 + Math.floor(i / 50)),
      }
    });
    viCount++; spCount++; kiCount++; rgCount++; agCount++; gdCount++;
  }

  const surveyCount = await prisma.surveySubmission.count();
  console.log('SurveySubmission 시드 완료! 전체:', surveyCount);

  // 정치 성향 분석 데이터 추가
  const orientation = await prisma.politicalOrientation.create({
    data: {
      rawInput: '정치 성향 분석 데이터',
      tendency: '진보',
      valueBase: '평등, 사회 정의',
      interests: ['환경 보호', '사회 복지'],
      voteBase: '정책 기반',
      scores: {
        welfareEfficiency: 7,
        environmentIndustry: 9,
        socialFreedomControl: 9,
        economicFreedomControl: 6,
        progressiveConservative: 8
      },
      confidence: 0.85,
      reasoning: {
        welfareEfficiency: '사회 복지에 대한 지원과 효율성 사이의 균형을 추구',
        environmentIndustry: '환경 보호를 중요하게 생각하며 산업 발전과 균형을 추구',
        socialFreedomControl: '사회적 자유와 개인 권리 강조',
        economicFreedomControl: '경제적 자유와 규제 사이에서 중간 정도의 선호',
        progressiveConservative: '진보적인 가치관과 사회 정의에 대한 강한 지지'
      }
    }
  });

  // 추천 데이터 추가
  const candidate = await prisma.candidate.findFirst({
    where: { name: '이 재 명' }
  });

  if (candidate) {
    await prisma.recommendation.create({
      data: {
        orientationId: orientation.id,
        candidateId: candidate.id,
        matchScore: 85,
        matchingPoints: ['환경 보호 정책', '사회 복지 정책'],
        differences: ['경제적 자유와 규제에 대한 선호도'],
        recommendation: '정책적으로 가장 일치하며, 가치관과 지지층도 유사합니다.',
        detailedAnalysis: {
          valueMatch: {
            score: 85,
            reason: '진보적인 가치관과 사회 정의에 대한 공감'
          },
          policyMatch: {
            score: 90,
            reason: '환경 보호 및 사회 복지 정책에서 높은 일치도'
          },
          leadershipMatch: {
            score: 85,
            reason: '진보적 리더십 스타일과 일치'
          },
          demographicMatch: {
            score: 80,
            reason: '주로 도시 지역 및 중하층 계층 지지층'
          }
        }
      }
    });
  }

  console.log('DB 시드 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 