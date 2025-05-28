require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  try {
    // JSON 파일 읽기
    const filePath = path.join(process.cwd(), 'db_list_clean.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);

    // candidates 배열 상태 출력
    console.log('[DEBUG] candidates 개수:', data.candidates?.length);
    // parties Set 상태 출력
    const parties = new Set(data.candidates.map((c: any) => c.party.trim()));
    console.log('[DEBUG] parties Set:', Array.from(parties));

    // 정당 데이터 수집 및 정리
    const partyMap = new Map();

    console.log('=== 정당 데이터 마이그레이션 시작 ===');
    // 정당 데이터 삽입
    for (const partyName of parties) {
      let partyId = null;
      console.log(`정당 처리 중: ${partyName}`);

      // 삽입 시도 전 로그
      console.log(`[DEBUG] Party 삽입 시도: ${partyName}`);

      // 먼저 해당 정당이 있는지 확인
      const { data: existingParty, error: fetchError } = await supabase
        .from('Party')
        .select('id')
        .eq('name', partyName)
        .single();

      if (existingParty) {
        partyId = existingParty.id;
        console.log(`기존 정당 ID 찾음: ${partyName} -> ${partyId}`);
      } else {
        // 없으면 새로 생성
        const { data: insertedParty, error: partyError } = await supabase
        .from('Party')
        .insert({
          name: partyName,
            policy: ''
        })
        .select()
        .single();

        // 삽입 후 결과 로그
        console.log(`[DEBUG] Party 삽입 결과:`, insertedParty, partyError);

      if (partyError) {
          console.error(`정당 삽입 오류 ${partyName}:`, partyError, JSON.stringify(partyError, null, 2));
          continue;
        }

        partyId = insertedParty.id;
        console.log(`새 정당 생성됨: ${partyName} -> ${partyId}`);
      }
      // partyMap 저장 로그
      console.log(`[DEBUG] partyMap 저장: ${partyName} -> ${partyId}`);
      partyMap.set(partyName, partyId);
    }

    console.log('=== 후보자 데이터 마이그레이션 시작 ===');
    // 후보자 데이터 변환 및 삽입
    for (const candidate of data.candidates) {
      const cleanPartyName = candidate.party.trim();
      const partyId = partyMap.get(cleanPartyName);
      
      if (!partyId) {
        console.error(`정당 ID를 찾을 수 없음: ${cleanPartyName}`);
        continue;
      }

      console.log(`후보자 처리 중: ${candidate.name} (${cleanPartyName})`);

      // 후보자 데이터 삽입
      const { data: insertedCandidate, error: candidateError } = await supabase
        .from('Candidate')
        .insert({
          name: candidate.name,
          party: cleanPartyName,
          partyid: partyId,
          imageurl: candidate.image || null
        })
        .select()
        .single();

      if (candidateError) {
        console.error(`후보자 삽입 오류 ${candidate.name}:`, candidateError);
        continue;
      }

      console.log(`후보자 생성됨: ${candidate.name} -> ${insertedCandidate.id}`);

      // 정책 데이터 삽입
      for (const pledge of candidate.pledges) {
        const { error: policyError } = await supabase
          .from('Policy')
          .insert({
            id: uuidv4(),
            candidateid: insertedCandidate.id,
            order: pledge.rank,
            title: pledge.title,
            categories: pledge.categories,
            goal: pledge.goal,
            implementation: pledge.methods.join('\n'),
            duration: pledge.period,
            budget: pledge.funding,
            summary: pledge.goal.split('.')[0],
            updatedat: new Date().toISOString()
          });

        if (policyError) {
          console.error(`정책 삽입 오류 (${candidate.name}):`, policyError);
        }
      }
    }

    console.log('=== 마이그레이션 완료! ===');
  } catch (error) {
    console.error('마이그레이션 실패:', error);
  }
}

migrateData(); 