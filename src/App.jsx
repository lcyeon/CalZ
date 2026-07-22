import React, { useState, useEffect } from 'react';
import HeaderCard from './components/HeaderCard';
import EventCard from './components/EventCard';
import MonthlyCalendarCard from './components/MonthlyCalendarCard';
import UpcomingBento from './components/UpcomingBento';
import QuickTimerCard from './components/QuickTimerCard';
import HabitTrackerWidget from './components/HabitTrackerWidget';
import FloatingAddButton from './components/FloatingAddButton';
import AddEventModal from './components/AddEventModal';
import DailyMemoCard from './components/DailyMemoCard';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import AuthModal from './components/AuthModal';
import { authService } from './services/authService';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { LayoutGrid, Timer, Calendar, Smartphone, Maximize2, Moon, Sun, Filter, Sparkles, Move } from 'lucide-react';

const INITIAL_EVENTS = [
  {
    id: '1',
    title: '뉴욕 마라톤 대회 🏃‍♂️',
    emoji: '🏅',
    time: '09:00',
    category: '운동',
    bgColor: '#74C8FF',
    date: '2026-07-22',
    completed: false
  },
  {
    id: '2',
    title: '디자인 시스템 리뉴얼 미팅',
    emoji: '🎨',
    time: '14:30',
    category: '업무',
    bgColor: '#FFD5EB',
    date: '2026-07-21',
    completed: true
  },
  {
    id: '3',
    title: '크로스핏 1:1 트레이닝',
    emoji: '🏋️‍♀️',
    time: '17:00',
    category: '운동',
    bgColor: '#D7FF2F',
    date: '2026-07-21',
    completed: false
  },
  {
    id: '4',
    title: '팀 회식 & 피자 파티',
    emoji: '🍕',
    time: '19:00',
    category: '모임',
    bgColor: '#C8FFF0',
    date: '2026-07-21',
    completed: false
  },
  {
    id: '5',
    title: '주간 회고 및 다음주 목표 작성',
    emoji: '💻',
    time: '21:00',
    category: '개인',
    bgColor: '#FFFFFF',
    date: '2026-07-24',
    completed: false
  }
];

