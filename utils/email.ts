// 이메일 저장 함수 (DB 저장)
export async function saveEmail(email: string) {
  const res = await fetch('/api/save-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('이메일 저장 실패');
  return true;
} 