'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Level = 'sprout' | 'tree' | 'forest'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  type: 'text' | 'quote'
}

interface FriendInfo {
  id: string
  nickname: string
  avatar_url: string | null
  is_online: boolean
}

interface FriendshipInfo {
  level: Level
  days_together: number
  message_count_today: number
}

const LEVEL_CONFIG: Record<Level, {
  label: string
  icon: string
  bannerBg: string
  bannerText: string
  badgeBg: string
  badgeText: string
}> = {
  sprout: {
    label: '새싹',
    icon: '🌱',
    bannerBg: '#FFF3E8',
    bannerText: '#D4824A',
    badgeBg: '#FFE0C2',
    badgeText: '#D4824A',
  },
  tree: {
    label: '나무',
    icon: '🌳',
    bannerBg: '#E8F0F8',
    bannerText: '#6B8FB5',
    badgeBg: '#C8DCF0',
    badgeText: '#4A6F9A',
  },
  forest: {
    label: '숲',
    icon: '🌲',
    bannerBg: '#E8F4EE',
    bannerText: '#4A7C5F',
    badgeBg: '#C2DFD0',
    badgeText: '#3A6A50',
  },
}

const MAX_CHARS_TREE = 30
const MAX_MESSAGES_PER_DAY_TREE = 5

function formatTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`
}

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [myId, setMyId] = useState<string | null>(null)
  const [friend, setFriend] = useState<FriendInfo | null>(null)
  const [friendship, setFriendship] = useState<FriendshipInfo>({
    level: 'sprout',
    days_together: 0,
    message_count_today: 0,
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const level = friendship.level
  const cfg = LEVEL_CONFIG[level]

  // 초기 데이터 로드
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setMyId(user.id)

      const [friendRes, friendshipRes, msgRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, nickname, avatar_url, is_online')
          .eq('id', friendId)
          .single(),
        supabase
          .from('friendships')
          .select('level, created_at, message_count_today')
          .eq('user_id', user.id)
          .eq('friend_id', friendId)
          .single(),
        supabase
          .from('messages')
          .select('id, sender_id, content, created_at, type')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })
          .limit(100),
      ])

      if (friendRes.data) {
        setFriend(friendRes.data as FriendInfo)
      }

      if (friendshipRes.data) {
        const createdAt = new Date(friendshipRes.data.created_at)
        const days = Math.floor((Date.now() - createdAt.getTime()) / 86400000)
        setFriendship({
          level: (friendshipRes.data.level as Level) ?? 'sprout',
          days_together: days,
          message_count_today: friendshipRes.data.message_count_today ?? 0,
        })
      }

      if (msgRes.data) {
        setMessages(msgRes.data as Message[])
      }

      setLoading(false)
    }
    load()
  }, [friendId, router, supabase])

  // Realtime 구독
  useEffect(() => {
    if (!myId) return

    const channel = supabase
      .channel(`chat:${[myId, friendId].sort().join('_')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${myId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          if (msg.sender_id === friendId) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [myId, friendId, supabase])

  // 스크롤 하단 유지
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (content: string, type: 'text' | 'quote' = 'text') => {
    if (!myId || !content.trim()) return

    const optimisticMsg: Message = {
      id: `tmp_${Date.now()}`,
      sender_id: myId,
      content,
      created_at: new Date().toISOString(),
      type,
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setInput('')

    const { error } = await supabase.from('messages').insert({
      sender_id: myId,
      receiver_id: friendId,
      content,
      type,
    })

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
    }
  }, [myId, friendId, supabase])

  const handleSend = () => {
    if (level === 'tree' && input.length > MAX_CHARS_TREE) return
    if (level === 'tree' && friendship.message_count_today >= MAX_MESSAGES_PER_DAY_TREE) return
    sendMessage(input)
  }

  const handleQuoteSend = () => {
    // 실제 구절 선택 UI 연동 시 교체
    sendMessage('📖 구절을 공유했어요', 'quote')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0EDE8' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#4A7C5F', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const remainingMsgs = MAX_MESSAGES_PER_DAY_TREE - friendship.message_count_today
  const isTreeLimitReached = level === 'tree' && friendship.message_count_today >= MAX_MESSAGES_PER_DAY_TREE

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F0EDE8' }}>
      {/* 상단 배너 */}
      <div
        className="flex-shrink-0 pt-14 pb-3 px-5"
        style={{ backgroundColor: cfg.bannerBg }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="mr-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke={cfg.bannerText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 아바타 */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
              style={{
                backgroundColor: friend?.avatar_url ? undefined : '#E5E1DC',
                backgroundImage: friend?.avatar_url ? `url(${friend.avatar_url})` : undefined,
                backgroundSize: 'cover',
                color: '#666666',
              }}
            >
              {!friend?.avatar_url && (friend?.nickname[0] ?? '?')}
            </div>
            {friend?.is_online && (
              <span
                className="absolute bottom-0 right-0 rounded-full border-2"
                style={{ width: 10, height: 10, backgroundColor: '#4A7C5F', borderColor: cfg.bannerBg }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base truncate" style={{ color: cfg.bannerText }}>
                {friend?.nickname ?? ''}
              </span>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
              >
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <p className="text-[11px]" style={{ color: cfg.bannerText + 'AA' }}>
              D+{friendship.days_together}
            </p>
          </div>
        </div>

        {/* 단계별 안내 */}
        {level === 'sprout' && (
          <div
            className="mt-3 rounded-xl px-3 py-2 text-[11px]"
            style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
          >
            🌱 새싹 단계에서는 구절만 공유할 수 있어요
          </div>
        )}
        {level === 'tree' && (
          <div
            className="mt-3 rounded-xl px-3 py-2 text-[11px] flex items-center justify-between"
            style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
          >
            <span>🌳 오늘 메시지 {friendship.message_count_today}/{MAX_MESSAGES_PER_DAY_TREE}회 · 30자 제한</span>
            {isTreeLimitReached && <span className="font-semibold">내일 다시 대화해요</span>}
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-16">
            <span className="text-4xl">{cfg.icon}</span>
            <p className="text-sm" style={{ color: '#999999' }}>
              {level === 'sprout'
                ? '좋아하는 구절을 공유해보세요'
                : level === 'tree'
                ? '짧은 메시지로 마음을 나눠보세요'
                : '자유롭게 대화해보세요'}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === myId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
                {msg.type === 'quote' ? (
                  <div
                    className="px-4 py-3 rounded-2xl text-sm"
                    style={{
                      backgroundColor: isMe ? '#4A7C5F' : '#FFFFFF',
                      color: isMe ? '#FFFFFF' : '#1A1A1A',
                      border: isMe ? 'none' : '1px solid #E5E1DC',
                      borderLeft: `3px solid ${isMe ? '#C4973A' : '#C4973A'}`,
                    }}
                  >
                    <p className="text-[10px] mb-1 opacity-70">구절 공유</p>
                    <p>{msg.content}</p>
                  </div>
                ) : (
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      backgroundColor: isMe ? '#4A7C5F' : '#FFFFFF',
                      color: isMe ? '#FFFFFF' : '#1A1A1A',
                      border: isMe ? 'none' : '1px solid #E5E1DC',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}
                  >
                    {msg.content}
                  </div>
                )}
                <p
                  className={`text-[10px] mt-1 ${isMe ? 'text-right' : 'text-left'}`}
                  style={{ color: '#BBBBBB' }}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div
        className="flex-shrink-0 px-5 py-3 pb-safe"
        style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E1DC' }}
      >
        {level === 'sprout' ? (
          /* 새싹: 구절 선택 버튼만 */
          <button
            onClick={handleQuoteSend}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#4A7C5F', color: '#FFFFFF' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H21M3 12H15M3 18H9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            구절 선택하기
          </button>
        ) : (
          /* 나무 / 숲: 텍스트 입력 */
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => {
                  if (level === 'tree' && e.target.value.length > MAX_CHARS_TREE) return
                  setInput(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                placeholder={
                  isTreeLimitReached
                    ? '오늘 메시지 한도에 도달했어요'
                    : level === 'tree'
                    ? `메시지 입력 (${MAX_CHARS_TREE}자 이내)`
                    : '메시지를 입력하세요'
                }
                disabled={isTreeLimitReached}
                rows={1}
                className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: '#F0EDE8',
                  color: '#1A1A1A',
                  maxHeight: 100,
                  lineHeight: '1.4',
                }}
              />
              {level === 'tree' && (
                <span
                  className="absolute bottom-2.5 right-3 text-[11px]"
                  style={{ color: input.length >= MAX_CHARS_TREE ? '#D4824A' : '#BBBBBB' }}
                >
                  {input.length}/{MAX_CHARS_TREE}
                </span>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTreeLimitReached}
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{
                backgroundColor: '#4A7C5F',
                opacity: !input.trim() || isTreeLimitReached ? 0.4 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {level === 'tree' && !isTreeLimitReached && (
          <p className="text-[11px] text-center mt-2" style={{ color: '#BBBBBB' }}>
            오늘 {remainingMsgs}회 더 보낼 수 있어요
          </p>
        )}
      </div>
    </div>
  )
}
