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

async function restoreData() {
  try {
    // 1. 기존 데이터 삭제
    console.log('Cleaning up existing data...');
    await supabase.from('Policy').delete().neq('id', 'dummy');
    await supabase.from('Candidate').delete().neq('id', 'dummy');
    await supabase.from('Party').delete().neq('id', 0);

    // 2. JSON 파일 읽기
    console.log('Reading data from JSON file...');
    const filePath = path.join(process.cwd(), 'db_list_clean.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);

    // 3. 정당 데이터 복원
    console.log('Restoring party data...');
    const parties = new Set(data.candidates.map(c => c.party));
    const partyMap = new Map();

    for (const partyName of parties) {
      const { data: insertedParty, error: partyError } = await supabase
        .from('Party')
        .insert({
          name: partyName,
          policy: '정책 없음'
        })
        .select()
        .single();

      if (partyError || !insertedParty) {
        // 중복이거나, 삽입 실패 시 항상 select로 id를 가져옴
        const { data: existingParty, error: fetchError } = await supabase
          .from('Party')
          .select('id')
          .eq('name', partyName)
          .single();
        
        if (fetchError || !existingParty) {
          console.error(`Error fetching existing party ${partyName}:`, fetchError);
          continue;
        }
        partyMap.set(partyName.replace(/\s/g, ''), existingParty.id);
        console.log(`partyMap.set(${partyName.replace(/\s/g, '')}, ${existingParty.id})`);
      } else {
        partyMap.set(partyName.replace(/\s/g, ''), insertedParty.id);
        console.log(`partyMap.set(${partyName.replace(/\s/g, '')}, ${insertedParty.id})`);
      }
    }

    // 4. 후보자 데이터 복원
    console.log('Restoring candidate data...');
    for (const candidate of data.candidates) {
      console.log(`Trying to match candidate.party: [${candidate.party}]`);
      console.log('partyMap keys:', Array.from(partyMap.keys()));
      const partyId = partyMap.get(candidate.party.replace(/\s/g, ''));
      
      if (!partyId) {
        console.error(
          `Error: Party ID not found for [${candidate.party}] | partyMap keys: [${Array.from(partyMap.keys()).join(', ')}]`
        );
        continue;
      }

      const { data: insertedCandidate, error: candidateError } = await supabase
        .from('Candidate')
        .insert({
          id: uuidv4(),
          name: candidate.name,
          party: candidate.party,
          partyid: partyId,
          imageUrl: candidate.imageUrl || null
        })
        .select()
        .single();

      if (candidateError) {
        console.error(`Error inserting candidate ${candidate.name}:`, candidateError);
        continue;
      }

      // 5. 정책 데이터 복원
      console.log(`Restoring policies for ${candidate.name}...`);
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
          console.error(`Error inserting policy for ${candidate.name}:`, policyError);
        }
      }
    }

    console.log('Data restoration completed successfully!');
  } catch (error) {
    console.error('Data restoration failed:', error);
  }
}

restoreData(); 