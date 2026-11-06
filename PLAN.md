# Kế hoạch: Web học tiếng Trung HSK3–HSK4

## 1. Phạm vi đã chốt

- Giáo trình: **Standard Course HSK 3 và HSK 4**, mỗi cấp 20 bài (tổng 40 bài).
- Nội dung: Claude soạn nội dung gốc bám theo từ vựng và ngữ pháp của từng bài (không chép nguyên văn sách vì bản quyền). Người biết tiếng Trung nên xem lại.
- Giao hàng theo giai đoạn: khung web + 2 bài mẫu hoàn chỉnh trước, duyệt xong mới nạp 38 bài còn lại.
- Chấm phát âm: **tự xây, chạy offline trong backend** (nhận dạng giọng nói Whisper + phân tích âm thanh), không dùng Azure và không cần key (người dùng đã bỏ Azure ngày 2026-11-06).
- Thiết bị: chỉ PC (Chrome/Edge). Micro hoạt động ở `localhost`, không cần HTTPS.
- Người dùng: 1 người, không đăng nhập, tiến độ lưu trong DB.
- Quiz kiểu Quizizz là tính năng gamified có sẵn trong web, không tích hợp quizizz.com.

## 2. Kiến trúc

```
Browser (React + Vite + Tailwind)  ──/api──►  FastAPI  ──►  PostgreSQL 16
        │  AudioWorklet (ghi âm → wav 16k)       │  └─ app/speech: Whisper + Praat (chấm phát âm, offline)
        │  <audio> phát mp3 mẫu  ◄──/audio──────┘
```

Toàn bộ chạy bằng `docker compose up` (db, backend, frontend). Nội dung bài học nằm ở `content/hsk3|hsk4/lesson-XX.json`, backend tự nạp vào DB khi khởi động.

| Thành phần | Chọn | Lý do |
|---|---|---|
| Frontend | React 18 + TS + Vite + Tailwind | UI nhanh, dễ làm giao diện đẹp |
| Backend | FastAPI (Python 3.12) | Hệ sinh thái xử lý tiếng Trung/âm thanh tốt |
| DB | PostgreSQL 16 | Ổn định, JSONB cho nội dung bài |
| Audio mẫu | edge-tts, tạo sẵn mp3 lưu `audio/` | Giọng tự nhiên, nghe lại không cần mạng |
| Chấm nói | faster-whisper (small, int8, CPU) + parselmouth/numpy | Offline, không cần key; xem giai đoạn 5 |
| Pinyin | pypinyin (kiểm tra dữ liệu), pinyin tô màu theo thanh điệu ở UI | |

Cổng: web `5173`, API `8000`, Postgres `5441` (cổng 5434 đang bị chiếm trên máy).

## 3. Mô hình dữ liệu

- `lessons(id, level, number, title_zh, title_vi, summary, content JSONB)`: `content` chứa vocab, grammar, dialogue, exercises, quiz, test, reading, listening, speaking.
- `section_progress(lesson_id, section, completed_at, best_score)`
- `test_attempts(id, lesson_id, started_at, finished_at, score, total)`
- `attempt_answers(id, attempt_id, question_id, qtype, user_answer, is_correct, tag)`: `tag` là từ vựng hoặc điểm ngữ pháp liên quan, dùng để thống kê lỗi sai.
- `speaking_attempts(id, lesson_id, text, overall, accuracy, fluency, details JSONB, audio_path, created_at)`: `details` chứa kết quả từng âm tiết, gợi ý và dữ liệu vẽ biểu đồ; bản ghi âm lưu ở `audio/recordings/<id>.wav`.
- `quiz_attempts(id, lesson_id, kind[vocab|grammar], score, streak_max, created_at)`

Schema mẫu cho một bài: `content/_example/lesson.example.json`.

## 4. Các giai đoạn

### Giai đoạn 0 – Khởi tạo (xong)
- [x] Cấu trúc dự án, docker-compose (db + backend + frontend)
- [x] Backend: health, `/api/lessons`, nạp nội dung từ JSON
- [x] Frontend: layout, điều hướng, trang danh sách bài HSK3/HSK4
- **Nghiệm thu:** `docker compose up --build` rồi mở http://localhost:5173 thấy giao diện.

