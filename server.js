import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = process.env.PORT || 5001;
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Initialize Database JSON file if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDB = {
      users: [
        {
          id: 'user_demo_1',
          email: 'chaeyeong@example.com',
          passwordHash: hashPassword('123456'),
          userName: '채영',
          createdAt: new Date().toISOString(),
          data: {
            userProfile: {
              userName: '채영',
              userAvatar: '🏃‍♀️',
              userBio: '매일 5km 꾸준히 달리는 중 🏃‍♀️'
            },
            events: [
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
                title: '디자인 피드백 미팅 🎨',
                emoji: '💼',
                time: '14:30',
                category: '업무',
                bgColor: '#FFD5EB',
                date: '2026-07-21',
                completed: true
              }
            ],
            memos: {
              '2026-07-21': '오늘 준비물: 러닝화 챙기기!\n미팅 서류 검토 완료'
            },
            runningLogs: [
              {
                id: '1',
                date: '2026-07-21',
                course: '여의도 한강공원 코스',
                durationMins: 32,
                distanceKm: 5.5,
                pace: "5'49\"/km",
                memo: '컨디션 최상!'
              }
            ]
          }
        }
      ],
      sessions: {}
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
  }
}

function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    initDB();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
}

function writeDB(dbData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'neo_salt_key_2026').digest('hex');
}

function generateToken() {
  return 'token_' + crypto.randomBytes(16).toString('hex');
}

// CORS Helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    let parsedBody = {};
    if (body) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        // Body parser catch
      }
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // 1. SIGNUP API
    if (pathname === '/api/signup' && req.method === 'POST') {
      const { email, password, userName } = parsedBody;
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '이메일과 비밀번호를 모두 입력해주세요.' }));
        return;
      }

      const db = readDB();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '이미 가입된 이메일 주소입니다.' }));
        return;
      }

      const newUserId = 'user_' + Date.now();
      const token = generateToken();
      const newUser = {
        id: newUserId,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        userName: userName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        data: {
          userProfile: {
            userName: userName || email.split('@')[0],
            userAvatar: '🏃‍♀️',
            userBio: '반갑습니다!'
          },
          events: [],
          memos: {},
          runningLogs: []
        }
      };

      db.users.push(newUser);
      db.sessions[token] = newUserId;
      writeDB(db);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          userName: newUser.userName
        },
        data: newUser.data
      }));
      return;
    }

    // 2. LOGIN API
    if (pathname === '/api/login' && req.method === 'POST') {
      const { email, password } = parsedBody;
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '이메일과 비밀번호를 입력해주세요.' }));
        return;
      }

      const db = readDB();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.passwordHash !== hashPassword(password)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }));
        return;
      }

      const token = generateToken();
      db.sessions[token] = user.id;
      writeDB(db);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          userName: user.userName
        },
        data: user.data
      }));
      return;
    }

    // Auth Middleware helper
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const db = readDB();
    const userId = db.sessions[token];

    // 3. GET USER DATA API
    if (pathname === '/api/user-data' && req.method === 'GET') {
      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '인증이 필요합니다.' }));
        return;
      }

      const user = db.users.find(u => u.id === userId);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        user: { id: user.id, email: user.email, userName: user.userName },
        data: user.data
      }));
      return;
    }

    // 4. POST USER DATA API (CLOUD DATA SYNC)
    if (pathname === '/api/user-data' && req.method === 'POST') {
      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '인증이 필요합니다.' }));
        return;
      }

      const userIndex = db.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '사용자를 찾을 수 없습니다.' }));
        return;
      }

      const { data } = parsedBody;
      if (data) {
        db.users[userIndex].data = {
          ...db.users[userIndex].data,
          ...data
        };
        if (data.userProfile && data.userProfile.userName) {
          db.users[userIndex].userName = data.userProfile.userName;
        }
        writeDB(db);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: db.users[userIndex].data }));
      return;
    }

    // 404 Route
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '요청한 엔드포인트를 찾을 수 없습니다.' }));
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Database Auth Server running at http://localhost:${PORT}`);
});
