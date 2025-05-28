var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
require('dotenv').config();
var createClient = require('@supabase/supabase-js').createClient;
var fs = require('fs');
var path = require('path');
var uuidv4 = require('uuid').v4;
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}
var supabase = createClient(supabaseUrl, supabaseKey);
function migrateData() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, jsonData, data, parties, partyMap, _i, parties_1, partyName, partyId, _a, existingParty, fetchError, _b, insertedParty, partyError, _c, _d, candidate, cleanPartyName, partyId, _e, insertedCandidate, candidateError, _f, _g, pledge, policyError, error_1;
        var _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 15, , 16]);
                    filePath = path.join(process.cwd(), 'db_list_clean.json');
                    jsonData = fs.readFileSync(filePath, 'utf8');
                    data = JSON.parse(jsonData);
                    // candidates 배열 상태 출력
                    console.log('[DEBUG] candidates 개수:', (_h = data.candidates) === null || _h === void 0 ? void 0 : _h.length);
                    parties = new Set(data.candidates.map(function (c) { return c.party.trim(); }));
                    console.log('[DEBUG] parties Set:', Array.from(parties));
                    partyMap = new Map();
                    console.log('=== 정당 데이터 마이그레이션 시작 ===');
                    _i = 0, parties_1 = parties;
                    _j.label = 1;
                case 1:
                    if (!(_i < parties_1.length)) return [3 /*break*/, 7];
                    partyName = parties_1[_i];
                    partyId = null;
                    console.log("\uC815\uB2F9 \uCC98\uB9AC \uC911: ".concat(partyName));
                    // 삽입 시도 전 로그
                    console.log("[DEBUG] Party \uC0BD\uC785 \uC2DC\uB3C4: ".concat(partyName));
                    return [4 /*yield*/, supabase
                            .from('Party')
                            .select('id')
                            .eq('name', partyName)
                            .single()];
                case 2:
                    _a = _j.sent(), existingParty = _a.data, fetchError = _a.error;
                    if (!existingParty) return [3 /*break*/, 3];
                    partyId = existingParty.id;
                    console.log("\uAE30\uC874 \uC815\uB2F9 ID \uCC3E\uC74C: ".concat(partyName, " -> ").concat(partyId));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, supabase
                        .from('Party')
                        .insert({
                        name: partyName,
                        policy: ''
                    })
                        .select()
                        .single()];
                case 4:
                    _b = _j.sent(), insertedParty = _b.data, partyError = _b.error;
                    // 삽입 후 결과 로그
                    console.log("[DEBUG] Party \uC0BD\uC785 \uACB0\uACFC:", insertedParty, partyError);
                    if (partyError) {
                        console.error("\uC815\uB2F9 \uC0BD\uC785 \uC624\uB958 ".concat(partyName, ":"), partyError, JSON.stringify(partyError, null, 2));
                        return [3 /*break*/, 6];
                    }
                    partyId = insertedParty.id;
                    console.log("\uC0C8 \uC815\uB2F9 \uC0DD\uC131\uB428: ".concat(partyName, " -> ").concat(partyId));
                    _j.label = 5;
                case 5:
                    // partyMap 저장 로그
                    console.log("[DEBUG] partyMap \uC800\uC7A5: ".concat(partyName, " -> ").concat(partyId));
                    partyMap.set(partyName, partyId);
                    _j.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log('=== 후보자 데이터 마이그레이션 시작 ===');
                    _c = 0, _d = data.candidates;
                    _j.label = 8;
                case 8:
                    if (!(_c < _d.length)) return [3 /*break*/, 14];
                    candidate = _d[_c];
                    cleanPartyName = candidate.party.trim();
                    partyId = partyMap.get(cleanPartyName);
                    if (!partyId) {
                        console.error("\uC815\uB2F9 ID\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC74C: ".concat(cleanPartyName));
                        return [3 /*break*/, 13];
                    }
                    console.log("\uD6C4\uBCF4\uC790 \uCC98\uB9AC \uC911: ".concat(candidate.name, " (").concat(cleanPartyName, ")"));
                    return [4 /*yield*/, supabase
                            .from('Candidate')
                            .insert({
                            name: candidate.name,
                            party: cleanPartyName,
                            partyid: partyId,
                            imageurl: candidate.image || null
                        })
                            .select()
                            .single()];
                case 9:
                    _e = _j.sent(), insertedCandidate = _e.data, candidateError = _e.error;
                    if (candidateError) {
                        console.error("\uD6C4\uBCF4\uC790 \uC0BD\uC785 \uC624\uB958 ".concat(candidate.name, ":"), candidateError);
                        return [3 /*break*/, 13];
                    }
                    console.log("\uD6C4\uBCF4\uC790 \uC0DD\uC131\uB428: ".concat(candidate.name, " -> ").concat(insertedCandidate.id));
                    _f = 0, _g = candidate.pledges;
                    _j.label = 10;
                case 10:
                    if (!(_f < _g.length)) return [3 /*break*/, 13];
                    pledge = _g[_f];
                    return [4 /*yield*/, supabase
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
                        })];
                case 11:
                    policyError = (_j.sent()).error;
                    if (policyError) {
                        console.error("\uC815\uCC45 \uC0BD\uC785 \uC624\uB958 (".concat(candidate.name, "):"), policyError);
                    }
                    _j.label = 12;
                case 12:
                    _f++;
                    return [3 /*break*/, 10];
                case 13:
                    _c++;
                    return [3 /*break*/, 8];
                case 14:
                    console.log('=== 마이그레이션 완료! ===');
                    return [3 /*break*/, 16];
                case 15:
                    error_1 = _j.sent();
                    console.error('마이그레이션 실패:', error_1);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
migrateData();