### Giai đoạn 1 – Nền tảng và thiết kế giao diện (xong phần chính)
- [x] Giao diện pastel hồng, font Be Vietnam Pro + Noto Sans SC, pinyin tô màu theo thanh điệu (`PinyinText`), `AudioButton`, thẻ, nút.
- [x] Mục lục 40 bài (`content/curriculum.json`: tên bài + điểm ngữ pháp), lấy từ Chinese Grammar Wiki (allsetlearning.com) và các trang mục lục sách. Danh sách từ vựng từng bài chưa có nguồn công khai, nên từ vựng 2 bài mẫu do Claude chọn trong danh sách từ HSK3.
- [x] Bảng `lessons`, `section_progress`; trang chủ hiện tiến độ từng bài.
- [x] Alembic migration: đã thêm ở giai đoạn 3.
- [ ] Công cụ kiểm tra tự động JSON bài học (schema, pinyin khớp hanzi): làm ở giai đoạn 7.

### Giai đoạn 2 – Trang bài học và 2 bài mẫu (HSK3 bài 1–2) (xong)
- [x] Audio: endpoint `/api/tts?text=` tạo mp3 bằng edge-tts (giọng Xiaoxiao) lần đầu rồi lưu cache ở `audio/tts/`; có chế độ chậm. Cần internet lần đầu cho mỗi câu mới.
- [x] Trang bài học gồm các tab Từ vựng (thẻ có ví dụ), Ngữ pháp, Hội thoại (bật/tắt pinyin và tiếng Việt, nghe từng câu hoặc cả bài), Bài tập (chọn đáp án, sắp xếp câu, nối từ, có giải thích và chấm điểm).
- [x] Nội dung HSK3 bài 1 và bài 2 (14 từ, 3 điểm ngữ pháp, hội thoại 7–8 câu, 12–14 bài tập mỗi bài).
- **Nghiệm thu:** học trọn vẹn 1 bài từ đầu đến cuối, tiến độ được lưu.

### Giai đoạn 3 – Quiz Quizizz-style và bài kiểm tra 8 dạng (xong)
- [x] Alembic: `backend/migrations` (0001 baseline, 0002 attempts), chạy tự động khi backend khởi động. Đã thử nâng cấp trên DB có sẵn.
- [x] Quiz từ vựng: tự sinh từ danh sách từ của bài (hanzi→nghĩa, nghĩa→hanzi, nghe→hanzi), không cần soạn thêm. Quiz ngữ pháp: câu trắc nghiệm soạn riêng (`content.quiz.grammar`, 6 câu/bài).
- [x] Kiểu Quizizz: từng câu một, đếm giờ 20 giây (tắt được), điểm theo tốc độ, chuỗi đúng 🔥, hiệu ứng đúng/sai, bảng kết quả và danh sách câu cần xem lại.
- [x] Bài kiểm tra cuối bài `content.test`: 16 câu = 8 dạng × 2 (chọn đáp án, nối từ, sắp xếp câu, điền từ, nghe chọn đáp án, nghe viết lại, dịch Việt–Trung, dịch Trung–Việt). Làm xong mới nộp, có thanh chuyển câu và cảnh báo khi còn câu trống.
- [x] Kết quả: điểm, đúng/sai từng câu, đáp án đúng, giải thích, thống kê lỗi theo dạng câu và theo từ vựng/ngữ pháp, xem lại các lần làm trước, làm lại bài, thống kê lỗi hay gặp qua nhiều lần.
- [x] Chấm điểm ở trình duyệt (`frontend/src/lib/grading.ts`), server lưu kết quả. Chữ Hán so khớp bỏ qua dấu câu/khoảng trắng; tiếng Việt bỏ qua hoa thường và dấu, chấp nhận theo từ khoá (`keywords`). Nút "Câu trả lời của mình cũng đúng" để sửa khi chấm tự động sai.
- [x] Bàn phím chữ Hán tạm (các chữ của đáp án + chữ gây nhiễu) cho trường hợp chưa cài bộ gõ Pinyin.
- [x] Dùng bảng chung `attempts` + `attempt_answers` cho cả quiz và test (thay cho `test_attempts`/`quiz_attempts` ghi ở mục 3).
- [x] Sửa lỗi: đáp án đúng của bài tập/quiz/test không còn luôn nằm đầu (xáo thứ tự mỗi lần làm).
- **Kiểm thử:** 28 kiểm tra e2e tự động chạy trên Edge (quiz, hết giờ, làm đúng hết, làm sai, câu bỏ trống, ghi đè, xem lại, thống kê) và kiểm tra tự động toàn bộ nội dung test của 2 bài mẫu (mọi đáp án chấp nhận đều được chấm đúng, câu sai bị chấm sai).

