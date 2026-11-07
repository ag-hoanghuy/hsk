# Kế hoạch: Web học tiếng Trung HSK3–HSK4

## 1. Phạm vi đã chốt

- Khung bài: **Standard Course HSK 3 và HSK 4**, mỗi cấp 20 bài (40 bài). Tên bài, chủ đề và điểm ngữ pháp theo giáo trình (`content/curriculum.json`).
- Từ vựng: **đề cương thi HSK mới 2025** (新版HSK考试大纲, dùng cho kỳ thi từ 13/12/2026; người dùng chọn ngày 07/11/2026).
  - Cấp 3 có 500 từ mới, cấp 4 có 1000 từ mới.
  - Người học đã biết khoảng HSK 1–2 cũ, nên các bài HSK3 dạy thêm khoảng 170 từ cấp 1–2 còn thiếu.
  - Mỗi bài có **từ chính** (15–20 từ, học kỹ) và **từ mở rộng** (phần còn lại). HSK3 khoảng 35 từ mỗi bài, HSK4 khoảng 50.
  - Phân bổ từ cho từng bài: `content/plan/allocation.json`.
- Nội dung do AI tự soạn (không chép sách vì bản quyền), có công cụ kiểm tra tự động; người biết tiếng Trung nên xem lại (`docs/can-xem-lai.md`).
- Chấm phát âm tự xây, chạy offline (Whisper + phân tích âm thanh), không dùng Azure.
- Chỉ dùng trên PC (Chrome/Edge), 1 người dùng, không đăng nhập. Máy có bộ gõ Pinyin của Windows.
- Người dùng muốn làm trọn vẹn không cần xác nhận giữa chừng (07/11/2026).

## 2. Kiến trúc

```
Browser (React + Vite + Tailwind)  ──/api──►  FastAPI  ──►  PostgreSQL 16
        │  AudioWorklet (ghi âm → wav 16k)       │  ├─ app/speech: Whisper + Praat (chấm phát âm, offline)
        │  hanzi-writer (luyện viết chữ)         │  ├─ edge-tts (giọng mẫu, cache audio/tts)
        │  <audio> phát mp3 mẫu  ◄──/audio──────┘  └─ nét chữ (cache audio/strokes)
```

Toàn bộ chạy bằng `docker compose up` hoặc bấm `start-web.bat`.

| Thành phần | Chọn |
|---|---|
| Frontend | React 18 + TS + Vite + Tailwind |
| Backend | FastAPI (Python 3.12), SQLAlchemy, Alembic |
| DB | PostgreSQL 16 (JSONB cho nội dung bài) |
| Audio mẫu | edge-tts, lưu cache |
| Chấm nói | faster-whisper (small, int8, CPU) + parselmouth/numpy |
| Viết chữ | hanzi-writer, dữ liệu nét từ hanzi-writer-data (cache) |
| Kiểm tra nội dung | `tools/validate_content.py` (pypinyin + danh sách từ HSK), `e2e/grading_check.mts` |

Cổng: web `5173`, API `8000`, Postgres `5441`.

## 3. Mô hình dữ liệu

- `lessons(id, level, number, title_zh, title_vi, summary, grammar_points, content JSONB)`. Cấu trúc `content` xem `content/_example/README.md`.
- `section_progress(lesson_id, section, completed_at, best_score)`. Các mục: vocab, grammar, dialogue, writing, practice, quiz, test, listening, reading, speaking.
- `attempts` + `attempt_answers`: quiz, bài kiểm tra, nghe, đọc. Có `tag` để thống kê lỗi.
- `speaking_attempts`: điểm và chi tiết chấm phát âm, kèm file ghi âm ở `audio/recordings/`.
- `mock_attempts`: thi thử cuối cấp.

## 4. Các giai đoạn

### Giai đoạn 0–2: khởi tạo, giao diện, trang bài học (xong)
Docker compose, giao diện pastel, pinyin tô màu theo thanh, audio TTS, các tab Từ vựng / Ngữ pháp / Hội thoại / Bài tập.

### Giai đoạn 3: quiz kiểu Quizizz và bài kiểm tra 8 dạng (xong)
Quiz từ vựng tự sinh (có thể gồm cả từ mở rộng) và quiz ngữ pháp, đếm giờ, chuỗi đúng. Bài kiểm tra 16 câu = 8 dạng × 2, kết quả có giải thích, thống kê lỗi, làm lại, và nút "câu của mình cũng đúng".

### Giai đoạn 4: luyện nghe và luyện đọc (xong)
5 chế độ nghe (từ chính và từ mở rộng, hội thoại, đoạn văn, nghe chọn, nghe điền). Đọc có pinyin bật/tắt, dịch từng đoạn, bấm vào từ để xem nghĩa, câu hỏi đọc hiểu có đúng/sai.

