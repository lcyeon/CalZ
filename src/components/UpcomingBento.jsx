import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Music, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import InterlockingCard from './InterlockingCard';

const ARTISTS = [
  { name: "LE SSERAFIM (르세라핌)", songs: ["EASY", "CRAZY", "UNFORGIVEN", "ANTIFRAGILE", "Smart"], genre: "K-Pop · Dance" },
  { name: "NewJeans (뉴진스)", songs: ["How Sweet", "Supernatural", "Ditto", "Hype Boy", "ETA"], genre: "K-Pop · R&B" },
  { name: "aespa (에스파)", songs: ["Supernova", "Armageddon", "Drama", "Next Level"], genre: "K-Pop · Electro" },
  { name: "DAY6 (데이식스)", songs: ["한 페이지가 될 수 있게", "예뻤어", "WELCOME TO THE SHOW"], genre: "Band · Rock" },
  { name: "IU (아이유)", songs: ["Love wins all", "관객이 될게", "에잇", "주홍글씨"], genre: "K-Pop · Vocal" },
  { name: "AKMU (악뮤)", songs: ["Hero", "Love Lee", "어떻게 이별까지 사랑하겠어"], genre: "Acoustic · Pop" },
  { name: "Taylor Swift", songs: ["Cruel Summer", "Fortnight", "Anti-Hero", "Lover"], genre: "Pop · Chill" },
  { name: "Billie Eilish", songs: ["BIRDS OF A FEATHER", "bad guy", "ocean eyes", "WILDFLOWER"], genre: "Alt Pop · Chill" }
];

const QUOTE_TOPICS = [
  {
    topic: "동기부여",
    quotes: [
      "작은 실천이 모여 위대한 성과를 만든다.",
      "성공은 수많은 실패에도 열정을 잃지 않는 능력이다.",
      "변화는 두려운 것이 아니라 성장의 기회다.",
      "가장 확실한 미래 예측 방법은 미래를 직접 만드는 것이다."
    ]
  },
  {
    topic: "휴식과 마음",
    quotes: [
      "오늘 하루 자신에게 따뜻한 휴식을 선물하세요.",
      "마음이 편안해야 일이 잘 풀린다.",
      "쉬어가는 것도 앞으로 나아가기 위한 과정이다."
    ]
  },
  {
    topic: "도전과 열정",
    quotes: [
      "시작이 반이다. 지금 바로 실행하라.",
      "한 한계를 넘어서면 새로운 가능성이 열린다.",
      "당신의 열정은 어떠한 한계도 뛰어넘을 수 있다."
    ]
  }
];

const getWeatherInfoFromCode = (code) => {
  if (code === 0) return { condition: "맑음" };
  if (code >= 1 && code <= 3) return { condition: "구름 많음" };
  if (code >= 51 && code <= 67) return { condition: "비" };
  if (code >= 71 && code <= 77) return { condition: "눈" };
  return { condition: "흐림" };
};

