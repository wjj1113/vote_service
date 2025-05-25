export async function sendKakaoMessage(userId: string, pledge: string, status: string) {
  const message = `${pledge} 공약이 ${status} 상태로 변경되었습니다.`;
  // 카카오톡 API 호출 로직 (예시)
  console.log(`카카오톡 메시지 전송: ${userId}에게 ${message}`);
  // 실제 API 호출은 카카오톡 API 키와 엔드포인트 필요
} 