'use client';

import { useState } from 'react';

interface SocialAccount {
  provider: 'kakao' | /* 'naver' | */ 'google' /* | 'apple' */;
  name: string;
  connected: boolean;
  connectedAt?: string;
}

const INITIAL_ACCOUNTS: SocialAccount[] = [
  { provider: 'kakao', name: '카카오', connected: true, connectedAt: '2025.12.01' },
  // { provider: 'naver', name: '네이버', connected: true, connectedAt: '2025.12.15' },
  { provider: 'google', name: '구글', connected: false },
  // { provider: 'apple', name: '애플', connected: false },
];

function KakaoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FEE500" />
      <path
        d="M12 5.5C8.134 5.5 5 7.91 5 10.9c0 1.892 1.187 3.558 2.992 4.573l-.762 2.838a.25.25 0 00.38.271l3.293-2.19c.355.05.718.076 1.097.076 3.866 0 7-2.41 7-5.4S15.866 5.5 12 5.5z"
        fill="#1A1A1A"
      />
    </svg>
  );
}

// function NaverIcon() {
//   return (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//       <rect width="24" height="24" rx="6" fill="#03C75A" />
//       <path d="M13.4 12.2L10.4 7H8v10h2.6v-5.2L13.6 17H16V7h-2.6v5.2z" fill="white" />
//     </svg>
//   );
// }

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#F2F2F2" />
      <path
        d="M12 11.2V13h3.4c-.14.9-.88 2.6-3.4 2.6-2.04 0-3.7-1.69-3.7-3.76S9.96 8.08 12 8.08c1.16 0 1.94.5 2.38.92l1.62-1.56C14.9 6.5 13.58 5.84 12 5.84c-3.42 0-6.16 2.76-6.16 6.16S8.58 18.16 12 18.16c3.56 0 5.92-2.5 5.92-6.02 0-.4-.04-.7-.1-1h-5.82z"
        fill="#4285F4"
      />
    </svg>
  );
}

// function AppleIcon() {
//   return (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//       <rect width="24" height="24" rx="6" fill="#1A1A1A" />
//       <path
//         d="M15.6 7.3c-.9 1.1-.8 2.2-.8 2.2s1.2.1 2.1-1c.8-1 .8-2.2.8-2.2s-1.2-.1-2.1 1zM17.5 10.1c-.5-.3-1.4-.5-2.2-.5-1 0-1.4.5-2.2.5-.8 0-1.4-.5-2.2-.5-1.6 0-3.4 1.4-3.4 4.2 0 2.2 1.2 5.7 2.8 5.7.7 0 1.3-.5 2-.5.8 0 1.2.5 2.1.5.7 0 1.3-.4 1.8-1 .5-.6.8-1.4 1-2.2-1-.5-1.8-1.5-1.8-2.8 0-1.2.7-2.2 1.8-2.7l-.7-.7z"
//         fill="white"
//       />
//     </svg>
//   );
// }

const PROVIDER_ICONS = {
  kakao: <KakaoIcon />,
  // naver: <NaverIcon />,
  google: <GoogleIcon />,
  // apple: <AppleIcon />,
};

export default function SocialPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_ACCOUNTS);

  const connectedCount = accounts.filter((a) => a.connected).length;

  const handleDisconnect = (provider: SocialAccount['provider']) => {
    if (connectedCount <= 1) return;
    setAccounts((prev) =>
      prev.map((a) => (a.provider === provider ? { ...a, connected: false, connectedAt: undefined } : a))
    );
  };

  const handleConnect = (provider: SocialAccount['provider']) => {
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', '');
    setAccounts((prev) =>
      prev.map((a) => (a.provider === provider ? { ...a, connected: true, connectedAt: today } : a))
    );
  };

  return (
    <div className="min-h-screen bg-canvas px-5 py-6 space-y-4">
      {/* 헤더 */}
      <h1 className="text-xl font-bold text-text-1">소셜 계정 연결</h1>

      {/* 연결된 계정 수 카드 */}
      <div className="bg-white rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-2">연결된 계정</p>
          <p className="text-base text-text-1 mt-0.5">소셜 계정을 연결하여 편리하게 로그인하세요</p>
        </div>
        <span className="text-3xl font-bold text-primary">{connectedCount}</span>
      </div>

      {/* 소셜 계정 카드 목록 */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.provider} className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {PROVIDER_ICONS[account.provider]}
                <div>
                  <p className="text-[15px] font-semibold text-text-1">{account.name}</p>
                  {account.connected && account.connectedAt ? (
                    <p className="text-xs text-text-3 mt-0.5">{account.connectedAt} 연결됨</p>
                  ) : (
                    <p className="text-xs text-text-3 mt-0.5">연결되지 않음</p>
                  )}
                </div>
              </div>

              {account.connected ? (
                <button
                  onClick={() => handleDisconnect(account.provider)}
                  disabled={connectedCount <= 1}
                  className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
                    connectedCount <= 1
                      ? 'border-border text-[#CCCCCC] cursor-not-allowed'
                      : 'border-text-3 text-text-2 hover:bg-gray-50'
                  }`}
                >
                  연결 해제
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(account.provider)}
                  className="px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  연결하기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 알아두세요 카드 */}
      <div className="bg-white rounded-2xl p-5">
        <p className="text-sm font-bold text-amber mb-3">알아두세요</p>
        <ul className="space-y-2">
          {[
            '최소 1개의 소셜 계정이 연결되어 있어야 합니다.',
            '계정 연결 해제 시 해당 소셜 계정으로는 로그인할 수 없습니다.',
            '연결된 계정의 개인정보는 오티움에 저장되지 않습니다.',
            '소셜 계정 연결 시 해당 서비스의 이용약관에 동의하게 됩니다.',
          ].map((text, i) => (
            <li key={i} className="flex gap-2 text-sm text-text-2">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-text-3 shrink-0" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
