# Học tiếng Trung HSK3–HSK4

Web học tiếng Trung chạy local. Xem `PLAN.md` để biết kế hoạch.

## Chạy

```
docker compose up --build
```

- Web: http://localhost:5173
- API docs: http://localhost:8000/docs
- Postgres: `localhost:5441` (user `hsk`, password `hsk_dev`, db `hsk`)

Dừng: `docker compose down` (giữ dữ liệu). Xoá luôn dữ liệu: `docker compose down -v`.

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
- Chạy kiểm tra logic: `docker compose exec backend python -m unittest discover -s tests -v`.

Điểm chỉ mang tính tham khảo: bộ chấm mới được kiểm tra trên giọng máy, chưa có giọng người thật.

## Kiểm tra nội dung bài học

Công cụ `tools/validate_content.py` kiểm tra cấu trúc, đáp án và đối chiếu pinyin với chữ Hán (bằng `pypinyin`).
Không cần cài Python trên máy, chạy qua Docker (PowerShell, trong thư mục dự án):

```
docker run --rm -v "${PWD}:/work" -w /work python:3.12-slim sh -c "pip install -q pypinyin && python tools/validate_content.py"
```

`ERROR` phải sửa. `WARN` cần người xem lại (thường là chữ đa âm như 得 děi / 场 chǎng, hoặc tone không khớp từ điển).

## Thêm nội dung bài học

Đặt file `content/hsk3/lesson-01.json` (hoặc `hsk4/`) theo mẫu `content/_example/lesson.example.json`.
Backend tự nạp vào DB mỗi lần khởi động (`docker compose restart backend`).
