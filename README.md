# Học tiếng Trung HSK3–HSK4

Web tự học tiếng Trung chạy trên máy tính cá nhân: 40 bài (HSK 3 và HSK 4 theo chủ đề giáo trình Standard Course,
từ vựng theo đề cương thi HSK mới 2025), luyện nghe, đọc, nói (chấm phát âm offline), quiz, bài kiểm tra, thi thử, theo dõi tiến
độ và nhắc ôn theo giãn cách. Kế hoạch và trạng thái: `PLAN.md`.

## Dùng hằng ngày

1. Mở **Docker Desktop** (chờ biểu tượng cá voi đứng yên).
2. Bấm đúp **`start-web.bat`**: web tự khởi động, sao lưu dữ liệu mỗi ngày một lần rồi mở trình duyệt ở http://localhost:5173.
3. Học xong có thể bấm **`stop-web.bat`** (dữ liệu vẫn giữ nguyên).

Tạo lối tắt ngoài màn hình: `powershell -ExecutionPolicy Bypass -File scripts\create-shortcut.ps1`.

Trang chính:
- **Bài học**: từ vựng (từ chính, từ mở rộng, từ cần biết thêm), ngữ pháp (kèm lỗi người Việt hay gặp), hội thoại,
  bài tập, quiz kiểu Quizizz, bài kiểm tra 8 dạng, ôn nhanh.
- **Luyện nói / Luyện đọc / Luyện nghe**: theo từng bài.
- **Tiến độ**: chuỗi ngày học, bài cần ôn hôm nay (1–3–7–14–30 ngày sau bài kiểm tra), điểm từng bài, lỗi hay sai.
- **Lộ trình**: bảng 40 bài, nhịp học gợi ý, thi thử cuối mỗi cấp.

## Chạy cho người phát triển

```
docker compose up --build
```

- Web: http://localhost:5173 · API docs: http://localhost:8000/docs
- Postgres: `localhost:5441` (user `hsk`, password `hsk_dev`, db `hsk`)

Dừng: `docker compose down` (giữ dữ liệu). Xoá luôn dữ liệu: `docker compose down -v`.

## Sao lưu và khôi phục

- `start-web.bat` tự sao lưu mỗi ngày vào `backups\hsk-<ngày-giờ>.dump` (giữ 30 bản).
- Sao lưu ngay: `powershell -ExecutionPolicy Bypass -File scripts\backup.ps1`
- Khôi phục: `powershell -ExecutionPolicy Bypass -File scripts\restore.ps1 backups\hsk-....dump` (tự sao lưu bản hiện tại trước).

## Cơ sở dữ liệu

Schema do Alembic quản lý (`backend/migrations`), tự nâng cấp khi backend khởi động. Khi đổi `app/models.py`,
tạo migration mới: `docker compose exec backend alembic revision --autogenerate -m "mô tả"`.

## Luyện nói (chấm phát âm offline)

Trang **Luyện nói** ghi âm bằng micro rồi chấm ngay trong backend, không cần tài khoản hay key nào.

- Lần đầu khởi động backend sẽ tải mô hình nhận dạng giọng nói Whisper (khoảng 460 MB) vào thư mục `models/`; trang sẽ báo "đang tải" cho tới khi xong. Các lần sau không cần tải lại.
- Giọng mẫu của câu mới được tạo bằng edge-tts nên cần mạng lần đầu cho mỗi câu.
- Mỗi lần chấm mất khoảng 4–8 giây. Muốn nhanh hơn, đặt `WHISPER_MODEL=base` trong `.env` (kém chính xác hơn) rồi `docker compose up -d backend`.
- Trình duyệt phải mở bằng `http://localhost:5173` (không phải địa chỉ IP) thì mới cho dùng micro; lần đầu bấm "Cho phép".
- Bản ghi âm lưu ở `audio/recordings/`; có thể dùng để chỉnh bộ chấm (ngưỡng ở đầu file `backend/app/speech/assess.py`).

Điểm chỉ mang tính tham khảo: bộ chấm mới được kiểm tra trên giọng máy, chưa có giọng người thật.

## Nội dung bài học

- Mỗi bài là một file `content/hsk3|hsk4/lesson-NN.json`. Đặc tả cấu trúc và quy tắc soạn: `content/_example/README.md`.
- Mục lục, chủ đề, ngữ pháp từng bài: `content/curriculum.json`. Phân bổ từ vựng cho từng bài: `content/plan/allocation.json`.
- Danh sách từ/ngữ pháp tham khảo (đề cương thi 2025 đang dùng; GF 0025-2021 và HSK 2.0 để đối chiếu) và nguồn: `content/reference/`.
- Backend tự nạp nội dung vào DB mỗi lần khởi động (`docker compose restart backend`).

Kiểm tra nội dung (cấu trúc, đáp án, pinyin khớp chữ Hán, cấp độ HSK, từ cần chú thích):

```
docker compose exec -T backend python /tools/validate_content.py              # tất cả
docker compose exec -T backend python /tools/validate_content.py hsk3/lesson-05.json   # chỉ báo lỗi một bài
```

`ERROR` phải sửa. `WARN` cần người xem lại. Bản đọc Markdown của tài liệu học (sinh từ JSON, đừng sửa tay):

```
docker compose exec -T backend python /tools/export_markdown.py   # → docs/bai-hoc/
```

Tài liệu khác trong `docs/`: lộ trình (`lo-trinh.md`), báo cáo tham khảo (`tham-khao.md`), những chỗ cần người biết tiếng Trung xem lại (`can-xem-lai.md`).

## Kiểm thử

- Logic backend: `docker compose exec backend python -m unittest discover -s tests -v`
- Kiểu dữ liệu frontend: `docker compose exec frontend npx tsc --noEmit`
- Trình duyệt (Edge, tự động): xem `e2e/README.md`.
