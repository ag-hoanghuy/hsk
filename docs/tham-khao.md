# Phần A: Thu thập tham khảo (báo cáo ngắn)

Ngày lập: 06–07/11/2026. Chi tiết đầy đủ, có link từng nguồn:

- `docs/research/pedagogy.md`: mục lục giáo trình, đề thi mới, lỗi của người Việt, nhịp học, tài nguyên cộng đồng.
- `content/reference/README.md`: danh sách từ và ngữ pháp, nguồn, giấy phép, kết quả đối chiếu.

Quy tắc đã tuân thủ:
- Không chép nguyên văn sách, đề hay bài tập có bản quyền. Chỉ lấy danh sách từ, danh sách ngữ pháp, tên bài và cấu trúc đề.
- Mọi nội dung trong bài học đều do AI tự viết.

## 1. Kết quả chính

### Đề cương và danh sách từ vựng

Chọn **đề cương thi HSK mới 2025** (《HSK考试大纲》, CTI, công bố 11/2025). Đây là đề cương dùng cho kỳ thi HSK 3.0 chính thức từ **13/12/2026**.
- Số từ mới: cấp 1 có 300, cấp 2 có 200, cấp 3 có 500, cấp 4 có 1000. Cộng dồn tới cấp 4 là 2000 từ.
- Dữ liệu lấy thẳng từ PDF chính thức trên chinesetest.cn và đối chiếu với các bản chép của cộng đồng: cấp 3 khớp hoàn toàn, cấp 4 chỉ khác một cách viết.
- Chuẩn GF 0025-2021 lớn hơn nhiều (cấp 3 cộng dồn 2245 từ, cấp 4 cộng dồn 3245 từ) và không phải danh sách dùng trong đề thi. Dữ liệu chuẩn này vẫn được giữ lại để đối chiếu.
- Ngữ pháp cấp 1–4 của đề cương 2025 có 70 / 78 / 96 / 95 dòng, đã kiểm bằng mắt với PDF. Đề cương không đánh mã chính thức và không có câu ví dụ.

### Mục lục Standard Course HSK 3 và 4

Cả 40 tên bài và điểm ngữ pháp trong `content/curriculum.json` khớp với đa số nguồn công khai, gồm:
- AllSet Grammar Wiki;
- đề cương các Viện Khổng Tử Sydney, NCL và Adelaide;
- BHASVIC;
- PREP.

Không có chỗ nào phải sửa. Các khác biệt nhỏ đều do nguồn khác gõ sai, xem pedagogy.md mục 1.3.

### Từ vựng từng bài

Không có danh sách từ chính thức theo từng bài sách nào khớp với đề cương 2025. Vì vậy từ vựng mỗi bài là **"do AI chọn"**:
- Các từ cấp 3 và cấp 4 của đề cương được chia theo chủ đề và ngữ pháp của từng bài Standard Course. File phân bổ: `content/plan/allocation.json`.
- Các bài HSK3 dạy thêm 215 từ cấp 1–2 mà người học chưa biết, tức các từ không có trong HSK 1–2 cũ.

### Giáo trình mới

《新HSK教程》 (FLTRP, 11/2025) theo đúng đề cương 2025, cuốn cấp 3 có 18 bài. Hiện chưa có mục lục công khai, nên dự án giữ khung 40 bài của Standard Course.

### Đề thi mới

Cấu trúc đề:
- Cấp 3: 70 câu trong khoảng 83 phút, gồm nghe 30, đọc 30 và viết 10, trong đó có câu viết chữ Hán theo pinyin.
- Cấp 4: 70 câu trong khoảng 85 phút, phần viết có một bài tối thiểu 80 chữ.
- Từ cấp 3 trở lên có thi nói. Thi nói đã bắt buộc trong các kỳ thi thử, chưa có văn bản xác nhận cho kỳ thi chính thức.
- Điểm đậu chưa công bố.

### Lỗi đặc trưng của người Việt

