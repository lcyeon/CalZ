import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, X, Trophy } from 'lucide-react';

export default function HabitTrackerWidget({
  currentUser = null,
  onOpenAuthModal,
  isDarkMode = false
}) {
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('neo_running_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        date: '2026-07-21',
        course: '여의도 한강공원 코스',
        durationMins: 32,
        distanceKm: 5.5,
        pace: "5'49\"/km"
      }
    ];
  });

  // Active logs based on login state
  const activeLogs = currentUser ? logs : [];

  // Auto-sync with running log additions
  useEffect(() => {
    const syncLogs = () => {
      const saved = localStorage.getItem('neo_running_logs');
      if (saved) {
        setLogs(JSON.parse(saved));
      }
    };

    window.addEventListener('running-logs-updated', syncLogs);
    window.addEventListener('storage', syncLogs);
    return () => {
      window.removeEventListener('running-logs-updated', syncLogs);
      window.removeEventListener('storage', syncLogs);
    };
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper to format Date -> YYYY-MM-DD
  const formatDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generate last 7 days ending today (or current week Mon-Sun)
  const getRecent7Days = () => {
    const current = new Date();
    const dayOfWeek = current.getDay();
    const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(current);
    monday.setDate(current.getDate() - distToMon);

    const days = [];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateFormatted = formatDateStr(d);
      const isCompleted = activeLogs.some(l => l.date === dateFormatted);
      const isCurrentToday = dateFormatted === todayStr;

      days.push({
        label: dayLabels[i],
        dateStr: dateFormatted,
        dayNum: d.getDate(),
        isCompleted,
        isToday: isCurrentToday
      });
    }
    return days;
  };

  const weekDays = getRecent7Days();

  // Calculate Consecutive Streak Days
  const calculateStreak = () => {
    if (!currentUser) return 0;
    let streak = 0;
    const checkDate = new Date();
    
    let hasLogToday = activeLogs.some(l => l.date === formatDateStr(checkDate));
    if (!hasLogToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (!activeLogs.some(l => l.date === formatDateStr(checkDate))) {
        return 0;
      }
    }

    while (true) {
      const dStr = formatDateStr(checkDate);
      if (activeLogs.some(l => l.date === dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  // Current Month Days Grid for Modal
  const getMonthGrid = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const cells = [];
    const distToMon = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    for (let i = 0; i < distToMon; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isCompleted = activeLogs.some(l => l.date === dStr);
      const isCurrentToday = dStr === todayStr;
      cells.push({ day, dateStr: dStr, isCompleted, isToday: isCurrentToday });
    }
    return cells;
  };

  const monthGrid = getMonthGrid();
  const currentMonthLogs = activeLogs.filter(l => {
    const [y, m] = l.date.split('-');
    return Number(y) === today.getFullYear() && Number(m) === (today.getMonth() + 1);
  });

  const handleCardClick = () => {
    if (!currentUser) {
      onOpenAuthModal && onOpenAuthModal();
    } else {
      setShowMonthModal(true);
    }
  };

  return (
    <>
      {/* Compact Habit Tracker Card Widget */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        className={`w-full p-4 neo-card transition-all cursor-pointer border-2 border-black shadow-[3.5px_3.5px_0px_#000] ${
          isDarkMode
            ? 'bg-[#0F172A] text-white hover:bg-slate-800'
            : 'bg-white text-[#162235] hover:bg-slate-50'
        }`}
        style={{ borderRadius: '28px' }}
      >
        {/* Header: Title & Streak Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <h3 className="font-black text-sm font-display tracking-tight">
              Habit Tracker
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#D7FF2F] text-black px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_#000]">
            <Flame className="w-3.5 h-3.5 fill-black stroke-black" />
            <span className="text-xs font-black">{streakDays} Days</span>
          </div>
        </div>

        {/* 7-Day Tracker View: M T W T F S S */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((item, idx) => {
            let cellBg = isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700';

            if (item.isToday) {
              cellBg = 'bg-[#D7FF2F] text-black border-black font-black shadow-[1.5px_1.5px_0px_#000]';
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Day Header (M T W T F S S) */}
                <span className={`text-[10px] font-black ${
                  item.isToday ? 'text-black' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {item.label}
                </span>

                {/* Status Indicator Cell */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 flex items-center justify-center transition-all ${cellBg}`}
                >
                  {item.isCompleted ? (
                    <div className="w-5 h-5 rounded-lg bg-black text-[#D7FF2F] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                    </div>
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${
                      item.isToday ? 'bg-black' : 'bg-slate-300 dark:bg-slate-600'
                    }`}></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly Exercise History Modal */}
      <AnimatePresence>
        {showMonthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`w-full max-w-md p-5 rounded-[32px] border-4 border-black shadow-[8px_8px_0px_#000] space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar ${
                isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-white text-[#162235]'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500 stroke-[2.5]" />
                  <h3 className="font-black text-base sm:text-lg font-display">
                    {today.getFullYear()}년 {today.getMonth() + 1}월 운동 달력
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMonthModal(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-black dark:text-white border-2 border-black hover:bg-slate-200"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Monthly Stats Summary Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#D7FF2F] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 fill-black stroke-black" />
                  <span className="font-black text-xs sm:text-sm">
                    이번 달 총 {currentMonthLogs.length}회 러닝 완료!
                  </span>
                </div>
                <span className="text-xs font-black bg-black text-[#D7FF2F] px-2 py-0.5 rounded-full">
                  연속 {streakDays}일째
                </span>
              </div>

              {/* Monthly Calendar Grid */}
              <div className="space-y-1">
                <div className="grid grid-cols-7 gap-1 text-center font-black text-xs mb-1">
                  <span className="text-rose-500">월</span>
                  <span>화</span>
                  <span>수</span>
                  <span>목</span>
                  <span>금</span>
                  <span>토</span>
                  <span className="text-blue-500">일</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {monthGrid.map((item, idx) => {
                    if (item === null) {
                      return <div key={`empty-${idx}`} className="aspect-square"></div>;
                    }

                    return (
                      <div
                        key={`cell-${item.day}`}
                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative font-black text-xs ${
                          item.isCompleted
                            ? 'bg-[#D7FF2F] border-black text-black shadow-[1.5px_1.5px_0px_#000]'
                            : item.isToday
                              ? 'bg-[#74C8FF] border-black text-black'
                              : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{item.day}</span>
                        {item.isCompleted && (
                          <div className="w-3 h-3 rounded-full bg-black text-[#D7FF2F] flex items-center justify-center mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Workout History List for current month */}
              <div className="space-y-2 pt-2 border-t-2 border-black/10">
                <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider">
                  이번 달 러닝 히스토리
                </h4>
                {currentMonthLogs.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-2">
                    이번 달 저장된 운동 기록이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {currentMonthLogs.map(l => (
                      <div
                        key={l.id}
                        className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-between text-xs font-black shadow-[1.5px_1.5px_0px_#000] ${
                          isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-black'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#D7FF2F] text-black rounded font-mono-num text-[11px]">
                            {l.distanceKm} km
                          </span>
                          <span className="truncate">{l.course}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono-num">{l.date} ({l.durationMins}분)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
