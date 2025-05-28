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

    // 정당 데이터 수집
    const parties = new Set(data.candidates.map((c: any) => c.party));
    const partyMap = new Map();

    // 정당 데이터 삽입
    for (const partyName of parties) {
      let partyId = null;
      const { data: insertedParty, error: partyError } = await supabase
        .from('Party')
        .insert({
          name: partyName,
          policy: '' // 기본값 설정
        })
        .select()
        .single();

      if (partyError) {
        // 중복(이미 존재) 오류라면, 해당 정당의 ID를 조회
        if (partyError.code === '23505') {
          const { data: existingParty, error: fetchError } = await supabase
            .from('Party')
            .select('id')
            .eq('name', partyName)
            .single();
          if (fetchError || !existingParty) {
            console.error(`Error fetching existing party ${partyName}:`, fetchError);
            continue;
          }
          partyId = existingParty.id;
        } else {
          console.error(`Error inserting party ${partyName}:`, partyError);
          continue;
        }
      } else {
        partyId = insertedParty.id;
      }
      partyMap.set(partyName, partyId);
    }

    // 후보자 데이터 변환 및 삽입
    for (const candidate of data.candidates) {
      const partyId = partyMap.get(candidate.party);
      
      if (!partyId) {
        console.error(`Error: Party ID not found for ${candidate.party}`);
        continue;
      }

      // 후보자 데이터 삽입
      const { data: insertedCandidate, error: candidateError } = await supabase
        .from('Candidate')
        .insert({
          name: candidate.name,
          party: candidate.party,
          partyId: partyId,
          imageUrl: candidate.imageUrl || null
        })
        .select()
        .single();

      if (candidateError) {
        console.error(`Error inserting candidate ${candidate.name}:`, candidateError);
        continue;
      }

      // 정책 데이터 삽입
      for (const pledge of candidate.pledges) {
        const { error: policyError } = await supabase
          .from('Policy')
          .insert({
            id: uuidv4(),
            candidateId: insertedCandidate.id,
            order: pledge.rank,
            title: pledge.title,
            categories: pledge.categories,
            goal: pledge.goal,
            implementation: pledge.methods.join('\n'),
            duration: pledge.period,
            budget: pledge.funding,
            summary: pledge.goal.split('.')[0],
            updatedAt: new Date().toISOString()
          });

        if (policyError) {
          console.error(`Error inserting policy for ${candidate.name}:`, policyError);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData(); 