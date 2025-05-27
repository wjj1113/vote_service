// Google Analytics 이벤트 트래킹 유틸
export const GA_EVENT = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

// GA4 주요 이벤트에 잘 보이도록 이벤트 이름을 구체적으로 보내는 함수
export const GA_EVENT_DETAILED = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params || {});
  }
};

// 해시 변경 시 page_view를 트래킹하는 React 훅
import { useEffect } from 'react';
export function useHashPageView() {
  useEffect(() => {
    const sendPageView = () => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname + window.location.hash,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };
    window.addEventListener('hashchange', sendPageView);
    return () => window.removeEventListener('hashchange', sendPageView);
  }, []);
} 