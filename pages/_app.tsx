import { useEffect } from 'react';
import Script from 'next/script';
import type { AppProps } from 'next/app'
import Layout from '../components/Layout';
import '../styles/globals.css'
import { useHashPageView } from '../lib/gtag';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoadingProvider } from '../contexts/LoadingContext';

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        [key: string]: any;
      }
    ) => void;
    Kakao: any;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  useHashPageView();
  useEffect(() => {
    // GA4 이벤트 추적 함수
    const trackEvent = (action: string, category?: string, label?: string) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
        });
      }
    };

    // 페이지뷰 추적
    trackEvent('page_view');

    if (window.Kakao) {
      const kakao = window.Kakao;
      if (!kakao.isInitialized()) {
        kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
      }
    }
  }, []);

  return (
    <LoadingProvider>
      <Layout>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
        <Script
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="afterInteractive"
        />
        <Component {...pageProps} />
      </Layout>
    </LoadingProvider>
  );
} 