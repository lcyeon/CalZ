import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Save, Check, Trash2, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DailyMemoCard({ selectedDate, isDarkMode = false }) {
  const [memos, setMemos] = useState(() => {
    const saved = localStorage.getItem('neo_calendar_memos');
    return saved ? JSON.parse(saved) : {
      '2026-07-21': '오늘 준비물: 운동복, 러닝화 챙기기!\n미팅 전 디자인 피드백 세션 서류 준비'
    };
  });

  const [currentText, setCurrentText] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    setCurrentText(memos[selectedDate] || '');
  }, [selectedDate, memos]);

  const handleSaveMemo = (textToSave) => {
    const updated = {
      ...memos,
      [selectedDate]: textToSave
    };
    setMemos(updated);
    localStorage.setItem('neo_calendar_memos', JSON.stringify(updated));
    window.dispatchEvent(new Event('memos-updated'));

    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 1500);
  };

  const handleChangeText = (e) => {
    const val = e.target.value;
    setCurrentText(val);
    handleSaveMemo(val);
  };

  const handleClearMemo = () => {
    handleSaveMemo('');
  };

  const handleCopyMemo = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    confetti({ particleCount: 25, spread: 35 });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 1500);
  };

  const formatNiceDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
  };

  return (
    <div
      className={`w-full p-4 sm:p-5 neo-card transition-colors ${
        isDarkMode
          ? 'bg-[#0F172A] border-slate-700 text-white'
          : 'bg-[#FFFDE7] border-black text-[#162235] shadow-[3.5px_3.5px_0px_#000]'
      }`}
      style={{ borderRadius: '32px' }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-2xl border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] ${
            isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black'
          }`}>
            <StickyNote className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h3 className="font-black text-sm sm:text-base font-display">
            {formatNiceDate(selectedDate)} 메모
          </h3>
        </div>

        {/* Status Toast */}
        <AnimatePresence>
          {isSavedToast && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[11px] font-black bg-[#D7FF2F] text-black px-2.5 py-1 rounded-xl border border-black shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> 저장됨
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Memo Textarea Input */}
      <div className="relative w-full">
        <textarea
          value={currentText}
          onChange={handleChangeText}
          placeholder="메모를 입력하세요..."
          rows={3}
          className={`w-full p-3 rounded-2xl border-2 font-medium text-xs sm:text-sm resize-none focus:outline-none transition-all ${
            isDarkMode
              ? 'bg-[#1E293B] border-slate-700 text-white placeholder-slate-400 focus:border-[#D7FF2F]'
              : 'bg-white border-black text-[#162235] placeholder-slate-500 focus:border-black shadow-[2px_2px_0px_#000]'
          }`}
        />
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10">
        <span className={`text-[10px] font-extrabold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {currentText.length}자
        </span>

        <div className="flex items-center gap-2">
          {currentText && (
            <>
              <button
                type="button"
                onClick={handleCopyMemo}
                className="px-2 py-1 bg-white text-black rounded-xl text-xs font-black border border-black shadow-[1px_1px_0px_#000] hover:bg-slate-100 flex items-center gap-1"
                title="복사"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>복사</span>
              </button>

              <button
                type="button"
                onClick={handleClearMemo}
                className="px-2 py-1 bg-rose-500 text-white rounded-xl text-xs font-black border border-black shadow-[1px_1px_0px_#000] hover:bg-rose-600 flex items-center gap-1"
                title="지우기"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => handleSaveMemo(currentText)}
            className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0px_#000] transition-transform hover:scale-105 flex items-center gap-1 ${
              isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>저장</span>
          </button>
        </div>
      </div>
    </div>
  );
}
