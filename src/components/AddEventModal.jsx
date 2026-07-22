import React, { useState } from 'react';
import { X, Sparkles, Clock, Calendar, Check, Palette, Smile, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddEventModal({
  isOpen,
  onClose,
  onAddEvent,
  initialDate = new Date().toISOString().split('T')[0],
  isDarkMode = false
}) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🏃‍♂️');
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [time, setTime] = useState('15:00');
  const [category, setCategory] = useState('운동');
  const [bgColor, setBgColor] = useState('#74C8FF');
  const [customColor, setCustomColor] = useState('#FF9900');
  const [isCustomColorActive, setIsCustomColorActive] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [url, setUrl] = useState('');

  const emojiPresets = ['🏃‍♂️', '🏋️‍♀️', '💼', '🎓', '🍕', '🏅', '✈️', '🎵', '⚽', '🎨', '💻', '☕', '🔥', '❤️', '💡', '🚀', '🎟️', '🎫'];
  const colorPresets = [
    { name: 'Sky Blue', hex: '#74C8FF' },
    { name: 'Primary Lime', hex: '#D7FF2F' },
    { name: 'Mint', hex: '#C8FFF0' },
    { name: 'Pink', hex: '#FFD5EB' }
  ];

  const categoryPresets = ['운동', '티켓팅', '업무', '공부', '모임', '취미', '개인'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalEmoji = customEmojiInput.trim() ? customEmojiInput.trim() : emoji;
    const finalBgColor = isCustomColorActive ? customColor : bgColor;

    // Ensure URL has http/https protocol
    let formattedUrl = url.trim();
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    onAddEvent({
      id: Date.now().toString(),
      title: title.trim(),
      emoji: finalEmoji,
      time,
      category,
      bgColor: finalBgColor,
      date,
      url: formattedUrl,
      completed: false
    });

    // Reset and close
    setTitle('');
    setCustomEmojiInput('');
    setUrl('');
    setIsCustomColorActive(false);
    onClose();
  };

  const handleQuickAdd = (presetTitle, presetEmoji, presetCat, presetColor, presetUrl = '') => {
    setTitle(presetTitle);
    setEmoji(presetEmoji);
    setCategory(presetCat);
    setBgColor(presetColor);
    setUrl(presetUrl);
    setIsCustomColorActive(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`relative w-full max-w-lg p-5 rounded-t-[32px] sm:rounded-[32px] z-10 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto transition-colors border ${
              isDarkMode 
                ? 'bg-[#162235] text-white border-slate-700' 
                : 'bg-white text-[#162235] border-black/20 shadow-[0_10px_30px_rgba(0,0,0,0.1)]'
            }`}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D7FF2F]/20 text-[#D7FF2F] flex items-center justify-center font-black">
                  <Sparkles className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <h2 className="text-base font-black font-display">새 일정 추가</h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <X className="w-4.5 h-4.5 stroke-[2]" />
              </motion.button>
            </div>

            {/* Quick One-Tap Suggestions */}
            <div className="my-3">
              <span className={`text-[10px] sm:text-xs font-black block mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                ⚡ 빠른 추천 일정 (예매 사이트 링크 포함)
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => handleQuickAdd("러닝 마라톤 티켓팅 🎟️", "🏅", "티켓팅", "#D7FF2F", "https://www.nyrr.org")}
                  className="px-2.5 py-1 rounded-full border border-black/10 bg-[#D7FF2F] text-black text-xs font-black shrink-0"
                >
                  🏅 마라톤 예매
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd("콘서트 티켓팅 🎟️", "🎵", "티켓팅", "#FFD5EB", "https://ticket.interpark.com")}
                  className="px-2.5 py-1 rounded-full border border-black/10 bg-[#FFD5EB] text-black text-xs font-black shrink-0"
                >
                  🎵 콘서트 예매
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd("팀 미팅", "💼", "업무", "#74C8FF")}
                  className="px-2.5 py-1 rounded-full border border-black/10 bg-[#74C8FF] text-black text-xs font-black shrink-0"
                >
                  💼 팀 미팅
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Title input */}
              <div>
                <label className="block text-[11px] font-black mb-1">일정 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 콘서트 티켓팅 / 마라톤 참가 신청"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-xs sm:text-sm focus:outline-none focus:ring-1 ${
                    isDarkMode
                      ? 'bg-slate-800/80 border-slate-700 text-white focus:ring-slate-600'
                      : 'bg-slate-50 border-slate-200 text-black focus:ring-slate-300'
                  }`}
                />
              </div>

              {/* Ticketing / Website URL Link Field */}
              <div>
                <label className="block text-[11px] font-black mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-500" /> 티켓팅 / 예매 웹사이트 링크 URL (선택)
                </label>
                <input
                  type="url"
                  placeholder="예: https://ticket.interpark.com 또는 예매 사이트 주소"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-bold text-[11px] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                  }`}
                />
              </div>

              {/* Date & Time (Guaranteed side-by-side alignment with exact gap via inline styles) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                <div style={{ position: 'relative', minWidth: 0, width: '100%' }}>
                  <label className="block text-[11px] font-black mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> 날짜
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full max-w-full min-w-0 box-border px-3 py-2.5 rounded-xl border font-bold text-xs ${
                        isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                      }`}
                      style={{
                        border: isDarkMode ? '1px solid #334155' : '1px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '12px',
                        display: 'block',
                        width: '100%',
                        boxSizing: 'border-box',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
                      }}
                    />
                  </div>
                </div>
                <div style={{ position: 'relative', minWidth: 0, width: '100%' }}>
                  <label className="block text-[11px] font-black mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 시간
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={`w-full max-w-full min-w-0 box-border px-3 py-2.5 rounded-xl border font-bold text-xs ${
                        isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                      }`}
                      style={{
                        border: isDarkMode ? '1px solid #334155' : '1px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '12px',
                        display: 'block',
                        width: '100%',
                        boxSizing: 'border-box',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Emoji Selector + Custom Emoji Input */}
              <div>
                <label className="text-[11px] font-black block mb-1 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5" /> 이모지 선택
                </label>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="직접 이모지 입력 (예: 🎟️, 🎫, 🍣)"
                    value={customEmojiInput}
                    onChange={(e) => {
                      setCustomEmojiInput(e.target.value);
                      if (e.target.value) setEmoji(e.target.value);
                    }}
                    className={`flex-1 p-2 rounded-xl border font-bold text-xs ${
                      isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-black'
                    }`}
                  />
                  <div className="w-9 h-9 rounded-xl border border-black/10 bg-[#D7FF2F]/20 text-black flex items-center justify-center text-lg font-bold">
                    {customEmojiInput || emoji}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 border border-black/5 rounded-xl">
                  {emojiPresets.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        setEmoji(e);
                        setCustomEmojiInput('');
                      }}
                      className={`w-7.5 h-7.5 rounded-lg text-sm flex items-center justify-center transition-all ${
                        emoji === e && !customEmojiInput
                          ? 'bg-[#D7FF2F] text-black border border-black/20 scale-105'
                          : isDarkMode ? 'bg-slate-800/60 text-white hover:bg-slate-700' : 'bg-slate-50 border border-slate-200 text-black hover:bg-slate-100'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Block Selector */}
              <div>
                <label className="text-[11px] font-black block mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> 카드 테마 색상 (RGB / Hex 커스텀 지원)
                </label>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setBgColor(c.hex);
                        setIsCustomColorActive(false);
                      }}
                      className={`py-1.5 px-1 rounded-xl border border-black/10 font-bold text-[10px] flex items-center justify-between transition-all ${
                        !isCustomColorActive && bgColor === c.hex
                          ? 'ring-1 ring-slate-400 scale-105 font-black'
                          : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c.hex, color: '#162235' }}
                    >
                      <span className="truncate">{c.name}</span>
                      {!isCustomColorActive && bgColor === c.hex && <Check className="w-3 h-3 stroke-[2]" />}
                    </button>
                  ))}
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setIsCustomColorActive(true);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent p-0 border border-black/10"
                      title="RGB 색상 선택기"
                    />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400">RGB / Hex 커스텀 색상:</span>
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setIsCustomColorActive(true);
                        }}
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border w-24 ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-black'
                        }`}
                        placeholder="#FF9900"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCustomColorActive(true)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-black ${
                      isCustomColorActive 
                        ? 'bg-[#D7FF2F] text-black border-black/20' 
                        : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {isCustomColorActive ? '선택됨 ✓' : '적용'}
                  </button>
                </div>
              </div>

              {/* Category tags */}
              <div>
                <label className="block text-[11px] font-black mb-1">카테고리</label>
                <div className="flex flex-wrap gap-1.5">
                  {categoryPresets.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all ${
                        category === cat
                          ? 'bg-[#162235] text-[#D7FF2F] border-slate-800'
                          : isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#D7FF2F] text-black font-black text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 hover:bg-[#c4eb22]"
                >
                  <Sparkles className="w-4.5 h-4.5 stroke-[2]" />
                  <span>일정 저장하기</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