### Giai đoạn 4 – Luyện nghe và luyện đọc (xong)
- [x] Trang **Luyện nghe** (`/listening`, `/listening/:id`) với 5 chế độ, nghe lại không giới hạn và có nghe chậm:
  - Nghe từ vựng: thẻ ẩn đáp án, bấm để xem, nghe lần lượt cả bài, trộn thứ tự.
  - Nghe hội thoại: chữ Hán / pinyin / tiếng Việt ẩn mặc định, bật dần từng thứ; nghe từng câu hoặc cả bài.
  - Nghe đoạn văn ngắn: nghe trước, trả lời câu hỏi, xem nội dung sau (`content.listening`).
  - Nghe và chọn đáp án (10 câu) và nghe và điền từ còn thiếu (8 câu): tự sinh từ từ vựng, hội thoại và câu ví dụ của bài, mỗi lần "Làm lại" ra bộ câu mới.
- [x] Trang **Luyện đọc** (`/reading`, `/reading/:id`): đoạn văn tách từ sẵn (`content.reading`), bật/tắt pinyin trên từng từ, bật/tắt bản dịch từng đoạn, bấm vào từ để xem pinyin + nghĩa (và nghe từ đó), nghe cả đoạn, câu hỏi đọc hiểu gồm cả đúng/sai (对/错).
- [x] Điểm và lỗi của nghe/đọc lưu vào `attempts` (kind `listening` / `reading`) và `section_progress`; trang chọn bài hiện điểm cao nhất.
- [x] `tools/validate_content.py`: kiểm tra nội dung bằng `pypinyin` (pinyin từng từ khớp chữ Hán, kể cả chữ đa âm, biến điệu thanh 3, 一/不, âm nhi), cấu trúc câu hỏi, đáp án sắp xếp ghép được, tag từ vựng tồn tại. Đã chạy trên cả 2 bài mẫu, 0 lỗi. Lệnh chạy ở README.
- [x] Sửa lỗi: nút âm thanh bị ngắt bởi nút khác không còn kẹt ở trạng thái "đang phát".
- **Kiểm thử:** 34 kiểm tra e2e mới (nghe/đọc) + chạy lại 28 kiểm tra giai đoạn 3, kiểm tra thuộc tính của bộ sinh câu hỏi nghe (300 lần ngẫu nhiên x 2 bài).
- Ghi chú: mục "Kiểm tra" trên thanh điều hướng vẫn là trang giữ chỗ, sẽ làm thành trang tổng hợp ở giai đoạn 6.

### Giai đoạn 5 – Luyện nói, tự chấm offline (xong)
- [x] Trang **Luyện nói** (`/speaking`, `/speaking/:id`): danh sách câu của bài (hội thoại, mẫu câu ngữ pháp, câu ví dụ từ vựng, tự lấy từ nội dung bài), nghe mẫu (thường/chậm), ghi âm bằng micro, nghe lại giọng mình, điểm tổng + sao, điểm Phát âm và Trôi chảy, từng âm tiết đúng/sai kèm giải thích tiếng Việt, gợi ý sửa, đồ thị cao độ và độ lớn so với giọng mẫu, điểm cao nhất từng câu.
- [x] Ghi âm ở trình duyệt bằng AudioWorklet, đổi sang WAV 16 kHz mono (`frontend/src/lib/recorder.ts`), không cần ffmpeg.
- [x] Chấm điểm ở backend (`backend/app/speech/`), ba nguồn bằng chứng:
  1. **Nhận dạng giọng nói** (faster-whisper `small`, int8, CPU, tải một lần về `./models`): so chữ nghe được với câu mong đợi theo pinyin có thanh (sai âm, thiếu chữ, thừa chữ, nghe thành thanh khác), chữ Hán phồn thể vẫn được chấp nhận.
  2. **Bắt lỗi thanh điệu mà nhận dạng tự sửa**: Whisper chấm cùng một đoạn âm thanh với câu đúng và với các biến thể đổi thanh một âm tiết, trừ đi phần thiên lệch của mô hình ngôn ngữ (đo trên im lặng). Âm tiết nào biến thể khớp hơn thì bị đánh dấu "xem lại thanh".
  3. **Âm thanh**: tốc độ so với mẫu, số lần ngắt quãng, âm tiết gần như không có tiếng (nhận dạng đôi khi tự đoán nốt phần thiếu), âm lượng nhỏ, tiếng ồn, âm bị vỡ.