export default function App() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('neo_calendar_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('neo_calendar_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-07-21');
  const [categoryFilter, setCategoryFilter] = useState('전체');

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User Profile state with localStorage persistence
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('neo_user_profile');
    return saved ? JSON.parse(saved) : {
      userName: '채영',
      userAvatar: '🏃‍♀️',
      userBio: '매일 꾸준히 달리는 중 🏃‍♀️'
    };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Initial cloud session restore on mount
  useEffect(() => {
    async function restoreSession() {
      const res = await authService.fetchUserData();
      if (res && res.user) {
        setCurrentUser(res.user);
        if (res.data) {
          if (res.data.events) setEvents(res.data.events);
          if (res.data.userProfile) setUserProfile(res.data.userProfile);
        }
      }
    }
    restoreSession();
  }, []);

  const handleLoginSuccess = (userObj, cloudData) => {
    setCurrentUser(userObj);
    if (cloudData) {
      if (cloudData.events) setEvents(cloudData.events);
      if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
      if (cloudData.memos) localStorage.setItem('neo_calendar_memos', JSON.stringify(cloudData.memos));
      if (cloudData.runningLogs) {
        localStorage.setItem('neo_running_logs', JSON.stringify(cloudData.runningLogs));
        window.dispatchEvent(new Event('running-logs-updated'));
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setEvents([]);
  };

  const handleSaveProfile = (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('neo_user_profile', JSON.stringify(newProfile));
    if (currentUser) {
      authService.syncUserData({ userProfile: newProfile, events });
    }
  };

  // Save state to local storage and sync to cloud if logged in
  useEffect(() => {
    localStorage.setItem('neo_calendar_events', JSON.stringify(events));
  }, [events]);

  // Cloud sync helper for user actions
  const syncToCloud = (newEvents = events, newProfile = userProfile) => {
    if (currentUser) {
      const memos = JSON.parse(localStorage.getItem('neo_calendar_memos') || '{}');
      const runningLogs = JSON.parse(localStorage.getItem('neo_running_logs') || '[]');
      authService.syncUserData({ events: newEvents, userProfile: newProfile, memos, runningLogs });
    }
  };

  useEffect(() => {
    const handleLocalUpdate = () => {
      syncToCloud();
    };
    window.addEventListener('memos-updated', handleLocalUpdate);
    window.addEventListener('running-logs-updated', handleLocalUpdate);
    return () => {
      window.removeEventListener('memos-updated', handleLocalUpdate);
      window.removeEventListener('running-logs-updated', handleLocalUpdate);
    };
  }, [currentUser, events, userProfile]);

  useEffect(() => {
    localStorage.setItem('neo_calendar_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.body.style.backgroundColor = '#162235';
      document.body.style.color = '#FFFFFF';
    } else {
      document.body.style.backgroundColor = '#F6F6F4';
      document.body.style.color = '#162235';
    }
  }, [isDarkMode]);

  const handleToggleComplete = (id) => {
    setEvents(prev => {
      const updated = prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item));
      syncToCloud(updated);
      return updated;
    });
  };

  const handleDeleteEvent = (id) => {
    setEvents(prev => {
      const updated = prev.filter(item => item.id !== id);
      syncToCloud(updated);
      return updated;
    });
  };

  const handleAddEvent = (newEvent) => {
    setEvents(prev => {
      const updated = [newEvent, ...prev];
      syncToCloud(updated);
      return updated;
    });
  };

  const handleEventMoveDate = (eventId, targetDate) => {
    setEvents(prev => {
      const updated = prev.map(item => (item.id === eventId ? { ...item, date: targetDate } : item));
      syncToCloud(updated);
      return updated;
    });
    setSelectedDate(targetDate);
  };

  // Reordering handler
  const handleReorderEvents = (newOrder) => {
    setEvents(newOrder);
    syncToCloud(newOrder);
  };

  const todayEvents = events.filter(e => e.date === selectedDate || e.date === '2026-07-21');
  const filteredEvents = events.filter(e => {
    const matchesDate = !selectedDate || e.date === selectedDate;
    const matchesCategory = categoryFilter === '전체' || e.category === categoryFilter;
    return matchesCategory && matchesDate;
  });

  const categories = ['전체', '운동', '업무', '모임', '개인'];

  return (
    <div 
      className={`min-h-screen px-2 sm:px-4 flex flex-col items-center justify-start relative transition-colors duration-300 ${
        isDarkMode ? 'bg-[#162235] text-white' : 'bg-[#F6F6F4] text-[#162235]'
      }`}
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)'
      }}
    >
      {/* Top Controls Bar */}
      <header className="w-full max-w-md flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-2xl border-2 border-black flex items-center gap-1.5 font-bold text-xs shadow-[2px_2px_0px_#000] transition-colors ${
              isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-white text-slate-800'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{isDarkMode ? "라이트 모드" : "다크 모드"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="p-2.5 rounded-2xl border-2 border-black bg-white text-black font-extrabold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-1 hover:bg-slate-100"
            title="모바일뷰 / 꽉찬화면 전환"
          >
            {isMobileFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            <span>{isMobileFrame ? "전체 화면" : "모바일 프레임"}</span>
          </button>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? `max-w-md border-[4px] rounded-[48px] shadow-[10px_10px_0px_#0A0F18] p-4 sm:p-5 relative overflow-hidden my-2 ${
                isDarkMode ? 'bg-[#162235] border-black text-white' : 'bg-white border-[#1E1E1E] text-[#162235]'
              }`
            : 'max-w-4xl p-2'
        }`}
      >
        {/* Mobile Dynamic Island Simulation */}
        {isMobileFrame && (
          <div className="w-full flex items-center justify-center mb-4">
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 text-white text-[10px] font-mono border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#D7FF2F] animate-pulse"></span>
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
              </div>
            </div>
          </div>
        )}

        {/* Header Greeting Card */}
        <HeaderCard
          userName={userProfile.userName}
          userAvatar={userProfile.userAvatar}
          todayCount={todayEvents.length}
          isDarkMode={isDarkMode}
          currentUser={currentUser}
          onOpenProfileSettings={() => setIsProfileModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Navigation Tabs (Dashboard / Calendar / Timer) */}
        <nav className={`my-4 p-1.5 neo-card grid grid-cols-3 gap-1.5 border-2 border-black shadow-[3px_3px_0px_#000] ${
          isDarkMode ? 'bg-[#162235] text-white' : 'bg-white text-black'
        }`} style={{ borderRadius: '24px' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 px-1 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'dashboard'
                ? 'bg-[#D7FF2F] text-black border-black shadow-[2px_2px_0px_#000] scale-[1.02]'
                : isDarkMode ? 'bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-black border-slate-300 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>메인</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2.5 px-1 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'calendar'
                ? 'bg-[#FFD5EB] text-black border-black shadow-[2px_2px_0px_#000] scale-[1.02]'
                : isDarkMode ? 'bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-black border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>캘린더</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`py-2.5 px-1 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
              activeTab === 'timer'
                ? 'bg-[#74C8FF] text-black border-black shadow-[2px_2px_0px_#000] scale-[1.02]'
                : isDarkMode ? 'bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-black border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Running</span>
          </button>
        </nav>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Category Filter Badges */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className={`text-xs font-black shrink-0 flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-slate-500'}`}>
                  <Filter className="w-3 h-3" /> 필터:
                </span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border-2 transition-all shrink-0 ${
                      categoryFilter === cat
                        ? 'bg-[#D7FF2F] text-black border-black shadow-[2px_2px_0px_#000]'
                        : isDarkMode
                          ? 'bg-slate-800 text-white border-black hover:bg-slate-700'
                          : 'bg-white text-black border-black hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Today's Schedule Card Section */}
              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className={`text-base font-black font-display flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#162235]'}`}>
                    일정 목록 ({filteredEvents.length})
                  </h2>
                </div>

                {filteredEvents.length === 0 ? (
                  <div className={`p-8 neo-card text-center space-y-2 ${isDarkMode ? 'bg-[#0F172A] border-black text-white' : 'bg-white border-black'}`}>
                    <p className="font-extrabold text-sm">등록된 일정이 없습니다.</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="neo-btn px-4 py-2 bg-[#D7FF2F] text-black text-xs font-black"
                    >
                      + 일정 추가
                    </button>
                  </div>
                ) : (
                  /* Reorderable List via Framer Motion Reorder */
                  <Reorder.Group
                    axis="y"
                    values={events}
                    onReorder={handleReorderEvents}
                    className="space-y-2.5 p-1 pb-2"
                  >
                    {filteredEvents.map(evt => (
                      <EventCard
                        key={evt.id}
                        event={evt}
                        onToggleComplete={handleToggleComplete}
                        onDeleteEvent={handleDeleteEvent}
                        onUpdateDate={handleEventMoveDate}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </Reorder.Group>
                )}
              </section>

              {/* Upcoming Bento Highlight Section */}
              <section className="pt-1">
                <h2 className={`text-base font-black font-display mb-1.5 px-1 ${isDarkMode ? 'text-white' : 'text-[#162235]'}`}>
                  오늘 날씨 & 노래 추천
                </h2>
                <UpcomingBento onAddSpecificEvent={handleAddEvent} isDarkMode={isDarkMode} />
              </section>

              {/* Monthly Calendar inline card */}
              <section className="pt-2">
                <MonthlyCalendarCard
                  events={events}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => setSelectedDate(d)}
                  onEventMoveDate={handleEventMoveDate}
                  onToggleComplete={handleToggleComplete}
                  onDeleteEvent={handleDeleteEvent}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  currentUser={currentUser}
                  isDarkMode={isDarkMode}
                />
              </section>
            </motion.div>
          )}

          {/* TAB 2: TIMER & PACE */}
          {activeTab === 'timer' && (
            <motion.div
              key="timer-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Compact Habit Tracker Widget */}
              <HabitTrackerWidget
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                isDarkMode={isDarkMode}
              />

              <QuickTimerCard
                currentUser={currentUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}

          {/* TAB 3: FULL CALENDAR */}
          {activeTab === 'calendar' && (
            <motion.div
              key="calendar-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <MonthlyCalendarCard
                events={events}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                onEventMoveDate={handleEventMoveDate}
                onToggleComplete={handleToggleComplete}
                onDeleteEvent={handleDeleteEvent}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                isLargeView={true}
              />

              {/* Daily Memo Card linked to selected date */}
              <DailyMemoCard
                selectedDate={selectedDate}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setIsAddModalOpen(true)} />

      {/* Quick Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
        initialDate={selectedDate}
        isDarkMode={isDarkMode}
      />

      {/* Profile & Personal Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* User Login & Signup Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
