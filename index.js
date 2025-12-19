import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';

const app = express();
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

// --- GIAO DIỆN TRANG CHỦ (HTML + CSS + JS) ---
const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bot Status & Clicker</title>
  <style>
    /* Giao diện Dark Mode giống Discord */
    body {
      background-color: #2b2d31;
      color: #f2f3f5;
      font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      user-select: none;
    }
    .card {
      background-color: #313338;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      text-align: center;
      width: 350px;
    }
    
    /* Phần hiển thị Ping */
    .ping-container {
      margin-bottom: 20px;
      font-size: 18px;
      color: #b5bac1;
    }
    .ping-value {
      color: #23a559; /* Màu xanh lá */
      font-weight: bold;
      font-family: monospace;
      font-size: 20px;
    }

    /* Nút bấm Click */
    .click-btn {
      background-color: #5865F2; /* Màu Blurple của Discord */
      color: white;
      border: none;
      padding: 15px 25px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      width: 100%;
    }
    .click-btn:hover {
      background-color: #4752c4;
    }
    .click-btn:active {
      transform: scale(0.96);
    }
    
    /* Status Badge */
    .badge {
      margin-top: 20px;
      display: inline-block;
      font-size: 12px;
      color: #949BA4;
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="ping-container">
      📡 Ping: <span id="ping-text" class="ping-value">Checking...</span>
    </div>

    <button id="counter-btn" class="click-btn" onclick="handleClick()">
      Bạn đã click được 0 cái
    </button>

    <div class="badge">SYSTEM ONLINE • VERCEL</div>
  </div>

  <script>
    // 1. Xử lý Ping (Đo thời gian phản hồi HTTP)
    async function checkPing() {
      const start = Date.now();
      try {
        // Gửi request nhẹ về chính trang này
        await fetch(window.location.href, { method: 'HEAD' });
        const end = Date.now();
        const latency = end - start;
        
        const pingEl = document.getElementById('ping-text');
        pingEl.innerText = latency + ' ms';

        // Đổi màu dựa trên độ trễ
        if(latency < 100) pingEl.style.color = '#23a559'; // Xanh
        else if(latency < 300) pingEl.style.color = '#faa61a'; // Vàng
        else pingEl.style.color = '#f23f42'; // Đỏ

      } catch (e) {
        document.getElementById('ping-text').innerText = 'Offline';
      }
    }

    // Chạy đo ping mỗi 2 giây
    setInterval(checkPing, 2000);
    checkPing(); // Chạy ngay khi mở

    // 2. Xử lý Nút Bấm
    let count = 0;
    const btn = document.getElementById('counter-btn');

    // (Tùy chọn) Lấy số cũ từ bộ nhớ trình duyệt nếu có
    if (localStorage.getItem('clickCount')) {
      count = parseInt(localStorage.getItem('clickCount'));
      btn.innerText = 'Bạn đã click được ' + count + ' cái';
    }

    function handleClick() {
      count++;
      btn.innerText = 'Bạn đã click được ' + count + ' cái';
      localStorage.setItem('clickCount', count); // Lưu lại để F5 không mất
    }
  </script>
</body>
</html>
`;

// Route GET: Trả về trang Web đẹp
app.get('/', (req, res) => {
  res.send(htmlContent);
});

// Route POST: Xử lý Discord (Quan trọng nhất)
app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  // Logic khác nếu có...
  return res.status(200).send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Endpoint hoạt động tốt!' }
  });
});

// Route phụ redirect
app.get('/interactions', (req, res) => res.redirect('/'));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log('Server is running...'));
}

export default app;
