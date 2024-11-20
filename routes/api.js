// routes/api.js -> 콘텐츠 관리, 이미지 업로드 관련
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/'); // 이미지가 저장될 폴더
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  }
});

// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한 (5MB)
});



// 콘텐츠 업데이트 엔드포인트
router.post('/content', (req, res) => {
  const { href, title, content } = req.body;
  const contentFilePath = path.join(__dirname, '..', 'public', 'data', 'content.json');

  // content.json 파일을 읽고 해당 항목의 content만 업데이트
  fs.readFile(contentFilePath, 'utf-8', (err, data) => {
      if (err) return res.status(500).send('Failed to read content file.');

      const contentData = JSON.parse(data);

      // href 값에 따라 해당 항목을 찾아 content 업데이트
      const updateContent = (items) => {
          for (const item of items) {
              if (item.href === href) {
                  item.content = content;
                  item.title = title;
                  return true;
              } else if (item.submenu) {
                  if (updateContent(item.submenu)) return true;
              }
          }
          return false;
      };

      if (!updateContent(contentData)) {
          return res.status(404).send('Content not found.');
      }

      // 업데이트된 contentData를 다시 저장
      fs.writeFile(contentFilePath, JSON.stringify(contentData, null, 2), (err) => {
          if (err) return res.status(500).send('Failed to save content.');
          res.status(200).send('Content updated successfully.');
      });
  });
});

// 이미지 업로드 엔드포인트
router.post('/upload', upload.single('upload'), (req, res) => {
  // const imageUrl = `/uploads/${req.file.filename}`;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({
      uploaded: true,
      url: fileUrl // CKEditor에서 사용될 이미지 URL 반환
  });
  // res.status(200).json({ url: fileUrl });
});

// 새로운 콘텐츠 항목 추가 엔드포인트
router.post('/addContent', (req, res) => {
  const { label, href, title, content, submenu } = req.body;
  const contentFilePath = path.join(__dirname, '..', 'public', 'data', 'content.json');

  // 새로운 항목을 생성
  const newContent = { label, href, title, content, submenu };

  // 기존 데이터 읽고 새로운 항목 추가
  fs.readFile(contentFilePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('Failed to read content file.');

    const contentData = JSON.parse(data);
    contentData.push(newContent); // 새로운 항목 추가

    fs.writeFile(contentFilePath, JSON.stringify(contentData, null, 2), (err) => {
      if (err) return res.status(500).send('Failed to save content.');
      res.status(200).send('Content added successfully.');
    });
  });
});

// 콘텐츠 추가 및 업데이트 엔드포인트 -> 차후 루트 메뉴 추가와 통합 예쩡.
router.post('/updateContent', (req, res) => {
  const contentData = req.body; // 업데이트할 전체 데이터
  const contentFilePath = path.join(__dirname, '..', 'public', 'data', 'content.json');

  // content.json 파일에 새로운 데이터 저장
  fs.writeFile(contentFilePath, JSON.stringify(contentData, null, 2), (err) => {
    if (err) return res.status(500).send('Failed to save content.');
    res.status(200).send('Content updated successfully.');
  });
});


module.exports = router;
