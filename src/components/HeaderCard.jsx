import React, { useState } from 'react';
import { Bell, Sparkles, LogIn, LogOut, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeaderCard({
  userName = "채영",
  todayCount = 4,
  isDarkMode = false,
  userAvatar = "",
  currentUser = null,
  onOpenProfileSettings,
  onOpenAuthModal,
  onLogout
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "오후 3:00 - 러닝 크루 모임 시작 🏃‍♂️", time: "10분 전", read: false },
    { id: 2, text: "마라톤 참가 신청 완료! 🏅", time: "1시간 전", read: false },
    { id: 3, text: "오늘 목표 80% 달성 🎯", time: "3시간 전", read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  return (
    <div className="relative w-full">
      {/* Header Card */}
      <div 
        className="w-full p-4 sm:p-5 neo-card-flat relative overflow-hidden space-y-2"
        style={{
          backgroundColor: 'var(--color-lime)',
          border: '2.5px solid var(--color-border)',
          borderRadius: '32px',
          boxShadow: '4px 4px 0px var(--color-border)'
        }}
      >
        {/* Top Header Bar: Badges & Right Action Icons */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black/10 rounded-full text-xs font-black text-black shrink-0">
              <span>{dateStr}</span>
            </div>

            {currentUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-black text-[#D7FF2F] rounded-full text-[10px] font-black shrink-0">
                <UserCheck className="w-3 h-3" />
                <span className="max-w-[130px] truncate">{currentUser.email}</span>
              </span>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">


            {/* Notification Bell Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative w-8 h-8 rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_#000] transition-colors flex items-center justify-center ${
                isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black hover:bg-slate-50'
              }`}
              aria-label="알림"
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD5EB] text-black font-black text-[9px] rounded-full border border-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            {/* Profile Avatar */}
            <motion.div 
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onOpenProfileSettings} 
              className="relative cursor-pointer shrink-0"
              title="프로필 & 개인 설정 변경"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-[#74C8FF] overflow-hidden shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center font-black text-lg text-black">
                {userAvatar && (userAvatar.startsWith('http') || userAvatar.startsWith('data:image')) ? (
                  <img 
                    src={userAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userAvatar || '🏃‍♀️'}</span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Heading Row (Full Width - Never Truncated!) */}
        <div className="pt-0.5">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#162235] font-display flex items-center gap-1.5 flex-wrap">
              <span>안녕하세요, {userName}님</span>
              {currentUser && (
                <span className="inline-block text-[9px] font-black bg-black/10 text-black px-1.5 py-0.5 rounded-md border border-black/10">
                  데이터 동기화됨 ✓
                </span>
              )}
            </h1>
            <span className="text-xs font-bold text-slate-800">
              오늘 일정{' '}
              <span className={`px-2 py-0.5 rounded-md border border-black font-black text-xs ${
                isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black'
              }`}>
                {todayCount}개
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {currentUser && showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-3 z-50 p-4 neo-card border-2 border-black shadow-[4px_4px_0px_#000] ${
              isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-white text-black'
            }`}
            style={{ borderRadius: '24px' }}
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <span className="font-extrabold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                알림 목록
              </span>
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {unreadCount}개
              </span>
            </div>

            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  className={`p-3 rounded-2xl border-2 border-black flex items-start justify-between cursor-pointer transition-all ${
                    n.read
                      ? isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 opacity-75'
                      : 'bg-[#FFD5EB] text-black font-bold shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">{n.text}</p>
                    <p className="text-[10px] opacity-70">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1"></span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
