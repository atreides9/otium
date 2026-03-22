'use client';

import { useState } from 'react';

interface Permission {
  key: string;
  emoji: string;
  label: string;
  desc: string;
}

const PERMISSIONS: Permission[] = [
  { key: 'notification', emoji: '🔔', label: '알림', desc: '독서 기록 알림 및 친구 메시지 알림' },
  { key: 'camera', emoji: '📷', label: '카메라', desc: '책 표지 촬영 및 프로필 사진 촬영' },
  { key: 'photo', emoji: '🖼', label: '사진', desc: '앨범에서 책 표지 및 프로필 사진 선택' },
  { key: 'microphone', emoji: '🎤', label: '마이크', desc: '음성 메모 녹음' },
  { key: 'location', emoji: '📍', label: '위치', desc: '근처 서점 및 도서관 정보 제공' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ backgroundColor: value ? 'var(--color-primary)' : 'var(--color-border)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export default function PermissionsPage() {
  const [granted, setGranted] = useState<Record<string, boolean>>({
    notification: false,
    camera: false,
    photo: false,
    microphone: false,
    location: false,
  });

  const grantedCount = Object.values(granted).filter(Boolean).length;

  const toggle = (key: string) => {
    setGranted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-canvas px-5 py-6 space-y-4">
      <h1 className="text-xl font-bold text-text-1">앱 권한 관리</h1>

      {/* 허용된 권한 요약 카드 */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3 bg-primary"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-xl">🔐</span>
        </div>
        <div>
          <p className="text-base font-bold text-white">
            허용된 권한 {grantedCount}/5
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {grantedCount === 0
              ? '아직 허용된 권한이 없어요'
              : grantedCount === 5
              ? '모든 권한이 허용되어 있어요'
              : `${5 - grantedCount}개 권한이 비활성화되어 있어요`}
          </p>
        </div>
      </div>

      {/* 권한 목록 카드 */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-border">
        <p className="px-4 pt-3 pb-1 text-xs font-semibold text-text-3">
          권한 설정
        </p>
        {PERMISSIONS.map((perm, i) => (
          <div
            key={perm.key}
            className="flex items-center justify-between px-4 py-3.5"
            style={i < PERMISSIONS.length - 1 ? { borderBottom: '1px solid var(--color-canvas)' } : undefined}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">{perm.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-1">
                  {perm.label}
                </p>
                <p className="text-xs truncate text-text-3">
                  {perm.desc}
                </p>
              </div>
            </div>
            <div className="ml-3 flex-shrink-0">
              <Toggle value={granted[perm.key]} onChange={() => toggle(perm.key)} />
            </div>
          </div>
        ))}
      </div>

      {/* 시스템 권한 설정 카드 */}
      <div className="rounded-2xl p-4 space-y-3 bg-surface border border-border">
        <div>
          <p className="text-sm font-semibold text-text-1">
            시스템 권한 설정
          </p>
          <p className="text-xs mt-0.5 text-text-3">
            일부 권한은 기기 설정에서 직접 변경해야 합니다
          </p>
        </div>
        <button
          className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-1)', backgroundColor: 'transparent' }}
        >
          기기 설정 열기
        </button>
      </div>

      {/* 권한 안내 카드 */}
      <div className="rounded-2xl p-4 bg-surface border border-border">
        <p className="text-sm font-bold mb-3 text-amber">
          권한 안내
        </p>
        <ul className="space-y-2.5">
          {[
            '권한은 앱 기능 사용 시 필요한 경우에만 요청됩니다',
            '권한을 거부해도 해당 기능을 제외한 앱 이용은 가능합니다',
            '모바일 앱 전환 시 실제 기기 권한과 자동으로 연동됩니다',
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber" />
              <span className="text-xs leading-relaxed text-text-2">
                {text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
