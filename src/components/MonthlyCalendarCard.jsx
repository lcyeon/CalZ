import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Plus, Trash2, ExternalLink, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MonthlyCalendarCard({
  events = [],
  selectedDate,
  onSelectDate,
  onEventMoveDate,
  onToggleComplete,
  onDeleteEvent,
  onOpenAddModal,
  onOpenAuthModal,
  currentUser = null,
  isDarkMode = false,
  isLargeView = false
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 6, 1)); // Default July 2026
  const [dragOverDate, setDragOverDate] = useState(null);

  // If not logged in, events are empty
  const activeEvents = currentUser ? events : [];

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
    return sYear === year && sMonth === (month + 1) && sDay === day;
  };

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeEvents.filter(e => e.date === dateStr);
  };

  const handleDragStart = (e, eventId) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e, dateStr) => {
    e.preventDefault();
    if (dragOverDate === dateStr) {
      setDragOverDate(null);
    }
  };

  const handleDropOnDate = (e, dateStr) => {
    e.preventDefault();
    setDragOverDate(null);
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId && onEventMoveDate && currentUser) {
      onEventMoveDate(eventId, dateStr);
    }
  };

  const gridCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    gridCells.push(day);
  }

  const selectedDayEvents = activeEvents.filter(e => e.date === selectedDate);

  const formatNiceDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
  };

  return (
    <div 
      className={`w-full p-4 sm:p-5 neo-card transition-colors ${
        isDarkMode ? 'bg-[#0F172A] text-white border-slate-700' : 'bg-white text-[#162235] border-black'
      }`}
      style={{ borderRadius: '32px' }}
    >
      {/* Top Header & Month Navigator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#D7FF2F] border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight">
              {year}년 {monthNames[month]}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevMonth}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center font-black ${
              isDarkMode ? 'bg-[#1E293B] border-slate-600 text-white hover:bg-slate-700' : 'bg-slate-100 border-black text-black hover:bg-slate-200 shadow-[2px_2px_0px_#000]'
            }`}
          >
            <ChevronLeft className="w-5 h-5 stroke-[3]" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center font-black ${
              isDarkMode ? 'bg-[#1E293B] border-slate-600 text-white hover:bg-slate-700' : 'bg-slate-100 border-black text-black hover:bg-slate-200 shadow-[2px_2px_0px_#000]'
            }`}
          >
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </motion.button>
        </div>
      </div>

      {/* Days of Week Header Bar */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map((d, idx) => (
          <div
            key={d}
            className={`text-xs font-black py-1 uppercase tracking-wider ${
              idx === 0 ? 'text-rose-400' : idx === 6 ? 'text-blue-400' : isDarkMode ? 'text-slate-400' : 'text-slate-700'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3">
        {gridCells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square"></div>;
          }

          const todayMatch = isToday(day);
          const selectedMatch = isSelected(day);
          const dayEvents = getEventsForDay(day);
          const hasEvent = dayEvents.length > 0;
          const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isHoveredTarget = dragOverDate === dateFormatted;

          let bgClass = isDarkMode ? "bg-[#1E293B] border-slate-700 text-white hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-black hover:bg-slate-100";
          let shadowClass = "";

          if (isHoveredTarget) {
            bgClass = "bg-[#D7FF2F] border-black text-black scale-105 z-20 shadow-[0_0_15px_rgba(215,255,47,0.9)]";
          } else if (selectedMatch) {
            bgClass = "bg-[#FFD5EB] border-black font-black text-black scale-105 z-10";
            shadowClass = "shadow-[2px_2px_0px_#000]";
          } else if (todayMatch) {
            bgClass = "bg-[#D7FF2F] border-black font-black text-black";
            shadowClass = "shadow-[2px_2px_0px_#000]";
          }

          return (
            <motion.div
              key={`day-${day}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate && onSelectDate(dateFormatted)}
              onDragOver={(e) => handleDragOver(e, dateFormatted)}
              onDragLeave={(e) => handleDragLeave(e, dateFormatted)}
              onDrop={(e) => handleDropOnDate(e, dateFormatted)}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all cursor-pointer select-none ${bgClass} ${shadowClass}`}
            >
              <span className="text-xs sm:text-sm font-black font-mono-num leading-none">{day}</span>

              {/* Clean Dot Indicators */}
              <div className="absolute bottom-1.5 flex items-center justify-center gap-0.5">
                {hasEvent ? (
                  dayEvents.slice(0, 3).map((e, eIdx) => (
                    <span
                      key={e.id || eIdx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedMatch || todayMatch ? 'bg-black' : isDarkMode ? 'bg-[#D7FF2F]' : 'bg-[#162235]'
                      }`}
                      style={{
                        backgroundColor: !selectedMatch && !todayMatch ? e.bgColor || (isDarkMode ? '#D7FF2F' : '#162235') : undefined
                      }}
                    ></span>
                  ))
                ) : (
                  <span className="w-1.5 h-1.5 opacity-0"></span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Date Schedule Panel */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-4 sm:p-5 rounded-3xl border-2 transition-colors mt-2 ${
              isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-[#F8FAFC] border-black text-[#162235] shadow-[3px_3px_0px_#000]'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/30 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-sm sm:text-base font-display truncate">
                  {formatNiceDate(selectedDate)} 일정 ({selectedDayEvents.length})
                </h3>
              </div>

              {currentUser ? (
                onOpenAddModal && (
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="neo-btn px-2.5 py-1.5 bg-[#D7FF2F] text-black text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_#000] shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>일정 추가</span>
                  </button>
                )
              ) : (
                onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="neo-btn px-2.5 py-1.5 bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_#000] shrink-0 border border-black"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>로그인 필요</span>
                  </button>
                )
              )}
            </div>

            {!currentUser ? (
              <div className="py-4 text-center space-y-2">
                <p className={`text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  로그인 후 선택한 날짜의 일정을 등록하고 관리해 보세요!
                </p>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-4 py-1.5 bg-[#D7FF2F] text-black rounded-xl text-xs font-black border border-black shadow-[1.5px_1.5px_0px_#000]"
                >
                  🔑 로그인하기
                </button>
              </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="py-4 text-center space-y-1">
                <p className={`text-xs font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  등록된 일정이 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto p-1 pb-3 pr-2">
                {selectedDayEvents.map(evt => (
                  <motion.div
                    key={evt.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, evt.id)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-2xl border-2 border-black flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000] cursor-grab active:cursor-grabbing hover:scale-[1.01] transition-all"
                    style={{ backgroundColor: evt.bgColor || '#D7FF2F' }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onToggleComplete && onToggleComplete(evt.id)}
                        className="text-black hover:scale-110 transition-transform shrink-0"
                      >
                        {evt.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-black stroke-white" />
                        ) : (
                          <Circle className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </button>

                      <div className="truncate text-black">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-xs sm:text-sm truncate ${evt.completed ? 'line-through opacity-60' : ''}`}>
                            {evt.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-800 mt-1">
                          <span className="flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" /> {evt.time}
                          </span>
                          <span className="bg-black/10 px-2 py-0.5 rounded-md">
                            {evt.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {evt.url && (
                        <a
                          href={evt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white text-black rounded-xl border-2 border-black hover:bg-slate-100 shadow-[1px_1px_0px_#000]"
                          title="관련 사이트 이동"
                        >
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>
                      )}
                      {onDeleteEvent && (
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-1.5 bg-rose-500 text-white rounded-xl border-2 border-black hover:bg-rose-600 shadow-[1px_1px_0px_#000]"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