Rút từ các nghiên cứu trong nước (ĐH Công nghiệp HN, HCMUE, ĐH Đà Nẵng, TNU):
- **Phát âm:** thanh 4 đọc không đủ dốc xuống; thanh 3 đọc như dấu hỏi; quên biến điệu 3-3; lẫn âm bật hơi và không bật hơi; lẫn z/c/s với zh/ch/sh; đọc ü thành "uy"; đọc ing thành "inh".
- **Ngữ pháp:**
  - đặt trạng ngữ sau động từ;
  - đặt định ngữ sau danh từ;
  - thừa 在, thiếu 着;
  - nhầm 的, 得 và 地;
  - dùng 了 như dấu hiệu của quá khứ;
  - câu 把 có động từ đứng một mình;
  - dùng 被 cho nghĩa "được";
  - thiếu bổ ngữ kết quả;
  - lẫn 二/两, 还是/或者, 再/又, 能/会/可以;
  - thêm 很 vào câu so sánh với 比.
- **Từ Hán Việt dễ hiểu nhầm:** 答应, 专门, 平静, 帮忙 + tân ngữ.

Các lỗi này được dùng trong phần "Lỗi người Việt hay gặp" của mỗi điểm ngữ pháp, ghi chú thanh điệu ở phần luyện nói, và phần ôn nhanh.

### Nhịp học

Các nguồn đề xuất từ 1 bài mỗi tuần (khoảng 5–6 giờ) tới 1 bài trong 2 tuần, mỗi ngày 4–15 từ mới, ôn giãn cách và thi thử cuối mỗi cấp. Trang **Lộ trình** của web dùng nhịp:
- 1 bài trong 3–5 ngày;
- ôn sau mỗi 4 bài;
- ôn giãn cách sau 1 – 3 – 7 – 14 – 30 ngày;
- thi thử sau bài 20 và bài 40.

## 2. Nguồn đáng tin nhất

1. PDF đề cương HSK 2025 chính thức của CTI: [新版HSK考试大纲](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf). Dùng cho từ vựng, ngữ pháp và số chữ.
2. Thông báo của Bộ Giáo dục Trung Quốc, CLEC/CTI, chisa và chinanews. Dùng cho mốc thời gian thi.
3. Đề mẫu chính thức của CLEC. Dùng cho cấu trúc đề cấp 3 và phần nói cấp 4.
4. AllSet Chinese Grammar Wiki và đề cương các Viện Khổng Tử. Dùng cho mục lục và ngữ pháp Standard Course.
5. Các tạp chí khoa học Việt Nam có phản biện. Dùng cho lỗi của người Việt.

## 3. Điểm còn mâu thuẫn giữa các nguồn

- Ngày đề cương 2025 có hiệu lực: Wikipedia ghi 18/11/2025, còn bìa PDF ghi "2026-07 实施". Dù vậy, kỳ thi chính thức đầu tiên đã định là 13/12/2026.
- Số điểm ngữ pháp cấp 3 và 4: 237/331 hay 244/339 tuỳ nguồn.
- Thi nói có bắt buộc trong kỳ thi chính thức hay không, và điểm đậu bao nhiêu: chưa công bố.
- Dạng câu hỏi từng phần nghe và đọc cấp 4: chưa có nguồn chính thức.
- Một luận văn tự mâu thuẫn về lỗi thanh 1 và thanh 2 (chi tiết ở pedagogy.md mục 8).

## 4. Câu hỏi cần xác nhận (và cách đã làm)

| Câu hỏi | Đã làm theo |
|---|---|
| Theo chuẩn từ vựng nào? | Đề cương thi 2025 (người dùng chọn ngày 07/11/2026) |
| Chia bài và số từ mỗi bài thế nào? | 40 bài, mỗi bài có từ chính và từ mở rộng (người dùng chọn). HSK3 khoảng 35 từ mỗi bài, HSK4 khoảng 50. |
| Người học đã biết tới đâu? | Khoảng HSK 1–2 cũ (người dùng chọn). 215 từ cấp 1–2 còn thiếu được dạy trong các bài HSK3. |
| Có cần luyện viết tay chữ Hán (đề mới yêu cầu 250 chữ ở cấp 3, 400 chữ ở cấp 4) không? | Chưa làm. Web có gõ chữ Hán bằng bộ gõ Pinyin nhưng chưa có luyện viết theo nét. Ghi trong `can-xem-lai.md`. |
| Người học nói giọng miền nào? | Chưa biết. Ghi chú phát âm nêu cả lỗi n/l (miền Bắc) lẫn lỗi âm bật hơi (miền Nam). |
| Có định thi thật không, khi nào? | Chưa biết. Lộ trình và thi thử theo cấu trúc chung. |