### Giai đoạn 5: luyện nói, tự chấm offline (xong)
- Bài có câu luyện nói được soạn sẵn (5–8 câu, kèm lưu ý phát âm), cộng thêm câu hội thoại và câu ví dụ.
- Chấm bằng nhận dạng giọng nói, so với các biến thể đổi thanh, tốc độ và ngắt quãng.
- Đồ thị cao độ chỉ để tham khảo, không tính điểm.
- Chi tiết đo đạc ở mục 5. Ngưỡng chỉnh trong `backend/app/speech/assess.py`.

### Giai đoạn 6: tiến độ, ôn tập, hoàn thiện (xong)
- [x] Trang **Tiến độ**: chuỗi ngày học, lịch 5 tuần, điểm từng bài, lỗi hay sai nhất, bài cần ôn hôm nay.
- [x] Ôn theo giãn cách 1–3–7–14–30 ngày, tính từ ngày làm xong bài kiểm tra. Trang chủ có banner nhắc ôn.
- [x] Trang **Lộ trình**: bảng 40 bài (chủ đề, mục tiêu giao tiếp, ngữ pháp, số từ), nhịp học, lịch ôn. Bản đọc ở `docs/lo-trinh.md`.
- [x] **Thi thử cuối cấp**: 40 câu ngẫu nhiên từ bài kiểm tra của cả cấp, đủ 8 dạng, gợi ý bài cần ôn.
- [x] **Viết chữ**: xem thứ tự nét, tô theo mẫu, viết theo trí nhớ. Đề thi mới yêu cầu viết chữ.
- [x] Bài học có mục tiêu, từ mở rộng, từ cần biết thêm, lỗi người Việt hay gặp, so sánh với tiếng Việt, tab Ôn nhanh.
- [x] `start-web.bat` / `stop-web.bat`, tự sao lưu mỗi ngày. Có `scripts/backup.ps1`, `restore.ps1`, `create-shortcut.ps1`.
- [x] Bộ kiểm thử trong repo: `e2e/` (trình duyệt) và `backend/tests` (logic).

### Giai đoạn 7: nội dung 40 bài (xong)
- [x] Phần A, tham khảo: `docs/tham-khao.md` (tóm tắt), `docs/research/pedagogy.md`, `content/reference/`.
- [x] Phân bổ từ vựng theo đề cương 2025 cho 40 bài.
- [x] HSK3 bài 1–20 và HSK4 bài 1–20 đã viết, qua công cụ kiểm tra (0 lỗi). Phủ 491/491 từ cấp 3, 990/990 từ cấp 4 và 171/171 từ cấp 1–2 còn thiếu. Ghi chú cần xem lại ở `docs/review-notes/` (HSK4 bài 7–20 viết ở chế độ tiết kiệm, không có ghi chú riêng; các cảnh báo còn lại do công cụ kiểm tra liệt kê).
- [x] Bản đọc Markdown của 40 bài (`docs/bai-hoc/`) và danh sách tổng hợp chỗ cần xem lại (`docs/can-xem-lai.md`).
- Bước cuối chưa làm theo yêu cầu tiết kiệm: chạy lại bộ kiểm thử trình duyệt `e2e/` trên đủ 40 bài.

## 5. Ghi chú về bộ chấm phát âm

Đã đo trên giọng máy edge-tts, chưa có giọng người thật:
- So đường cao độ với giọng mẫu để chấm từng âm tiết không đủ tin cậy (AUC khoảng 0,7), nên chỉ dùng để hiển thị.
- Chấm bằng Whisper trên 59 câu tự nhiên: AUC 0,82. Riêng bước so biến thể bắt được khoảng 40% lỗi sai thanh, và báo nhầm khoảng 3% câu đọc đúng.
- Mỗi lần chấm mất khoảng 4–8 giây trên CPU i5-11400.

## 6. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Nội dung AI soạn có thể sai | Công cụ kiểm tra (cấu trúc, pinyin, cấp độ từ, chú thích, bộ chấm) và ghi chú cần xem lại cho người biết tiếng Trung |
| Bộ chấm phát âm chưa kiểm chứng với giọng thật | Hiển thị như gợi ý tham khảo; bản ghi lưu lại để chỉnh ngưỡng |
| Đề cương 2025 còn vài điểm chưa rõ (hiệu lực, thi nói, điểm đậu) | Theo dõi thông báo của CTI, xem `docs/tham-khao.md` |
| edge-tts và dữ liệu nét chữ cần mạng lần đầu | Lưu cache sau lần đầu |

## 7. Cần người dùng cung cấp (không bắt buộc)

1. Vài bản ghi giọng thật qua trang Luyện nói, để chỉnh bộ chấm.
2. Người biết tiếng Trung xem lại các chỗ trong `docs/can-xem-lai.md`.
