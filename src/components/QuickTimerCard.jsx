import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Activity, Plus, Trash2, Calendar, Clock, Award, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import InterlockingCard from './InterlockingCard';

// Popular Running Course Presets in Seoul
const COURSE_PRESETS = [
  "여의도 한강공원 코스",
  "반포 한강 자전거/러닝길",
  "석촌호수 트랙 루프",
  "상암 월드컵공원 코스",
  "중랑천 변 러닝로드",
  "우리동네 트랙"
];

export default function QuickTimerCard({
  currentUser = null,
  onOpenAuthModal,
  isDarkMode = false
}) {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Persistent running logs history from localStorage
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('neo_running_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        date: '2026-07-21',
        course: '여의도 한강공원 코스',
        durationMins: 32,
        distanceKm: 5.5,
        pace: "5'49\"/km",
        memo: '컨디션 좋음! 마지막 1km 페이스업 성공 🏃‍♂️'
      }
    ];
  });

  // Log Form Modal / Drawer state
  const [showLogForm, setShowLogForm] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCourse, setFormCourse] = useState(COURSE_PRESETS[0]);
  const [formDuration, setFormDuration] = useState(30);
  const [formDistance, setFormDistance] = useState(5.0);
  const [formMemo, setFormMemo] = useState('');

  // Active logs based on login state
  const activeLogs = logs;

  // Live Timer Interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Save logs to localStorage and notify Habit Tracker
  const saveLogsToStorage = (updatedLogs) => {
    setLogs(updatedLogs);
    localStorage.setItem('neo_running_logs', JSON.stringify(updatedLogs));
    window.dispatchEvent(new Event('running-logs-updated'));
  };

  // Timer formatting
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  // Auto-calculate pace: (duration in mins) / (distance in km)
  const calculatePace = (durationMins, distanceKm) => {
    if (!distanceKm || distanceKm <= 0 || !durationMins || durationMins <= 0) return "0'00\"/km";
    const paceDecimal = durationMins / distanceKm;
    const paceMins = Math.floor(paceDecimal);
    const paceSecs = Math.round((paceDecimal - paceMins) * 60);
    return `${paceMins}'${String(paceSecs).padStart(2, '0')}"/km`;
  };

  // Open Log Form prefilled with timer values if timer was running
  const handleOpenLogForm = () => {
    if (seconds > 0) {
      const timerMins = Math.max(1, Math.round(seconds / 60));
      setFormDuration(timerMins);
    }
    setShowLogForm(true);
  };

  // Submit New Running Log
  const handleSaveRunningLog = (e) => {
    e.preventDefault();
    const calculatedPaceStr = calculatePace(Number(formDuration), Number(formDistance));
    
    const newLog = {
      id: Date.now().toString(),
      date: formDate,
      course: formCourse || '나만의 러닝 코스',
      durationMins: Number(formDuration),
      distanceKm: Number(formDistance),
      pace: calculatedPaceStr,
      memo: formMemo
    };

    const updated = [newLog, ...logs];
    saveLogsToStorage(updated);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setShowLogForm(false);
    setFormMemo('');
    resetTimer();
  };

  const handleDeleteLog = (logId) => {
    const updated = logs.filter(l => l.id !== logId);
    saveLogsToStorage(updated);
  };

  // Cumulative Statistics
  const totalDistance = activeLogs.reduce((sum, l) => sum + (Number(l.distanceKm) || 0), 0).toFixed(1);
  const totalDurationMins = activeLogs.reduce((sum, l) => sum + (Number(l.durationMins) || 0), 0);
  const avgPaceStr = activeLogs.length > 0 ? calculatePace(totalDurationMins, Number(totalDistance)) : "0'00\"/km";

  return (
    <div className="w-full flex flex-col gap-3 my-2">
      {/* 1. Live Running Stopwatch Card */}
      <InterlockingCard
        bgColor="#C8FFF0"
        textColor="#162235"
        notchBottom={true}
        notchPosition="right"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-black text-xs uppercase tracking-wider text-slate-800">
            실시간 러닝 타이머
          </span>
          {isRunning && (
            <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              RUNNING
            </span>
          )}
        </div>

        {/* Big Timer Typography */}
        <div className="text-center py-1">
          <div className="text-4xl sm:text-5xl font-black font-mono-num text-[#162235] tracking-tight">
            {hrs}:{mins}:{secs}
          </div>
          <div className="flex justify-around text-[10px] font-extrabold text-[#162235]/70 mt-0.5 uppercase tracking-widest px-8">
            <span>H</span>
            <span>M</span>
            <span>S</span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className={`neo-btn px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000] ${
              isRunning ? 'bg-amber-400 text-black' : 'bg-[#D7FF2F] text-black'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
            <span>{isRunning ? "일시정지" : "러닝 시작"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="neo-btn p-2 bg-white text-black text-xs font-black shadow-[2px_2px_0px_#000]"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          </motion.button>
        </div>
      </InterlockingCard>

      {/* 2. Total Cumulative Stats Lime Card */}
      <InterlockingCard
        bgColor="#D7FF2F"
        textColor="#162235"
        notchTop={true}
        notchBottom={true}
        notchPosition="right"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-black stroke-[2.5]" />
            <span className="text-xs font-black">나의 누적 러닝 기록</span>
          </div>
          <span className="text-[10px] font-black bg-black text-[#D7FF2F] px-2 py-0.5 rounded-full">
            총 {activeLogs.length}회 완료
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2 bg-white/70 rounded-xl border border-black/20">
            <span className="text-[10px] font-bold text-slate-700 block">총 거리</span>
            <span className="text-lg sm:text-xl font-black font-mono-num">{totalDistance} <span className="text-[10px]">km</span></span>
          </div>
          <div className="p-2 bg-white/70 rounded-xl border border-black/20">
            <span className="text-[10px] font-bold text-slate-700 block">평균 페이스</span>
            <span className="text-sm sm:text-base font-black font-mono-num">{avgPaceStr}</span>
          </div>
          <div className="p-2 bg-white/70 rounded-xl border border-black/20">
            <span className="text-[10px] font-bold text-slate-700 block">총 러닝 시간</span>
            <span className="text-lg sm:text-xl font-black font-mono-num">{totalDurationMins} <span className="text-[10px]">분</span></span>
          </div>
        </div>
      </InterlockingCard>

      {/* 3. History Logs Timeline List + Prominent Add Button */}
      <div 
        className={`w-full p-4 neo-card transition-colors ${
          isDarkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-white border-black text-[#162235]'
        }`}
        style={{ borderRadius: '28px' }}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/10">
          <h3 className="font-black text-xs sm:text-sm font-display flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            매일 러닝 기록 일지 ({activeLogs.length})
          </h3>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenLogForm}
            className="neo-btn px-3 py-1.5 bg-[#D7FF2F] text-black text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_#000]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>러닝 기록하기</span>
          </motion.button>
        </div>

        {/* Log Submission Modal Form Drawer */}
        <AnimatePresence>
          {showLogForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSaveRunningLog}
              className={`p-4 neo-card border-2 border-black shadow-[3px_3px_0px_#000] space-y-3 mb-3 ${
                isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-[#FFFDE7] text-[#162235]'
              }`}
              style={{ borderRadius: '24px' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-black/20">
                <h4 className="font-black text-xs sm:text-sm font-display">
                  📝 오늘의 러닝 일지 작성
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="text-xs font-bold px-2 py-0.5 bg-rose-500 text-white rounded-lg border border-black"
                >
                  닫기
                </button>
              </div>

              {/* Date & Course preset selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black block mb-1">날짜</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-black text-black'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black block mb-1">어디서 / 어느 코스</label>
                  <input
                    type="text"
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    placeholder="예: 여의도 한강공원 코스"
                    className={`w-full p-2 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-black text-black'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {COURSE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormCourse(preset)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors shrink-0 ${
                      formCourse === preset
                        ? 'bg-[#D7FF2F] text-black border-black font-black'
                        : isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Distance & Duration Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-black block mb-1">몇 km 뛰었는지 (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formDistance}
                    onChange={(e) => setFormDistance(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-black text-black'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black block mb-1">몇 분 뛰었는지 (분)</label>
                  <input
                    type="number"
                    min="1"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className={`w-full p-2 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-black text-black'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Calculated Pace Preview */}
              <div className="p-2 rounded-xl bg-[#74C8FF]/20 border border-black/20 flex items-center justify-between text-xs font-black">
                <span>자동 계산 페이스:</span>
                <span className="font-mono-num text-sm font-black">{calculatePace(Number(formDuration), Number(formDistance))}</span>
              </div>

              {/* Memo */}
              <div>
                <label className="text-[11px] font-black block mb-1">러닝 소감 / 메모</label>
                <textarea
                  value={formMemo}
                  onChange={(e) => setFormMemo(e.target.value)}
                  placeholder="오늘 러닝 컨디션, 날씨, 후기 메모..."
                  rows={2}
                  className={`w-full p-2 rounded-xl border text-xs font-bold resize-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-black text-black'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#D7FF2F] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:scale-[1.01] transition-transform"
              >
                저장하기
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {activeLogs.length === 0 ? (
          <div className="py-6 text-center text-xs font-bold text-slate-400 space-y-1">
            <p>아직 저장된 러닝 기록이 없습니다.</p>
            <p>우측 상단의 '+ 러닝 기록하기' 버튼을 눌러 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {activeLogs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl border-2 border-black flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000] ${
                  isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-[#F8FAFC] text-[#162235]'
                }`}
              >
                <div className="space-y-1 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#D7FF2F] text-black text-[10px] font-black rounded-md border border-black shadow-[1px_1px_0px_#000]">
                      {log.distanceKm} km
                    </span>
                    <h4 className="font-black text-xs sm:text-sm truncate">
                      {log.course}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-extrabold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {log.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.durationMins}분
                    </span>
                    <span className="bg-black/10 px-1.5 py-0.2 rounded font-black text-slate-700">
                      {log.pace}
                    </span>
                  </div>

                  {log.memo && (
                    <p className={`text-[11px] font-bold line-clamp-1 italic mt-0.5 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      "{log.memo}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-1.5 bg-rose-500 text-white rounded-xl border border-black hover:bg-rose-600 shadow-[1px_1px_0px_#000] shrink-0"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
