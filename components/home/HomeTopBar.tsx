'use client'
import { useState } from 'react'
import { Bell, X } from 'lucide-react'

export default function HomeTopBar({ greeting, nickname }: { greeting: string; nickname: string }) {
  const [showNotification, setShowNotification] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between pt-[60px] pb-4 px-5">
        <div>
          <p className="text-[13px] text-[#6B5E57]">{greeting}</p>
          <h1 className="text-[22px] font-bold text-[#1C1410]">{nickname}님의 서재</h1>
        </div>
        <button
          onClick={() => setShowNotification(true)}
          className="w-[44px] h-[44px] flex items-center justify-center"
        >
          <Bell size={24} color="#3D3530" />
        </button>
      </div>

      {showNotification && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowNotification(false)}
          />
          <div className="fixed top-0 inset-x-0 bg-white z-50 rounded-b-2xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pt-[60px] px-5 pb-4">
              <h2 className="text-[20px] font-bold text-[#1C1410]">알림</h2>
              <button
                onClick={() => setShowNotification(false)}
                className="w-[44px] h-[44px] flex items-center justify-center"
              >
                <X size={24} color="#3D3530" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center py-12">
              <p className="text-[14px] text-[#6B5E57]">아직 알림이 없어요</p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