- [x] Đồ thị cao độ (Praat) và độ lớn của giọng bạn so với giọng mẫu chỉ để quan sát, không tính điểm.
- [x] Bảng `speaking_attempts` (Alembic 0003), `section_progress` có thêm mục `speaking`; bỏ biến môi trường Azure.
- **Kết quả đo (chỉ trên giọng máy edge-tts, chưa có giọng người thật):**
  - So đường cao độ người học với giọng mẫu để chấm từng âm tiết không đủ tin cậy (AUC khoảng 0,7, hai giọng máy đọc cùng câu cũng chỉ tương quan 0,76), nên không dùng để chấm.
  - Chấm bằng Whisper trên 59 câu tự nhiên: AUC 0,82; riêng bước 2 bắt được khoảng 40% lỗi sai thanh và khoảng 3% câu đọc đúng bị đánh dấu nhầm (chưa đo riêng khi kết hợp với bước 1, vốn tự bắt thêm một phần lỗi thanh khi nghe ra chữ khác). Chỉnh ở `TONE_MARGIN` và `PRIOR_WEIGHT` trong `assess.py`.
  - Mỗi lần chấm mất khoảng 4–8 giây (CPU i5-11400, câu ngắn tới dài); đổi `WHISPER_MODEL=base` trong `.env` để nhanh hơn nhưng kém chính xác hơn.
- **Hạn chế cần biết:** chưa kiểm chứng với giọng người thật, nên điểm chỉ mang tính tham khảo. Thanh điệu nhẹ bị bỏ qua. Cắt cụt cuối câu đôi khi vẫn được nhận dạng tự điền. Lần đầu cần mạng để tải mô hình (khoảng 460 MB) và tạo giọng mẫu cho câu mới.
- **Kiểm thử:** 20 bài kiểm tra logic (`backend/tests`, chạy `docker compose exec backend python -m unittest discover -s tests -v`), 20 kiểm tra e2e trên Edge với micro giả (đọc đúng được 98 điểm, đọc câu khác được 33 điểm, lưu DB, đồ thị), và chạy lại 34 + 28 kiểm tra của các giai đoạn trước.

### Giai đoạn 6 – Tiến độ và hoàn thiện
- Bảng tổng quan: bài đã học, điểm, lỗi hay gặp, ngày học liên tiếp.
- Script sao lưu DB, README hướng dẫn chạy và cập nhật nội dung, tinh chỉnh giao diện.

### Giai đoạn 7 – Nạp nội dung 38 bài còn lại
- Làm theo từng đợt khoảng 5 bài. Mỗi bài: từ vựng, ngữ pháp, hội thoại, bài tập, quiz, bài kiểm tra, đoạn đọc, bài nghe, câu luyện nói.
- Mỗi đợt kiểm tra tự động (validate schema, pinyin khớp hanzi) rồi người dùng xem lại.

## 5. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Bộ chấm tự xây chưa kiểm chứng với giọng người thật | Hiện kết quả như gợi ý tham khảo; khi có bản ghi thật (lưu ở `audio/recordings`) thì chỉnh ngưỡng |
| Nội dung AI soạn có thể sai | Validate tự động, người dùng duyệt từng đợt |
| Nhập chữ Hán cho bài dịch/nghe viết | Cần bộ gõ Pinyin trên Windows; có thể thêm ô gợi ý pinyin |
| edge-tts cần internet khi tạo audio | Chỉ tạo một lần, lưu file local |
| Tên bài/từ vựng sai lệch với sách | Cần người dùng cung cấp mục lục (xem mục 6) |

## 6. Cần người dùng cung cấp

1. ~~Mục lục 40 bài~~: Claude đã tự lập từ nguồn công khai (xong). Nếu có sách giấy, nên đối chiếu tên bài và từ vựng từng bài.
2. ~~Azure Speech key~~: không cần nữa, chấm phát âm tự xây.
3. Xác nhận bộ gõ Pinyin trên Windows của người dùng cuối.
4. Vài bản ghi giọng thật của người học (qua trang Luyện nói) để kiểm tra và chỉnh bộ chấm.