export default function UpcomingBento({ onAddSpecificEvent, isDarkMode = false }) {
  const [weatherData, setWeatherData] = useState({
    temp: "25°C",
    condition: "조회 중...",
    humidity: "60%",
    wind: "2.1 km/h",
    loading: true
  });

  const [musicOffset, setMusicOffset] = useState(0);
  const [quoteOffset, setQuoteOffset] = useState(0);

  const fetchLiveSeoulWeather = async () => {
    try {
      setWeatherData(prev => ({ ...prev, loading: true }));
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current_weather=true&hourly=relativehumidity_2m,windspeed_10m'
      );
      if (!response.ok) throw new Error("Weather API Error");

      const data = await response.json();
      const current = data.current_weather;

      const info = getWeatherInfoFromCode(current.weathercode);

      setWeatherData({
        temp: `${Math.round(current.temperature)}°C`,
        condition: info.condition,
        humidity: `${data.hourly?.relativehumidity_2m?.[0] || 65}%`,
        wind: `${current.windspeed} km/h`,
        loading: false
      });
    } catch {
      setWeatherData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLiveSeoulWeather();
  }, []);

  const getDayOfYearSeed = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const daySeed = getDayOfYearSeed();

  const getDynamicMusic = (offset) => {
    const artistIndex = (daySeed + offset) % ARTISTS.length;
    const artistObj = ARTISTS[artistIndex];
    const songIndex = (daySeed * 3 + offset * 7) % artistObj.songs.length;
    const songTitle = artistObj.songs[songIndex];

    const fullName = `${artistObj.name} - ${songTitle}`;
    return {
      title: fullName,
      artist: artistObj.name,
      songName: songTitle,
      genre: artistObj.genre,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(fullName)}`
    };
  };

  const getDynamicQuote = (offset) => {
    const topicIndex = (daySeed + offset) % QUOTE_TOPICS.length;
    const topicObj = QUOTE_TOPICS[topicIndex];
    const quoteIndex = (daySeed * 2 + offset * 5) % topicObj.quotes.length;
    return {
      text: topicObj.quotes[quoteIndex],
      author: topicObj.topic
    };
  };

  const currentMusic = getDynamicMusic(musicOffset);
  const currentQuote = getDynamicQuote(quoteOffset);

  const handlePlayMusic = () => {
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    window.open(currentMusic.youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAddMusicToSchedule = () => {
    onAddSpecificEvent({
      id: Date.now().toString(),
      title: `음악 감상: ${currentMusic.title}`,
      emoji: "🎧",
      time: "20:00",
      category: "취미",
      bgColor: "#74C8FF",
      date: new Date().toISOString().split('T')[0],
      url: currentMusic.youtubeUrl,
      completed: false
    });
    confetti({ particleCount: 30, spread: 40 });
  };

  const handleNextMusic = () => setMusicOffset(prev => prev + 1);
  const handleNextQuote = () => setQuoteOffset(prev => prev + 1);

  return (
    <div className="w-full flex flex-col gap-3 my-2">
      {/* 1. Seoul Weather Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="w-full p-4 neo-card bg-[#FFD5EB] text-[#162235] flex items-center justify-between relative overflow-hidden border-2 border-black"
        style={{ borderRadius: '28px' }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl border-2 border-black shadow-[1.5px_1.5px_0px_#000] shrink-0 ${
            isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black'
          }`}>
            {weatherData.condition.includes("비") ? "🌧️" : weatherData.condition.includes("맑음") ? "☀️" : "⛅"}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-black text-slate-800">서울 날씨</span>
              <span className="text-[11px] font-bold text-slate-700">· {weatherData.condition}</span>
            </div>

            <h3 className="text-base font-black text-[#162235] flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-mono-num font-black">{weatherData.temp}</span>
              <span className="text-xs font-bold text-slate-700">풍속 {weatherData.wind} · 습도 {weatherData.humidity}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={fetchLiveSeoulWeather}
            className={`p-1.5 rounded-xl border border-black/30 transition-colors shadow-[1px_1px_0px_#000] ${
              isDarkMode ? 'bg-[#162235] text-[#D7FF2F] hover:bg-black' : 'bg-white text-black hover:bg-slate-100'
            }`}
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${weatherData.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Interlocking Puzzle Pair: Music & Daily Quote */}
      <div className="w-full flex flex-col relative">
        {/* 2. Music Recommendation Card */}
        <InterlockingCard
          bgColor="#74C8FF"
          textColor="#162235"
          notchBottom={true}
          notchPosition="left"
          className="z-10"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-2xl flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000] ${
                isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black'
              }`}>
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black">추천 노래</p>
                <p className="text-[10px] font-bold text-slate-800">{currentMusic.genre}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNextMusic}
                className={`px-2.5 py-1 rounded-xl text-xs font-black border-2 border-black shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 transition-colors ${
                  isDarkMode ? 'bg-[#162235] text-white hover:bg-black' : 'bg-white text-black hover:bg-slate-100'
                }`}
                title="다른 곡"
              >
                <RefreshCw className={`w-3 h-3 ${isDarkMode ? 'text-[#D7FF2F]' : 'text-black'}`} />
                <span className="text-[10px] font-extrabold">다른 곡</span>
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="space-y-0.5 flex-1">
              <h4 className="text-sm sm:text-base font-black tracking-tight text-[#162235] line-clamp-1">
                {currentMusic.title}
              </h4>
              <p className="text-xs font-bold text-slate-800">
                아티스트: {currentMusic.artist}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayMusic}
              className="neo-btn px-3.5 py-1.5 bg-[#D7FF2F] text-black font-black text-xs shadow-[2px_2px_0px_#000] flex items-center gap-1 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>노래 듣기</span>
            </motion.button>
          </div>
        </InterlockingCard>

        {/* 3. Daily Quote Card */}
        <InterlockingCard
          bgColor="#C8FFF0"
          textColor="#162235"
          notchTop={false}
          className="-mt-3 z-0"
        >
          <div className="flex items-center justify-between mb-2 pt-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000] ${
                isDarkMode ? 'bg-[#162235] text-[#D7FF2F]' : 'bg-white text-black'
              }`}>
                <Quote className="w-4 h-4" />
              </div>
              <span className="text-xs font-black">{currentQuote.author}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleNextQuote}
                className={`p-1.5 rounded-xl border-2 border-black text-[10px] font-bold shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 transition-colors ${
                  isDarkMode ? 'bg-[#162235] text-white hover:bg-black' : 'bg-white text-black hover:bg-slate-100'
                }`}
                title="다른 명언"
              >
                <RefreshCw className={`w-3 h-3 ${isDarkMode ? 'text-[#D7FF2F]' : 'text-black'}`} />
                <span>다른 명언</span>
              </button>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000] mt-1.5 ${
            isDarkMode ? 'bg-[#162235] text-white' : 'bg-white text-[#162235]'
          }`}>
            <p className={`text-xs sm:text-sm font-black text-center italic ${
              isDarkMode ? 'text-white' : 'text-[#162235]'
            }`}>
              "{currentQuote.text}"
            </p>
          </div>
        </InterlockingCard>
      </div>
    </div>
  );
}
