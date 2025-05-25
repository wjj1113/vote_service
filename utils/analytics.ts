import { v4 as uuidv4 } from 'uuid';

// 세션 ID 생성 또는 가져오기
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// 페이지뷰 추적
export const trackPageView = (page: string) => {
  const sessionId = getSessionId();
  fetch('/api/track-activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      page,
      action: 'view',
    }),
  });
};

// 클릭 이벤트 추적
export const trackClick = (
  elementId: string,
  elementType: string,
  metadata?: any
) => {
  const sessionId = getSessionId();
  fetch('/api/track-activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      page: window.location.pathname,
      action: 'click',
      elementId,
      elementType,
      metadata,
    }),
  });
};

// 폼 제출 추적
export const trackFormSubmit = (
  formId: string,
  formData: any
) => {
  const sessionId = getSessionId();
  fetch('/api/track-activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      page: window.location.pathname,
      action: 'submit',
      elementId: formId,
      elementType: 'form',
      metadata: formData,
    }),
  });
}; 