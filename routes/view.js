// routes/view.js -> 페이지 라우팅 관련
const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin.html'));
});

router.get('/viewer', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/viewer.html'));
});

module.exports = router;
