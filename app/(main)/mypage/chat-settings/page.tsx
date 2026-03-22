'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
type Day = (typeof DAYS)[number];

interface Settings {
  chat_notification: boolean;
  notification_sound: boolean;
  notification_vibration: boolean;
  weekly_reset_day: Day;
}

const DEFAULT_SETTINGS: Settings = {
  chat_notification: true,
  notification_sound: true,
  notification_vibration: false,
  weekly_reset_day: '월',
};

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function VibrateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 5h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="var(--color-primary)" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

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

function ToggleRow({
  icon,
  label,
  value,
  onChange,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3.5"
      style={last ? undefined : { borderBottom: '1px solid var(--color-canvas)' }}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-text-1">
          {label}
        </span>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 bg-surface">
        <h3 className="text-base font-bold mb-2 text-text-1">
          모든 대화 삭제
        </h3>
        <p className="text-sm mb-6 text-text-2">
          삭제된 대화는 복구할 수 없습니다. 정말 삭제하시겠습니까?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-2)' }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-danger)' }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('user_settings')
        .select('chat_notification, notification_sound, notification_vibration, weekly_reset_day')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        setSettings({
          chat_notification: data.chat_notification ?? DEFAULT_SETTINGS.chat_notification,
          notification_sound: data.notification_sound ?? DEFAULT_SETTINGS.notification_sound,
          notification_vibration: data.notification_vibration ?? DEFAULT_SETTINGS.notification_vibration,
          weekly_reset_day: (data.weekly_reset_day as Day) ?? DEFAULT_SETTINGS.weekly_reset_day,
        });
      }
    })();
  }, []);

  const save = async (next: Settings) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...next }, { onConflict: 'user_id' });
      if (error) console.error('설정 저장 실패:', error.message);
    }
    setSaving(false);
  };

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    save(next);
  };

  const handleDeleteAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    if (error) console.error('대화 삭제 실패:', error.message);
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-canvas px-5 py-6 space-y-4">
      {/* 헤더 */}
      <h1 className="text-xl font-bold text-text-1">채팅 설정</h1>

      {/* 알림 설정 카드 */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-border">
        <p className="px-4 pt-3 pb-1 text-xs font-semibold text-text-3">
          알림 설정
        </p>
        <ToggleRow
          icon={<BellIcon />}
          label="채팅 알림"
          value={settings.chat_notification}
          onChange={(v) => update({ chat_notification: v })}
        />
        <ToggleRow
          icon={<SoundIcon />}
          label="알림 소리"
          value={settings.notification_sound}
          onChange={(v) => update({ notification_sound: v })}
        />
        <ToggleRow
          icon={<VibrateIcon />}
          label="진동"
          value={settings.notification_vibration}
          onChange={(v) => update({ notification_vibration: v })}
          last
        />
      </div>

      {/* 주간 리셋 요일 카드 */}
      <div className="rounded-2xl p-4 bg-surface border border-border">
        <div className="flex items-center gap-2 mb-1">
          <ClockIcon />
          <p className="text-sm font-semibold text-text-1">
            주간 리셋 요일
          </p>
        </div>
        <p className="text-xs mb-3 text-text-3">
          새싹/나무 단계의 메시지 제한이 초기화되는 요일
        </p>
        <div className="flex gap-2">
          {DAYS.map((day) => {
            const selected = settings.weekly_reset_day === day;
            return (
              <button
                key={day}
                onClick={() => update({ weekly_reset_day: day })}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-canvas)',
                  color: selected ? '#FFFFFF' : 'var(--color-text-2)',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 메시지 기록 카드 */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-border">
        <p className="px-4 pt-3 pb-1 text-xs font-semibold text-text-3">
          메시지 기록
        </p>
        <div
          className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: '1px solid var(--color-canvas)' }}
        >
          <span className="text-sm text-text-1">
            모든 대화 백업
          </span>
          <button className="text-sm font-medium text-primary">
            실행
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-text-1">
            모든 대화 삭제
          </span>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm font-medium"
            style={{ color: 'var(--color-danger)' }}
          >
            삭제
          </button>
        </div>
      </div>

      {/* 채팅 제한 안내 카드 */}
      <div className="rounded-2xl p-4 bg-surface border border-border">
        <p className="text-sm font-bold mb-3 text-amber">
          채팅 제한 안내
        </p>
        <div className="space-y-3">
          {[
            {
              stage: '🌱 새싹',
              period: 'D+1~7',
              desc: '하루 3개 구절 전송 가능, 요일마다 초기화',
            },
            {
              stage: '🌳 나무',
              period: 'D+8~30',
              desc: '메시지 30자 / 하루 30개 / 2시간 간격, 요일마다 초기화',
            },
            {
              stage: '🌲 숲',
              period: 'D+31~',
              desc: '제한 없음',
            },
          ].map(({ stage, period, desc }, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0">
                <span className="text-sm font-semibold text-text-1">
                  {stage}
                </span>
                <span className="ml-1 text-xs text-text-3">
                  ({period})
                </span>
              </div>
              <p className="text-xs leading-relaxed text-text-2">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {saving && (
        <p className="text-center text-xs text-text-3">
          저장 중...
        </p>
      )}

      {showDeleteModal && (
        <ConfirmModal
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
