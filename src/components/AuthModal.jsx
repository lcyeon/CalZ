import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/authService';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  isDarkMode = false
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await authService.signup({ email, password, userName });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        onLoginSuccess(result.user, result.data);
      } else {
        const result = await authService.login({ email, password });
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        onLoginSuccess(result.user, result.data);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`w-full max-w-md p-5 sm:p-6 rounded-[36px] border-4 border-black shadow-[8px_8px_0px_#000] space-y-4 ${
            isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-white text-[#162235]'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#D7FF2F] stroke-[2.5]" />
              <h3 className="font-black text-base sm:text-lg font-display">
                {mode === 'login' ? '내 계정으로 로그인' : '새 계정 회원가입'}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-black dark:text-white border-2 border-black hover:bg-slate-200"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-black">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
                mode === 'login'
                  ? 'bg-[#D7FF2F] text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 ${
                mode === 'signup'
                  ? 'bg-[#D7FF2F] text-black border border-black shadow-[1.5px_1.5px_0px_#000]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>회원가입</span>
            </button>
          </div>

          {/* Guest Mode Notice */}
          <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black flex flex-col gap-1.5 border border-amber-500/20">
            <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>24시간 로컬 게스트 모드 구동 중</span>
            </span>
            <p className="font-medium text-[10px] leading-relaxed text-slate-700 dark:text-slate-300">
              현재 데이터베이스 서버가 개설되지 않았습니다. **회원가입/로그인 없이도** 메인 화면에서 일정을 자유롭게 추가하고 러닝을 기록할 수 있으며, 모든 데이터는 이 기기(아이폰) 내에 자동으로 안전하게 저장됩니다!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 py-1.5 bg-amber-600 text-white font-black rounded-xl text-[10px] text-center hover:bg-amber-700 transition-colors"
            >
              로그인 없이 그냥 사용하기 (데이터 자동 저장됨)
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500 text-white text-xs font-extrabold flex items-center gap-2 border-2 border-black">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-black block mb-1">이름 / 닉네임</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="예: 채영"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border-2 font-black text-xs ${
                      isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-slate-50 border-black text-black'
                    }`}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-black block mb-1">이메일 주소</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border-2 font-bold text-xs ${
                    isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-slate-50 border-black text-black'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black block mb-1">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력 (6자리 이상)"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-2xl border-2 font-bold text-xs ${
                    isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-slate-50 border-black text-black'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#D7FF2F] text-black font-black text-xs sm:text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>처리 중...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인하기</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>가입 완료 및 로그인</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
