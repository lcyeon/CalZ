import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, User, Camera, Upload, Moon, Sun, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';

// Fun, Trendy Emoji Avatar Presets
const EMOJI_PRESETS = [
  { id: 1, emoji: '🏃‍♀️', bg: '#D7FF2F', label: '러너' },
  { id: 2, emoji: '🐱', bg: '#FFD5EB', label: '고양이' },
  { id: 3, emoji: '🎧', bg: '#74C8FF', label: '리스너' },
  { id: 4, emoji: '🎨', bg: '#C8FFF0', label: '아티스트' },
  { id: 5, emoji: '⚡', bg: '#FFFDE7', label: '에너지' },
  { id: 6, emoji: '🚀', bg: '#74C8FF', label: '로켓' },
  { id: 7, emoji: '🍕', bg: '#FFD5EB', label: '피자' },
  { id: 8, emoji: '🥑', bg: '#C8FFF0', label: '아보카도' }
];

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  isDarkMode = false,
  onToggleDarkMode
}) {
  const [name, setName] = useState(userProfile.userName || '채영');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.userAvatar || EMOJI_PRESETS[0].emoji);
  const [bio, setBio] = useState(userProfile.userBio || '매일 꾸준히 달리는 중 🏃‍♀️');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Is avatar a photo URL / DataURL or an Emoji string?
  const isImageAvatar = avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image');

  // Handle local image file upload from photo album/device
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      userName: name.trim() || '채영',
      userAvatar: avatarUrl,
      userBio: bio.trim()
    });

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`w-full max-w-md p-5 sm:p-6 rounded-[36px] border-4 border-black shadow-[8px_8px_0px_#000] space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar ${
            isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-white text-[#162235]'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#D7FF2F] stroke-[2.5]" />
              <h3 className="font-black text-base sm:text-lg font-display">
                개인 프로필 & 설정
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Preview & File Upload Trigger */}
            <div className="flex flex-col items-center justify-center space-y-3 py-1">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="사진첩에서 프로필 사진 선택하기"
              >
                <div className="w-24 h-24 rounded-full border-4 border-black bg-[#74C8FF] overflow-hidden shadow-[4px_4px_0px_#000] flex items-center justify-center text-3xl">
                  {isImageAvatar ? (
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{avatarUrl || '🏃‍♀️'}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#D7FF2F] text-black border-2 border-black rounded-full flex items-center justify-center shadow-[1px_1px_0px_#000]">
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-transform hover:scale-105 ${
                  isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-[#D7FF2F] text-black'
                }`}
              >
                <Upload className="w-3.5 h-3.5 stroke-[3]" />
                <span>내 앨범 / 사진첩에서 사진 가져오기</span>
              </button>
            </div>

            {/* Fun Emoji Avatar Presets */}
            <div>
              <label className="text-xs font-black block mb-1.5 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-[#D7FF2F]" /> 귀여운 이모지 아바타 선택
              </label>
              <div className="grid grid-cols-4 gap-2 py-1">
                {EMOJI_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.emoji)}
                    className={`h-11 rounded-2xl border-2 border-black flex items-center justify-center text-xl transition-all shadow-[1.5px_1.5px_0px_#000] ${
                      avatarUrl === preset.emoji
                        ? 'scale-110 ring-4 ring-[#D7FF2F] font-black'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.bg }}
                  >
                    <span>{preset.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname Input */}
            <div>
              <label className="text-xs font-black block mb-1">닉네임</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className={`w-full p-2.5 rounded-2xl border-2 font-black text-sm ${
                  isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-slate-50 border-black text-black'
                }`}
                required
              />
            </div>

            {/* Status Bio Input */}
            <div>
              <label className="text-xs font-black block mb-1">한 줄 다짐 메모</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="예: 매일 5km 러닝 도전!"
                className={`w-full p-2.5 rounded-2xl border-2 font-bold text-xs ${
                  isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-slate-50 border-black text-black'
                }`}
              />
            </div>

            {/* Theme Toggle Quick Switch */}
            <div className="p-3 rounded-2xl border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000] bg-[#FFD5EB]/20">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span className="text-xs font-black text-black dark:text-white">화면 테마 모드</span>
              </div>
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="px-3 py-1 bg-black text-[#D7FF2F] font-black text-xs rounded-xl border border-black"
              >
                {isDarkMode ? "다크 모드 ON" : "라이트 모드 ON"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#D7FF2F] text-black font-black text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>프로필 저장하기</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
