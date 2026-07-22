import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Clock, Check, GripVertical, Trash2, Tag, Calendar as CalendarIcon, ChevronDown, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EventCard({
  event,
  onToggleComplete,
  onDeleteEvent,
  onUpdateDate,
  isDarkMode = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    id,
    title,
    emoji = "📅",
    time = "14:00",
    category = "운동",
    bgColor = "#74C8FF",
    date = "2026-07-21",
    url = "",
    completed = false
  } = event;

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleComplete(id);
    if (!completed) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleOpenUrl = (e) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Reorder.Item
      value={event}
      id={id}
      whileDrag={{
        scale: 1,
        boxShadow: "4px 4px 0px #1E1E1E",
        zIndex: 50
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className={`relative w-full p-4 rounded-[28px] border-[2.5px] border-[#1E1E1E] transition-colors cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'z-50 shadow-[4px_4px_0px_#1E1E1E]' : 'z-10 shadow-[4px_4px_0px_#1E1E1E]'
      }`}
      style={{
        backgroundColor: bgColor,
        opacity: completed ? 0.75 : 1
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Drag Handle & Emoji */}
        <div className="flex items-center gap-2.5">
          {/* Drag Handle Icon */}
          <div className="text-black/60 hover:text-black transition-colors cursor-grab active:cursor-grabbing p-1">
            <GripVertical className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Emoji Badge */}
          <div className={`w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#1E1E1E] shrink-0 ${
            isDarkMode ? 'bg-[#162235] text-white' : 'bg-white text-black'
          }`}>
            {emoji}
          </div>

          {/* Title & Info */}
          <div className="space-y-0.5">
            <h3 className={`font-black text-sm sm:text-base text-[#162235] ${completed ? 'line-through decoration-black decoration-2' : ''}`}>
              {title}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold text-black/80">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-black ${
                isDarkMode ? 'bg-[#162235]/80 text-[#D7FF2F] border-black/50' : 'bg-white/80 text-black border-black/30'
              }`}>
                <Clock className="w-3 h-3" />
                {time}
              </span>

              <span className="flex items-center gap-1 bg-black/15 px-2 py-0.5 rounded-lg text-[11px] font-black text-black">
                <Tag className="w-3 h-3" />
                {category}
              </span>

              {/* Ticketing Site Link Pill Button */}
              {url && (
                <button
                  type="button"
                  onClick={handleOpenUrl}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border-2 border-black text-[11px] font-black transition-all shadow-[1.5px_1.5px_0px_#000] ${
                    isDarkMode ? 'bg-[#162235] text-[#D7FF2F] hover:bg-black' : 'bg-white text-black hover:bg-slate-100'
                  }`}
                  title="티켓팅 / 관련 사이트 열기"
                >
                  <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                  <span>티켓팅/예매 사이트 🔗</span>
                </button>
              )}

              {/* Date button with quick picker */}
              {onUpdateDate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDatePicker(!showDatePicker);
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold transition-all ${
                    isDarkMode ? 'bg-[#162235]/70 text-white border-black/40 hover:bg-[#162235]' : 'bg-white/60 text-black border-black/30 hover:bg-white'
                  }`}
                  title="일정 날짜 변경"
                >
                  <CalendarIcon className="w-3 h-3" />
                  <span>{date}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Checkbox & Delete */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Delete Button */}
          {onDeleteEvent && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEvent(id);
              }}
              className={`p-2 rounded-xl border border-black/30 transition-colors ${
                isDarkMode ? 'bg-[#162235]/60 text-white hover:bg-rose-600' : 'bg-white/50 text-black/60 hover:text-red-600 hover:bg-white'
              }`}
              title="삭제"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          )}

          {/* Completion Checkbox */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCheckboxClick}
            className={`w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center transition-all ${
              completed
                ? 'bg-black text-[#D7FF2F] shadow-[2px_2px_0px_#D7FF2F]'
                : 'bg-white text-transparent shadow-[2.5px_2.5px_0px_#000] hover:bg-slate-100'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3.5]" />
          </motion.button>
        </div>
      </div>

      {/* Date Picker Dropdown Popover */}
      {showDatePicker && onUpdateDate && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`mt-3 p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#1E1E1E] flex items-center gap-2 z-30 ${
            isDarkMode ? 'bg-[#162235] text-white' : 'bg-white text-black'
          }`}
        >
          <span className="text-xs font-black">날짜 변경:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              onUpdateDate(id, e.target.value);
              setShowDatePicker(false);
            }}
            className={`p-1.5 rounded-xl border text-xs font-bold ${
              isDarkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-black text-black'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowDatePicker(false)}
            className="px-2 py-1 bg-black text-white rounded-lg text-xs font-bold"
          >
            닫기
          </button>
        </div>
      )}
    </Reorder.Item>
  );
}
