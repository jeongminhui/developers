// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const apiRouter = require('./routes/api');
const viewRouter = require('./routes/view');

// CORS 설정
const allowedOrigins = ['http://localhost:3333', 'http://192.168.0.114:3333'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // 쿠키 인증 정보 포함
}));

// JSON 및 정적 파일 제공
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 업로드 폴더 제공

// 라우터 설정
app.use('/api', apiRouter); // /api 경로를 통해 API 접근 가능
app.use('/', viewRouter);

const PORT = process.env.PORT || 3333;

app.listen(PORT, '0.0.0.0', () => {  // localhost 외 내부 네트워크 IP를 통해서도 접근 가능하도록
  console.log(`Server running:
    - Local: http://localhost:${PORT}
    - Network: http://192.168.0.114:${PORT}`);
});