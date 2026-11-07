# Kiểm thử tự động

Cần web đang chạy (`docker compose up`), Node.js 22+ và Microsoft Edge (đường dẫn khác thì đặt biến `EDGE_PATH`).

```
cd e2e
npm install
npm run grading        # mọi câu hỏi của mọi bài qua đúng bộ chấm của web (không cần trình duyệt)
npm run lesson         # trang bài học: từ vựng, quiz, bài kiểm tra, bài tập, ôn nhanh, viết chữ, tiến độ
npm run listen-read    # luyện nghe, luyện đọc
npm run speaking       # luyện nói với micro giả (cần mô hình nhận dạng đã tải xong)
npm run pages          # mở mọi bài và mọi tab, thi thử cấp 3 và 4
```

**Dữ liệu học:** các bài kiểm thử tạo lượt làm bài và tiến độ, rồi tự xoá sau khi chạy xong. Nếu DB đã có dữ liệu học thật,
chúng từ chối chạy. Muốn chạy trên DB đó thì sao lưu trước (`scripts\backup.ps1`) rồi đặt `E2E_RESET=1`: mọi lượt làm bài
và tiến độ sẽ bị xoá. Tốt nhất chỉ chạy kiểm thử trước khi bắt đầu học thật, hoặc trên một máy khác.

Ảnh chụp màn hình lưu ở `e2e/shots/` (không đưa vào git). File âm thanh trong `fixtures/` là giọng đọc máy của câu
hội thoại đầu tiên bài 1 (giọng khác giọng mẫu) và một câu không liên quan.
