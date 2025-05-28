// @ts-check
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 정당 데이터
  const parties = [
    { name: '더불어민주당' },
    { name: '국민의힘' },
    { name: '개혁신당' },
    { name: '민주노동당' },
    { name: '무소속' },
  ];

  for (const party of parties) {
    await prisma.party.upsert({
      where: { name: party.name },
      update: {},
      create: { name: party.name },
    });
  }

  // 후보자 및 정책 데이터
  const candidates = [
    {
      name: '이재명',
      partyName: '더불어민주당',
      imageUrl: null,
      policies: [
        {
          title: '기본소득 도입',
          categories: ['복지'],
          goal: '모든 국민에게 기본소득 지급',
          implementation: '단계적 도입',
          duration: '5년',
          budget: 100000000000,
          order: 1,
          summary: '국민 모두에게 기본소득을 지급합니다.'
        }
      ]
    },
    {
      name: '김문수',
      partyName: '국민의힘',
      imageUrl: null,
      policies: [
        {
          title: '일자리 창출',
          categories: ['경제'],
          goal: '청년 일자리 확대',
          implementation: '스타트업 지원',
          duration: '5년',
          budget: 50000000000,
          order: 1,
          summary: '청년을 위한 일자리를 늘립니다.'
        }
      ]
    },
    {
      name: '이준석',
      partyName: '개혁신당',
      imageUrl: null,
      policies: [
        {
          title: '교육 혁신',
          categories: ['교육'],
          goal: '공교육 혁신',
          implementation: '디지털 교육 확대',
          duration: '3년',
          budget: 20000000000,
          order: 1,
          summary: '공교육에 디지털 혁신을 도입합니다.'
        }
      ]
    },
    {
      name: '권영국',
      partyName: '민주노동당',
      imageUrl: null,
      policies: [
        {
          title: '노동권 강화',
          categories: ['노동'],
          goal: '비정규직 정규직화',
          implementation: '법제도 개선',
          duration: '2년',
          budget: 10000000000,
          order: 1,
          summary: '비정규직의 정규직 전환을 추진합니다.'
        }
      ]
    },
    {
      name: '송진호',
      partyName: '무소속',
      imageUrl: null,
      policies: [
        {
          title: '지역 균형 발전',
          categories: ['지역'],
          goal: '지방 소멸 방지',
          implementation: '지방 지원 확대',
          duration: '4년',
          budget: 15000000000,
          order: 1,
          summary: '지방 소멸을 막기 위한 지원을 강화합니다.'
        }
      ]
    }
  ];

  for (const candidate of candidates) {
    const party = await prisma.party.findUnique({ where: { name: candidate.partyName } });
    if (!party) continue;
    const createdCandidate = await prisma.candidate.create({
      data: {
        name: candidate.name,
        partyId: party.id,
        imageUrl: candidate.imageUrl,
      },
    });
    for (const policy of candidate.policies) {
      await prisma.policy.create({
        data: {
          candidateId: createdCandidate.id,
          ...policy,
        },
      });
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 