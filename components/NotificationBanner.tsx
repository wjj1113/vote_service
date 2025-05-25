import React, { useState, useEffect } from 'react';

interface Notification {
  id: number;
  userId: string;
  pledge: string;
  status: string;
  sentAt: string;
}

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pledge, setPledge] = useState('');
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationType, setNotificationType] = useState<'email' | 'push'>('email');

  useEffect(() => {
    // 알림 구독 상태 확인
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/notifications/subscription');
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          pledge,
          status,
          email: notificationType === 'email' ? email : undefined,
        }),
      });

      if (response.ok) {
        alert('알림이 전송되었습니다.');
        setPledge('');
        setStatus('');
        setEmail('');
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('알림 전송에 실패했습니다.');
    }
  };

  const handleSubscribe = async () => {
    try {
      if (notificationType === 'push') {
        // 푸시 알림 구독
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            type: 'push',
          }),
        });
      } else {
        // 이메일 알림 구독
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            type: 'email',
          }),
        });
      }

      setIsSubscribed(true);
      alert('알림 구독이 완료되었습니다.');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('알림 구독에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">공약 이행 알림</h2>

      {/* 알림 구독 */}
      {!isSubscribed && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">알림 구독</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 수신 방식
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={notificationType === 'email'}
                    onChange={(e) => setNotificationType(e.target.value as 'email')}
                    className="mr-2"
                  />
                  이메일
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="push"
                    checked={notificationType === 'push'}
                    onChange={(e) => setNotificationType(e.target.value as 'push')}
                    className="mr-2"
                  />
                  푸시 알림
                </label>
              </div>
            </div>

            {notificationType === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="example@email.com"
                  required
                />
              </div>
            )}

            <button
              onClick={handleSubscribe}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              알림 구독하기
            </button>
          </div>
        </div>
      )}

      {/* 알림 전송 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            공약
          </label>
          <input
            type="text"
            value={pledge}
            onChange={(e) => setPledge(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="공약을 입력하세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상태
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">선택하세요</option>
            <option value="이행">이행</option>
            <option value="미이행">미이행</option>
            <option value="진행중">진행중</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          알림 전송
        </button>
      </form>

      {/* 최근 알림 목록 */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">최근 알림</h3>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <p className="font-medium">{notification.pledge}</p>
                <p className="text-sm text-gray-600">
                  상태: {notification.status}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.sentAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 