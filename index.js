import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';

const app = express();
// Lấy Key từ biến môi trường của Vercel
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

/**
 * Route duy nhất: /interactions
 * verifyKeyMiddleware: Tự động kiểm tra chữ ký bảo mật từ Discord.
 * Nếu sai chữ ký, nó tự trả về lỗi 401 (Unauthorized) và chặn luôn.
 */
app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  // --- XỬ LÝ PING (BẮT BUỘC) ---
  // Khi bạn bấm Save URL trên Discord, nó gửi cái này để test.
  if (interaction.type === InteractionType.PING) {
    return res.send({
      type: InteractionResponseType.PONG,
    });
  }

  // --- NẾU CÓ LỆNH GỬI ĐẾN MÀ CHƯA XỬ LÝ ---
  // Code này chưa có logic xử lý lệnh, nên trả về lỗi hoặc log ra thôi
  console.log('Nhận được Interaction:', interaction.id);
  
  return res.status(200).send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: 'Endpoint này đang hoạt động, nhưng chưa cài đặt lệnh nào.' }
  });
});

// Cấu hình để chạy Local (Test trên máy)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

// Xuất App để Vercel chạy (Serverless)
export default app;
