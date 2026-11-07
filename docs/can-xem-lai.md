# Những chỗ cần người biết tiếng Trung xem lại

Nội dung 40 bài do AI soạn và đã qua kiểm tra tự động (cấu trúc, pinyin khớp chữ Hán, cấp độ từ theo đề cương 2025,
từ cần chú thích, mọi đáp án được chấp nhận qua bộ chấm của web). Kiểm tra tự động không bắt được câu thiếu tự nhiên
hay giải thích chưa chuẩn, nên dưới đây là các điểm mà người soạn tự thấy chưa chắc, theo từng bài.
Sửa trực tiếp trong `content/hsk*/lesson-NN.json`, chạy lại công cụ kiểm tra (xem README) rồi
`POST /api/admin/reload-content` (hoặc khởi động lại backend).

Điểm chung cần biết:
- Pinyin của 一/不 ghi theo biến điệu thực tế; biến điệu thanh 3 không ghi (nhắc trong phần luyện nói).
- Một số câu được viết lại để tránh từ chưa học; vài từ được đưa vào phần "Từ cần biết thêm" thay vì dạy chính thức.
- Bộ chấm phát âm chỉ được kiểm chứng trên giọng máy (xem PLAN.md mục 5).
- Web chưa có phần nghe hiểu theo tranh và viết đoạn văn theo đề thi mới; phần viết chữ chỉ luyện từng chữ.

## HSK 3 · Bài 2: 他什么时候回来 – Khi nào anh ấy quay lại?

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết. File cũ (định dạng cũ) đã được thay hoàn toàn.

### Cần người biết tiếng Trung xem lại

- **Pinyin của 来/去 làm bổ ngữ**: mình viết theo bảng từ HSK (huílái, huíqù, chūqù, jìnlái, shànglái, xiàqù…) cả trong câu, và ghi trong mẹo phát âm rằng khi nói nhanh 来/去 thường đọc nhẹ (huílai). Nếu muốn theo 现代汉语词典 (jìn//lái, đọc nhẹ khi làm bổ ngữ) thì cần sửa đồng loạt.
- **Câu cuối hội thoại**: giám đốc ở trong phòng nói “你进来吧”, Tiểu Lâm đáp “好的，经理，我马上进去！” (đứng ở chỗ mình nên dùng 去) để minh họa 来/去. Người bản ngữ có thể nói “我马上来/过来” hơn — mời xem độ tự nhiên.
- **Câu tu từ 能……吗**: “路上车太多了，我能马上到吗？” và “经理正在开会，能接电话吗？” — kiểm tra xem có nghe tự nhiên như câu phản vấn không. Bài e12 chỉ chấp nhận “我能不回去吗”; “我不能回去吗” cũng đúng ngữ pháp nhưng nghĩa khác (câu hỏi thật), đã giải thích trong ngữ pháp.
- **Bài đọc**: “奶奶接了电话，就下楼来接我” — dùng 接 hai nghĩa (nghe máy, đón) trong một câu là cố ý; người kể ở dưới lầu nên dùng 下楼来. Mời xem có gượng không.
- **Từ của bài sau phải tránh**: 带, 拿, 先, 然后, 才, 刚/刚才, 同事, 一定 chưa học. Vì vậy viết “九点以后回家” (không có 才), “我给他打个电话问问”, “那我下去买杯咖啡，一会儿再上来”.
- **喂** viết wèi theo từ điển (khi nghe điện thoại người ta hay đọc wéi).
- **Glossary**: 路上 (base), 打 (base — vì 打个电话 / 打了电话 bị tách khỏi 打电话).
- **Bộ tách từ**: ví dụ của 下来 lúc đầu là “奶奶从楼上下来了”, validator cắt thành 上下 nên đổi thành “你等一下，奶奶马上就下来。”
- 正 (x8), 后/前 (x6, x7) chỉ xuất hiện trong ví dụ từ vựng, chưa có trong hội thoại.
- Đề q3 có “下了班” (班 là từ base chưa học, nhưng đề bài không được validator kiểm tra; 下班 thì đã biết).

## HSK 3 · Bài 3: 桌子上放着很多饮料 – Trên bàn đặt rất nhiều đồ uống

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **Câu sai trong bài tập câu tồn tại**: “桌子上有放一个蛋糕” (có người miền Nam / Đài Loan nói được) và “在桌子上放着一个蛋糕” (người bản ngữ đôi khi vẫn nói) được dạy là sai theo chuẩn phổ thông. “有放” là phương án sai trong e7 và q4; còn “在……放着” chỉ nằm trong mistakes_vi (ghi “nên bỏ 在”). Mời xác nhận cách trình bày này.
- **还是 / 或者**: theo pedagogy.md, “星期六还是星期天都可以” được coi là sai (đúng là 或者). Khẩu ngữ đôi khi vẫn chấp nhận “还是……都行”, nên mình KHÔNG dùng kiểu câu này làm phương án sai trong câu hỏi trắc nghiệm, chỉ để trong mistakes_vi.
- **会 vs 能**: “明天能下雨吗” bị coi là sai (dự đoán phải dùng 会). q5 có phương án “不能下雨”.
- **Câu đã đổi vì pypinyin / bộ tách từ**:
  - “喝几瓶啤酒吧” → pypinyin đọc 酒吧 jiǔbā, nên đổi thành “喝几瓶啤酒，怎么样？”.
  - “大家都会来参加吗” → bị tách thành 都会 (dūhuì), đổi thành “今天晚上会有多少人来参加？”.
  - “我还给大家准备了礼物” → bị đọc 还给 huángěi, đổi thành “我给每个人都准备了一个礼物”.
  - “就是奶茶”, “新手机” (bị tách 新手) cũng đã viết lại.
- **跳了舞** bị tách thành 跳 + 舞 (từ của bài sau), nên viết “王经理给大家唱歌，小张和小林一块儿跳舞”.
- **开晚会**: “给妈妈开一个小晚会” — 办 có lẽ tự nhiên hơn nhưng chưa học. Mời xem.
- **冰**: “晚上咱们喝冰的”, “加点儿冰吧” — kiểm tra độ tự nhiên.
- **上面** viết shàngmiàn (từ điển có thể ghi shàngmian).
- q6: question_zh “哪个“会”是“sẽ”的意思？” có chen chữ Việt để học viên hiểu; có thể thay bằng câu tiếng Trung thuần nếu muốn.
- Từ ít xuất hiện tự nhiên: 过年, 过节 chỉ có trong ví dụ từ vựng; 瓶子 chỉ trong ví dụ; 张 có trong bài đọc (两张大桌子).
- Glossary: 自己 (base).

## HSK 3 · Bài 4: 她总是笑着跟客人说话 – Cô ấy luôn cười khi nói chuyện với khách

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết. Bài chỉ có 2 điểm ngữ pháp, đúng theo curriculum.json.

### Cần người biết tiếng Trung xem lại

- **Từ chưa học nằm ngay trong tên bài**: 跟 (từ base, phân cho bài 9) có trong glossary (kind "base"); 又 (phân cho bài 8) có trong glossary (kind "beyond") vì cấu trúc 又……又…… cần nó; 站 (base) dùng cho 站着.
- **Pinyin**: 客人 viết kèrén theo bảng từ HSK (từ điển có thể ghi kèren); 聪明 viết cōngming (đọc nhẹ); 别人 viết biérén. readings_ok xác nhận: 得 de (说得很好), 地 de (认真地), 边 bian (左边 zuǒbian), 里 li.
- **Quy tắc 又……又……**: dạy là “hai ý cùng chiều” và “thường không thêm 很”. “这个菜又便宜又不好吃” bị coi là sai (nên dùng 但是). Đây là cách đơn giản hóa cho người học; mời xác nhận.
- **Thứ tự trong V1着V2**: e10 chấp nhận cả “她笑着跟客人说话” và “她跟客人笑着说话”. Kiểm tra xem câu thứ hai có tự nhiên không.
- **位**: phục vụ hỏi “请问几位？”, khách đáp “两位。” Ghi chú từ vựng nói đáp 两位 hay 两个人 đều được, nhưng không dùng 位 khi tự giới thiệu (✗ 我是一位老师).
- **Gọi món**: “我们要这个鱼和这个羊肉，再来两杯奶茶。” — trong quán người ta hay nói 这个鱼 (chỉ vào thực đơn); 条 chưa học. Mời xem.
- **Ví dụ của 员 (x17)**: “服务员的“员”，意思是做这个工作的人。” — hơi giống lời giải thích; tránh “就是” vì validator tách thành một từ chưa học, và tránh 运动员 (từ bài 20).
- **Nghĩa tiếng Việt của 认真**: dịch linh hoạt là “chăm chỉ / nghiêm túc / cẩn thận / chu đáo” tùy ngữ cảnh; ghi chú của 热情 phân biệt với 认真.
- **Đã đổi vì bộ tách từ**: “服务也好” bị tách thành 也好, đổi thành “服务也很好”. Tránh 穿着 (validator coi là một từ cấp 7).
- **Từ ít tự nhiên**: 总 (x7) và 男孩儿 (x12) chỉ xuất hiện trong ví dụ từ vựng; 几乎, 但, 不但……而且 có trong bài đọc.

## HSK 3 · Bài 5: 我最近越来越胖了 – Dạo này tôi càng ngày càng béo

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết. `readings_ok`: 得 de (trợ từ kết cấu trong 跑得很快, 打得很好, 睡得很好).

### Cần người biết tiếng Trung xem lại

- **Câu được dạy là sai** (mistakes_vi, quiz, review):
  - “昨天我很忙了” → sai (không có thay đổi thì không dùng 了). Đây là quy tắc trong sách dạy; mời xác nhận.
  - “我没喝啤酒了” (với nghĩa “không uống bia nữa”) → sai. Lưu ý: “我好久没喝啤酒了” vẫn đúng, nhưng là ngữ pháp bài 7 nên không nhắc.
  - “我已经六十公斤” → nên có 了. Không hẳn sai trong mọi ngữ cảnh; mình ghi là “thường phải có 了”.
  - “他越来越跑快了” → sai, đúng là 他跑得越来越快了.
- **q2**: coi “他不喝啤酒” là KHÔNG đúng nghĩa “anh ấy không uống bia nữa” (thiếu 了). Mời xác nhận.
- **e1 / q6**: đã bỏ các đáp án nhiễu có thể đúng (越来越饿了, 有点儿喜欢……了) để mỗi câu chỉ còn một đáp án đúng.
- **Độ tự nhiên của hội thoại**: “饭要吃饱，还要经常锻炼” (dòng 5); “一年就胖了八公斤” (dòng 4); “只想在家看电视、吃东西” (dòng 6, mình dịch là “ăn vặt”).
- **越来越** viết pinyin tách rời: yuè lái yuè.
- **t14** có nhận đáp án 我最近变胖了 (变 thuộc bài 19), vì người học có thể tự viết như vậy.

### Từ được phân bổ nhưng khó dùng tự nhiên

- 越: chỉ dạy trong khối 越来越 (越A越B để bài 9).
- 跑, 打: hầu như chỉ xuất hiện trong 跑步, 打篮球 (từ đã biết). 跑 đứng riêng chỉ có trong ví dụ 跑得很快.
- 游, 球, 自己, 早, 有时, 面条儿: chỉ có trong ví dụ từ vựng, ghép nối từ (match) hoặc một câu bài nghe.
- 斤 / 公斤: hội thoại nói “瘦了十斤”, phần dịch giải thích là 5 kg. Bài đọc có câu đúng/sai kiểm tra phép đổi 10 斤 = 5 公斤.

### Từ của bài sau đã tránh

Đã tránh 以前, 习惯, 应该, 只有 (bị tách thành một từ trong 只有五十公斤), 先, 跟 và 发现.

## HSK 3 · Bài 6: 怎么突然找不到了 – Sao đột nhiên không tìm thấy nữa

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

`readings_ok`:
- 得 de: bổ ngữ khả năng 听得见.
- 谁 shéi: khẩu ngữ; pypinyin mặc định là shuí.
- 啊 à: thán từ khi chợt nhận ra, “À, ở đằng kia”, ở hội thoại dòng 7.
- 里 li: 房间里.

### Cần người biết tiếng Trung xem lại

- **Pinyin của 不 trong bổ ngữ khả năng** viết thanh nhẹ: zhǎo bu dào, tīng bu dǒng, kàn bu qīngchu, tīng bu tài qīngchu, tīng bu jiàn. Câu hỏi chính phản cũng vậy: shì bu shì, zài bu zài. Mời xác nhận đúng quy ước của dự án.
- **不见** trong mục từ viết bújiàn, trong câu viết bú jiàn le.
- **刚 + 了**: phần giải thích ghi “câu có 刚 thường không thêm 了 ở cuối”. Đây là hướng dẫn, không phải lỗi tuyệt đối, nên mình không đưa vào câu hỏi. Trong bài cũng không có câu nào dùng 刚……了.
- **Câu đã sửa vì pypinyin / bộ tách từ**:
  - “你再说一下” bị tách thành 再说 (cấp 4), đổi thành “请你说慢一点儿”.
  - “是谁打的” bị pypinyin đọc 打的 dǎdī, đổi thành “是谁打来的”.
  - 慢慢儿 (mànmānr) đổi thành 慢慢 (mànmàn) để tránh tranh cãi về thanh điệu.
- **Độ tự nhiên**:
  - Hội thoại dòng 9 “刚才我到处找，都急坏了”: có lẽ “我都快急坏了” tự nhiên hơn?
  - Dòng 6: gọi vào điện thoại của bạn ngay trong thư viện.
  - Bài đọc: “笔记本里面有我上课写的东西”. 笔记 tự nhiên hơn nhưng thuộc bài 9.
- **e7**: phương án 我不能找手机 được giải thích là “không được phép tìm”.
- **笔记本**: mục từ dạy cả hai nghĩa (sổ / laptop), trong bài chỉ dùng nghĩa “sổ”.

### Từ được phân bổ nhưng khó dùng tự nhiên

- 面: dạy qua câu ví dụ “上面、下面、里面都有一个‘面’字”, giống cách bài 1 dạy 园.
- 动, 借, 号码, 本子: chỉ có trong ví dụ từ vựng và ghép nối từ.
- 坏 và 急 có thêm cụm 急坏了 trong hội thoại.

## HSK 3 · Bài 7: 我跟她都认识五年了 – Tôi và cô ấy quen nhau đã năm năm

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

`readings_ok`:
- 得 de
- 里 li: 哪里哪里 nǎli nǎli, 手机里.
- 片 piàn: 照片 zhàopiàn theo 现代汉语词典; pypinyin cho piān.

Glossary (beyond):
- 首: lượng từ cho bài hát.
- 聊: thuộc bài 17, dùng trong “聊了五个小时”, “聊一个多小时”.
- 上海: thêm vào để bộ tách từ không báo chữ 海.

### Cần người biết tiếng Trung xem lại

- **跟** thuộc bài 9 nên cả bài dùng 和, kể cả câu giống tiêu đề: 我和她都认识五年了. Tiêu đề trong curriculum vẫn có 跟.
- **Câu được dạy là sai**:
  - “我们没见面三年了” → đúng phải là 三年没见面了. Khẩu ngữ có người nói “没见面有三年了”; mời xác nhận cách trình bày. Câu này là đáp án sai ở e7 và có trong review.
  - “我不对足球感兴趣” → sai.
  - “我对音乐很兴趣” → sai.
  - q1: “他来北京三个月” (không có 了) bị coi là không đủ nghĩa “được ba tháng rồi”.
- **Nói giờ**: chấp nhận cả 差五分八点 lẫn 八点差五分. Ở e9 (8:45) đã bỏ phương án 八点三刻 để chỉ còn một đáp án đúng (差一刻九点).
- **t14** nhận cả 好久不见 khi dịch “Chúng ta lâu lắm rồi không gặp nhau”.
- **Hán Việt**: 爱好 ghi “ÁI HIẾU (好 như trong hiếu học)”. Mời xem có nên giữ không. 刻 ghi KHẮC kèm ghi chú “kém một khắc” = kém 15 phút.
- **Độ tự nhiên**:
  - 哪里哪里 (hội thoại dòng 6) có hơi cũ.
  - Bài đọc dùng “离开大学以后” thay cho 大学毕业以后, vì 毕业 là từ cấp 4.
  - Câu “我们不能经常见面” được viết lại: ban đầu là 很少见面, nhưng bộ tách từ nhận nhầm thành 少见.
- **Câu đã sửa vì bộ tách từ**:
  - 歌唱得 bị nhận thành 歌唱, đổi thành 唱歌特别好听.
  - 别说话 bị nhận thành 别说, đổi thành 不要说话.

### Từ được phân bổ nhưng khó dùng tự nhiên

- 时: chỉ có “上课时不要说话”.
- 段: chỉ có “这段时间”.
- 喜爱: văn viết, chỉ có trong ví dụ.
- 得分: chỉ có “还没得分”.
- 跳: chỉ trong 跳舞.
- 难听: chỉ có trong ví dụ.
- 天, 见, 遇见: có trong ví dụ, ghép nối từ và lời dẫn cảnh (scene_vi).

## HSK 3 · Bài 8: 你去哪儿我就去哪儿 – Bạn đi đâu tôi đi đó

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **Lỗi “你去哪儿，我就去那儿”** (g2.mistakes_vi): mình đánh dấu ✗ và giải thích rằng cấu trúc hô ứng lặp lại cùng một đại từ 哪儿. Nhờ kiểm tra xem người bản ngữ có chấp nhận cách nói có 那儿 ở vế sau không. Nếu có, nên nói nhẹ đi (“không đúng cấu trúc đang học”) thay vì coi là sai hẳn. Bài tập e9 cố ý không dùng 那儿 làm phương án nhiễu để tránh tranh cãi.
- **“明天又是星期一了”**: đưa vào làm ngoại lệ (việc lặp lại chắc chắn trong tương lai vẫn dùng 又). Mời xem cách giải thích có đủ rõ không.
- **再说一次 / 再说一遍**: bộ tách từ đọc 再说 thành từ cấp 4 (“vả lại”), nên mình không dùng cụm này trong các văn bản được kiểm tra. Cụm này chỉ có trong mistakes_vi, review và câu hỏi e2 của bài 9.
- **Độ tự nhiên của câu thoại**: “这件大小正合适！” (Tiểu Trần nhận xét khi bạn mặc thử), “大一点儿的卖完了”, “这种裤子黑色的都卖完了，白色的还有”, “今天我又花了不少钱”.
- **元/角 và 块/毛**: câu viết dùng 元/角, câu nói dùng 块/毛 (x14: 三块五毛). Ở bài nghe, người kể nói 一百九十九元. Thực tế khi nói người ta hay dùng 块; mình giữ 元 vì đây là từ chính của bài.
- **Từ khó dùng tự nhiên**: 种 chỉ có trong ví dụ x2 và bài nghe; 毛 chỉ có trong ví dụ x14.
- **Đọc âm đã xác nhận trong readings_ok**: 长 cháng (有点儿长), 了 le (做好了), 谁 shéi (từ điển pypinyin mặc định là shuí).

## HSK 3 · Bài 9: 她的汉语说得跟中国人一样好 – Tiếng Trung của cô ấy giỏi như người Trung Quốc

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **难/容易 thuộc bài 10** nên bài này không dùng “khó/dễ” khi nói về việc học tiếng. Mình thay bằng 写得不太好、水平一直不高、听不懂.
- **Glossary**: thêm 越南, 越南语, 英国, 英语 (kind "beyond"). Các từ này không có trong danh sách từ; nếu không có glossary, 越南 sẽ bị tách thành 越 + 南 (南 thuộc bài 13).
- **Câu đọc “可是越南语里也有很多词，意思跟汉语一样”**: ý là các từ Hán Việt. Nói “一样” hơi tuyệt đối (thực tế chỉ “gần giống”), nhưng 差不多 thuộc bài 10 nên chưa dùng được. Mời cân nhắc.
- **“我常用字典查汉字”**: bộ tách từ đọc 常用 thành một từ. Ở đây nghĩa thật là 常 + 用 (thường dùng tự điển), mình chú thích token là “thường dùng”. Nghĩa tính từ của 常用 có ở ví dụ x15 (常用的词).
- **Độ tự nhiên của câu thoại**: “越说越想说”, “我有个英国朋友，他正想找人练习汉语呢”, “来中国留学快一年了”. Tên 小阮 / 阮兰 (Ruǎn Lán) là tên người Việt họ Nguyễn.
- **Bài nghe**: lúc đầu mình viết “大卫就再说一遍”, nhưng 再说 bị tách thành từ cấp 4 nên đổi thành “大卫就说得慢一点儿，一句话说两遍”.
- **Câu thoại có “老师说的话”**: 的话 bị đọc thành từ “nếu” (bài 16), nên đổi thành “老师说的汉语我一句也听不懂”.
- **Đáp án dịch t13**: đã bỏ “王老师给我们教汉语” vì cách nói này không chuẩn lắm. Chỉ nhận 教我们汉语/中文.
- **Đọc âm đã xác nhận trong readings_ok**: 教 jiāo (động từ “dạy”, pypinyin mặc định jiào), 得 de (bổ ngữ trạng thái), 长 cháng (多长时间), 里 li (越南语里).

## HSK 3 · Bài 10: 数学比历史难多了 – Toán khó hơn lịch sử nhiều

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **难得多**: bộ tách từ đọc “难得多” thành 难得 (cấp 4) + 多. Vì vậy trong các văn bản được kiểm tra (ví dụ ngữ pháp, bài đọc), mình dùng 难多了 và 多得多/好得多. Cụm 难得多 chỉ có trong bài tập e10 và đáp án t14, và vẫn đúng.
- **Phạm vi “概数的表达1”**: mình gộp 多 (四十多个 / 两个多小时), 几 (十几 / 几十), hai số liền nhau (两三个、七八百个) và 大概. 左右 để dành cho bài 11. Mời xem cách chia này có khớp với bài 11 không.
- **“大概第十几名吧”** (câu thoại): ở đây 大概 nghĩa là “có lẽ” và đi cùng 几. Mời xem câu này có bị coi là thừa ước lượng không. Đáp án t13 có nhận 我们班有大概三十个学生 (khẩu ngữ) và 差不多有三十个学生.
- **Đáp án t14** có nhận 数学比历史难很多. Cách nói này dùng nhiều trong khẩu ngữ; nếu muốn chặt chẽ thì có thể bỏ.
- **Lỗi “比 + 有点儿”** (✗ 数学比历史有点儿难): mình dạy “hơn một chút” là tính từ + 一点儿. Mời xác nhận.
- **Độ tự nhiên**: “你的数学比我好多了” (bỏ 的 sau 我), “我考了我们班第三名”, “我的数学成绩比历史好一点儿” (so sánh điểm toán với “历史” mà không lặp lại 成绩).
- **班级 (x6)** khó dùng tự nhiên ở cấp này, nên chỉ có trong ví dụ “这是一个很好的班级” và bài nối từ.
- **Quy đổi khối lớp** (lời dịch và đáp án t9): 初中二年级 = lớp 8, 高中一年级 = lớp 10, 高中二年级 = lớp 11 theo hệ thống Việt Nam.
- **Đọc âm đã xác nhận trong readings_ok**: 得 de (考得、好得多), 教 jiāo, 里 li (校园里).

## HSK 3 · Bài 11: 别忘了把空调关了 – Đừng quên tắt điều hòa

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **左右 không thuộc bài này**: 左右 là từ HSK4 (bài 4-15), nhưng ngữ pháp bài 11 lại là “概数的表达2：左右”. Mình dạy 左 và 右 trong vocab, còn 左右 để trong glossary (kind "beyond") và giải thích ở mục ngữ pháp g2. Có thể cân nhắc chuyển 左右 sang allocation của bài 11.
- **带 chưa học** (thuộc bài 12) nên mình tránh “带伞”. Thay bằng “伞和雨衣我都准备好了”, “记得拿伞” (拿 để trong glossary là từ base). Mời kiểm tra xem “我会记得拿伞” có tự nhiên không (người bản ngữ hay nói 带伞 hơn).
- **以前 chưa học** (bài 19) nên dùng 出门前 / 睡觉前 thay cho 出门以前.
- **Ví dụ của 把 + 了**: dùng 把空调关了, 把灯关了, 把衣服洗了 (V + 了 làm kết quả). Một số giáo viên thích 关上/关掉 hơn; mình chấp nhận cả 关上, 关掉, 关一下 trong đáp án dịch t13.
- **Câu thoại**: “我帮你把衣服洗了吧” (quần áo đã nằm sẵn trong máy giặt) và “灯一直开到今天早上”. Mời xem lại độ tự nhiên.
- **关机 (x7)**: lúc đầu mình viết “请把手机关机”, nhưng bộ tách từ của validator cắt thành 把手 + 机关, nên đổi thành “上课的时候，请大家关机”.
- **Đọc âm**: 里 đọc nhẹ li, 边 đọc nhẹ bian (外边 wàibian, 右边 yòubian), đã ghi trong readings_ok. 忘了 viết tách “wàng le”.
- **Trùng từ với bài khác**: có lúc validator báo 忘 đã được dạy ở hsk3/lesson-02.json (bài của agent khác, dù 忘 được phân cho bài 11). Lần kiểm tra cuối không còn báo nữa. Mình vẫn giữ 忘 ở bài 11 đúng theo allocation.

## HSK 3 · Bài 12: 把重要的东西放在我这儿吧 – Để đồ quan trọng ở chỗ tôi nhé

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **才/就**: bài giải thích 就 = sớm/nhanh (thường có 了), 才 = muộn/chậm (không thêm 了), và 才 + số = “mới chỉ”. Mình đã tránh câu 就 + số tiền (这件衬衫就五十块) vì 就 ở đây cũng có thể hiểu là “chỉ”, dễ khiến câu hỏi có hai đáp án. Mời xem câu “走了……就到了” và “飞机十点才起飞，时间还早” có ổn không.
- **检票**: mình không dùng 检票 ở sân bay (ở sân bay người ta nói 安检/登机). Từ này chỉ xuất hiện ở rạp chiếu phim và cổng khu du lịch.
- **东北/东南/西北/西南**: khó dùng tự nhiên trong chủ đề này. Mình dùng mẫu “在……的东北边” và “刮西北风”. Lưu ý 东/南/西/北 đứng riêng là từ của bài 13, nên ở bài này không dùng 东边, 南边….
- **拍 chưa học** (HSK4), nên mình không viết “拍了很多照片” mà dùng 拍照 (“一直在海边拍照”).
- **Câu kết bài đọc**: “最重要的不是相机，是好朋友” là cách nói khẩu ngữ (văn viết chuẩn hơn sẽ là 而是). Mời xem lại.
- **“把它给我了”**: ở đây 给 là động từ chính (把 + O + 给 + người), chưa phải mẫu V + 给. Mẫu V + 给 được minh họa bằng 送给.
- **酒店里有牙刷，不需要带**: chi tiết văn hóa (nay một số nơi không còn phát đồ dùng một lần); có thể đổi nếu thấy không hợp.
- **Đọc âm**: 里 đọc nhẹ li (readings_ok); 相机 xiàngjī, 行李 xíngli, 银行 yínháng là các chữ đa âm, đã kiểm tra theo ngữ cảnh.

## HSK 3 · Bài 13: 我是走回来的 – Tôi đi bộ về

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **Bổ ngữ xu hướng kép**: 过来 thuộc bài 14, còn 出来 và 起来 thuộc bài 19, nên bài này chỉ dùng 回来/回去, 上来/上去, 进来/进去, 下来/下去, 出去, 过去 (走过去, 开过去). Mời kiểm tra cách chọn 来/去 theo vị trí người nói trong e6, q1 (đã ghi rõ ngữ cảnh trong prompt_vi) và câu “我进房间去换一下衣服”.
- **过去 (v13)**: mình ghi pinyin guòqu (nhẹ) cho nghĩa động từ “đi sang”, còn danh sách từ ghi guòqù. Note_vi có nói khi là danh từ “quá khứ” thì thường đọc guòqù.
- **一边 với tính từ**: bài có dạy thêm 又……又…… để tránh lỗi kiểu “vừa nhanh vừa tiện → ✗ 一边快一边方便”. Phần này không có trong curriculum, mình thêm vào vì người Việt rất hay sai chỗ này.
- **不安全**: bộ tách từ của validator cắt “不安全” thành 不安 + 全, nên trong văn bản mình viết “要注意安全” hoặc “不太安全”. Câu “下雨天开车不安全” chỉ còn ở phần dịch (t15) và câu hỏi e4; chỗ đó validator không tách từ.
- **Câu trả lời thêm cho bài sắp xếp e11**: có chấp nhận “是我走回来的” (nhấn mạnh chủ ngữ). Mời xác nhận đáp án này có hợp lý không.
- **Nghe (lp1)**: tin nhắn thoại chỉ đường dùng “高铁晚点了你就给我打电话” (câu điều kiện không có 如果, vì 如果/的话 thuộc bài 16).
- **Đọc âm**: 边 đọc nhẹ bian (东边, 南边, 西边, 北边), 里 đọc nhẹ li, đã ghi trong readings_ok. 第一个 viết dì yī ge (số thứ tự, 一 không biến điệu).

## HSK 3 · Bài 14: 你把水果拿过来 – Bạn mang hoa quả qua đây

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết. Không cần glossary.

### Cần người biết tiếng Trung xem lại

- **“先……，再……” với việc đã xảy ra**: theo bài 8 (又/再), bài này dạy việc đã xảy ra dùng 先……了，又……了 hoặc 然后, và ghi ✗ cho “昨天我先去了银行，再去了超市”. Câu hỏi q5 (昨天我们先去了公园，____去了动物园) lấy 又 làm đáp án, 再 là phương án nhiễu. Khẩu ngữ đôi khi vẫn nghe “先……再……” khi kể chuyện đã qua, nên mời xác nhận cách dạy này có quá cứng không.
- **Bổ ngữ xu hướng**: 出来 và 起来 thuộc bài 19, nên câu 把 trong bài chỉ dùng 拿过来, 拿走, 放进……里, 搬进房间去, 放回去. Mời xem e5 (放____冰箱里 → 进) và q1 (拿____来 → 过) có đúng một đáp án hay không.
- **Bài nghe**: câu “把碗和筷子洗干净，然后放回去” có tự nhiên không (ý là cất lại chỗ cũ).
- **Pinyin**: 过来 ghi guòlai (来 đọc nhẹ), giống cách bài 13 ghi 过去 guòqu; danh sách từ ghi guòlái. 小朋友 ghi xiǎopéngyǒu theo từ điển, trong khi 朋友 đứng một mình vẫn ghi péngyou. 干净 ghi gānjìng.
- **readings_ok**: 里 li, 只 zhī (五只鸡), 得 de (做饭做得很好吃), 脏 zāng (bẩn, không phải zàng).
- **Từ phân bổ khó dùng**: 子 (hậu tố) ghi pos “trợ từ” vì danh sách pos không có “hậu tố”; câu ví dụ theo kiểu chữ 园 ở bài 1. 香蕉 tránh lượng từ (không dùng 一个香蕉 trong câu kể, vì 根 chuẩn hơn), riêng lời thoại có “给小朋友吃一个” là khẩu ngữ, mời xem có ổn không.
- **手** thuộc bài 15, nên bài này không dùng 洗手.

## HSK 3 · Bài 15: 其他都没什么问题 – Những cái khác đều không có vấn đề gì

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết. Không cần glossary.

### Cần người biết tiếng Trung xem lại

- **“疑问代词活用2”**: mình hiểu điểm này là cách dùng phiếm chỉ (“gì đó, đâu đó, ai đó”): 没什么问题, 吃点儿什么, 你想喝点儿什么吗, 周末你去哪儿玩儿了吗, 有谁来找过我吗. Cách dùng “谁都……/什么都……” (nhậm chỉ) để lại cho bài 17. Mời xác nhận đúng phạm vi giáo trình.
- **除了……以外，也……**: phần giải thích viết cùng chủ ngữ thì thường dùng 还, khác chủ ngữ thì thường dùng 也 (除了我以外，小王也感冒了). Câu e5 có ngữ cảnh “小王病了，没去” để chỉ 都 đúng. Mời xem 也 có bị loại quá tay không.
- **极了**: bài dạy “sau 极了 không có tân ngữ” (✗ 我喜欢极了这个公园 → ✓ 这个公园我喜欢极了). Mời xác nhận.
- **Lời thoại**: “这下我就放心了”, “身高是一米六五，五十公斤” và “你什么时候会头疼？” có tự nhiên không. Mình bỏ 一般 vì từ này thuộc bài 16.
- **Từ của bài sau**: 以前 (bài 19), 的话 và 一般 (bài 16) bị validator báo, nên đã viết lại: 吃饭前要洗手, 检查前……, câu ví dụ 脸 đổi thành “他喝了一点儿啤酒，脸就红了”. 好像 (bài 19), 老人 (bài 20), 应该 (bài 17) cũng được tránh.
- **出生年月** (bài nghe) là cách ghi trên tờ khai; mời xem nghe có tự nhiên không.
- **readings_ok**: 里 li, 谁 shéi, 还 hái (医生还要检查…). 一九九五年, 一九九八年 ghi yī (đọc từng chữ số, 一 không biến điệu).
- **Pinyin**: 照顾 ghi zhàogù, 常见 ghi chángjiàn (viết liền, pos tính từ).

## HSK 3 · Bài 16: 我现在累得下了班就想睡觉 – Giờ tôi mệt đến mức tan làm là muốn ngủ

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **Glossary “beyond”**: 好好 và 大大 có trong danh sách từ mới (cấp 4) nên validator coi là từ riêng, dù ở đây chúng chính là ví dụ của điểm ngữ pháp lặp tính từ AA. 假 (khi 请假/休假 bị tách: 请两天假, 休过假) cũng phải đưa vào glossary.
- **Pinyin AA**: mình ghi theo thanh gốc: 好好 hǎohǎo, 慢慢 mànmàn, 早早 zǎozǎo, 红红的 hónghóng de. Mẹo phát âm (s3) có nói khẩu ngữ Bắc Kinh hay đọc 慢慢儿 mànmānr, 好好儿 hǎohāor. Mời xem có nên đổi không.
- **Bổ ngữ trạng thái phức tạp**: tránh 起来/出来 (bài 19), nên không dùng 高兴得跳了起来 hay 说不出话来. Ví dụ: 累得下了班就想睡觉, 忙得没有时间吃饭, 牙疼得睡不着觉, 看节目看得忘了时间, 忙得一口水都没喝.
- **Lời thoại**: “你平时一般几点上床睡觉？” (平时 và 一般 đứng cạnh nhau, mình thấy tự nhiên trong khẩu ngữ), “休假一个星期”, “如果会议开得好的话” và “每天直到晚上十点才下班” có ổn không.
- **readings_ok**: 得 děi (六点就得起), 得 de, 地 de, 着 zháo (睡不着), 觉 jiào (睡觉), 都 dōu, 干 gàn, 假 jià. Các cảnh báo này đều đúng ý.
- **Bài đọc**: “我在一个网站工作” (làm cho một trang web), “点了一个外卖”. Mời xem có tự nhiên không. Bài đọc có 139 chữ, gần mức trần 150.
- **Đáp án dịch**: t14 có chấp nhận “他忙得连吃饭的时间都没有” và “他忙得没空吃饭” (连, 空 chưa học nhưng là đáp án đúng).
- **Từ phân bổ**: 室 dạy như chữ 园/子 ở các bài trước (教室、办公室、会议室). 起 dùng một mình nghĩa “dậy” (六点就得起, 起晚了) để tránh 起来.

## HSK 3 · Bài 17: 谁都有办法看好你的“病” – Ai cũng có cách chữa “bệnh” cho bạn

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **“疑问代词活用3”**: mình hiểu là cách dùng chỉ “bất kỳ” (任指): 谁都, 什么都, 哪儿都, 什么时候都 + 也/都 + (不/没). Bài 8 đã dạy kiểu hô ứng 你去哪儿我就去哪儿. Nếu curriculum muốn nội dung khác thì cần sửa g2.
- **Động từ lặp**: bài dạy ABAB (休息休息, 锻炼锻炼) và AAB cho động từ li hợp (聊聊天, 洗洗澡, 读读书). Mời xem pinyin của phần lặp: mình ghi 休息休息 xiūxi xiūxi, 聊聊天 liáoliao tiān, 读读书 dúdu shū, còn 锻炼锻炼, 复习复习, 介绍介绍, 认识认识 giữ nguyên thanh.
- **e5**: phương án nhiễu “休息了休息”. Trong một số sách, AB了AB vẫn dùng được cho việc đã xảy ra, nhưng câu có 应该 nên chỉ 休息休息 đúng. Mời xác nhận.
- **照 (x17)**: ví dụ “我们在公园里照了很多照片”. Người Trung có thể thấy 拍照片 tự nhiên hơn; 照 là từ được phân bổ nên mình giữ.
- **刷**: dạy cả nghĩa 刷牙 và 刷手机 (lướt điện thoại). Hội thoại dùng “一上床就刷手机，越刷越不想睡”.
- **Đọc âm đã xác nhận trong readings_ok**: 着 zháo (睡不着), 地 de (慢慢地), 得 de (难过得哭了), 子 zǐ (电子书 diànzǐshū), 里 li (公园里), 片 piàn (照片 zhàopiàn).
- **Đã sửa để tránh từ ngoài danh sách**: bỏ “生自己的气” và “把手机关了” (bộ tách từ cắt thành 手 + 机关), thay bằng “别生气”, “关手机”. Cấu trúc 生……的气 chỉ nằm trong note_vi và review.

## HSK 3 · Bài 18: 我相信他们会同意的 – Tôi tin họ sẽ đồng ý

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **关于 làm trạng ngữ**: g2 và mistakes_vi nói 关于 + chủ đề đặt ở đầu câu, trước chủ ngữ (✗ 我关于那个学校了解得很多). Mời xác nhận cách nói này đủ chặt, không bắt bẻ quá mức.
- **以为 / 认为 (e3, review)**: e3 “我____今天是星期六，其实今天是星期五” chỉ chấp nhận 以为. Mời kiểm tra có ai coi 认为 cũng chấp nhận được không.
- **Hội thoại dòng 6**: được hỏi “你了解多少？” mà trả lời “当然了解。” Mình thấy vẫn tự nhiên trong khẩu ngữ, mời xem lại.
- **十几个房子 (nghe)**: dùng lượng từ 个 cho 房子. 套 chính xác hơn nhưng nằm ngoài danh sách từ.
- **信 / 封**: hội thoại kết thúc bằng “每个星期给他们写一封信”, bài đọc là một lá thư của bố. Viết thư tay hơi cổ điển, mình cố ý chọn để dùng từ 信, 封.
- **可 (x2)**: dạy với nghĩa liên từ “nhưng” (可我没有时间). Chưa dạy cách dùng nhấn mạnh (可好了).
- **心里 (x5)**: ghi xīnli (nhẹ) theo 现代汉语词典; danh sách từ ghi xīnlǐ.
- **Đọc âm đã xác nhận**: 得 de (住得开心, 说得也对), 里 li (家里).

## HSK 3 · Bài 19: 你没看出来吗 – Bạn không nhận ra sao

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Vấn đề phân bổ từ

- **使** là điểm ngữ pháp của bài (“使”“叫”“让”) nhưng trong allocation lại thuộc HSK4 bài 8. Mình không dạy 使 trong vocab mà đưa vào glossary (kind beyond). Ngữ pháp, bài đọc và quiz q5 có dùng 使.
- **认** (trong 认出来, 认出我来) và **黄** (trong 变黄了) không có trong danh sách cấp 3, nên mình thêm vào glossary (beyond). Mình thêm cả 树叶 cho người học, dù từ này không có trong danh sách.

### Cần người biết tiếng Trung xem lại

- **Nghĩa mở rộng của bổ ngữ xu hướng**: bài chỉ dạy 出来 và 起来, vì hai từ này là từ cốt lõi của bài; không dạy 下去, 下来, 上. Các câu then chốt: e8 và q1 dùng để phân biệt 想不起来 với 想出来; e11 và q2 là 下起雨来; hội thoại dòng 1 là 认出我来.
- **Pinyin bổ ngữ**: viết 来 nhẹ: kàn chūlai, xiǎng qǐlai, rèn chū wǒ lai, xià qǐ yǔ lai. Ở vocab, mục 出来 và 起来 vẫn ghi chūlái, qǐlái theo từ điển.
- **使 không có chủ ngữ**: mình tránh kiểu câu “看到这些树，使我……” (câu thiếu chủ ngữ). Bài đọc dùng “黄色的树叶使妈妈很开心”; mời xem câu này có hơi cứng không.
- **e10 và mistakes**: “妈妈让我不去” bị đánh dấu sai khi muốn nói “mẹ không cho tôi đi”. Mời xác nhận cách giải thích (让我别去 = bảo đừng đi).
- **Đọc âm đã xác nhận**: 长 cháng (长头发), 种 zhòng (种了很多树), 得 de, 里 li. Riêng 长得像 đọc zhǎng, validator không cảnh báo.

## HSK 3 · Bài 20: 我被他影响了 – Tôi bị anh ấy ảnh hưởng rồi

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **Câu 被 với 叫 / 让**: g1 có nhắc rằng khi nói có thể dùng 叫 / 让 thay 被. t8 (điền vào 我的蛋糕____弟弟吃了) chấp nhận cả 被 / 叫 / 让. Các câu trắc nghiệm có 被 đều cố ý không đưa 叫 / 让 / 给 làm phương án nhiễu, để chỉ có một đáp án đúng.
- **“我被我爱人影响了”**: câu 被 cho việc trung tính / tốt. Mời xác nhận nghe tự nhiên (title bài cũng dùng 我被他影响了).
- **被子 (glossary, beyond)**: hội thoại dòng 6 có câu đùa “被子就被他拿走了”, cố ý chơi chữ với 被. Nếu thấy rối cho người học thì có thể bỏ.
- **只有 hai nghĩa**: hội thoại dòng 9 “只有你真的做到了” dùng 只有 nghĩa “chỉ có (mỗi bạn)”, không đi với 才. Note của v3 có giải thích; mời xem có gây nhầm với g2 không.
- **“我感到生活变得更健康了”** (hội thoại dòng 8): hơi dài, có thể rút thành 我觉得自己更健康了. Mình giữ để dùng 感到 và 生活.
- **爱人**: dịch “chồng / vợ” (cách gọi ở Trung Quốc đại lục), pinyin àiren.
- **Đọc âm đã xác nhận**: 谁 shéi (pypinyin mặc định shuí), 都 dōu (pypinyin đọc nhầm dū trong 每个人都会…), 得 de, 里 li.
- Đây là bài cuối cấp 3. Bài đọc khoảng 146 chữ, bài nghe khoảng 154 chữ Hán; độ dài bài đọc gần sát giới hạn 150 của validator.

## HSK 4 · Bài 1: 简单的爱情 – Tình yêu giản dị

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **5 điểm ngữ pháp, 4 mục**: curriculum có 5 điểm (不仅, 从来, 刚, 即使, 在……上) nhưng spec chỉ cho 2–4 mục, nên gộp 从来 và 刚 vào một mục “phó từ thời gian” (g2). Tag câu hỏi vẫn tách riêng: `g:从来`, `g:刚`.
- **刚 (xem kỹ hơn)**: dạy thêm 刚 + V + thời lượng (我们刚认识两个月) và 刚……就……. Lỗi mẫu “✗ 刚才我们认识两个月” – mời xem cách giải thích 刚/刚才 có ổn không.
- **不仅 cùng chủ ngữ**: coi “✗ 不仅他很帅，而且他很幽默” là sai (theo quy tắc trong đề thi). Trong quiz q1 mình không dùng câu này làm phương án sai cho chắc; phương án sai là “还他很幽默”, “但是”, “很帅不仅”.
- **即使 và 虽然**: lỗi mẫu “✗ 即使他很忙，但是……” (chuyện có thật). Ngoài đời đôi khi 即使 cũng nói chuyện có thật; ở đây đơn giản hóa thành “即使 = giả định”.
- **嗯** viết ǹg theo đề cương (đã xác nhận trong readings_ok; pypinyin mặc định là ń).
- **readings_ok**: 都 dōu (pypinyin đọc 都会 thành dūhuì), 得 de (离得这么远).
- **Hội thoại**: “他说花放几天就坏了，买水果更好” – người bản ngữ hay nói “还不如买水果”, nhưng 不如 là từ bài 10 nên tránh. “这样的男朋友也挺可爱的” – xem có tự nhiên không.
- **Bài đọc**: “她是被爷爷的认真和幽默吸引的” (是……的 + 被) và “五十年来” – xem độ tự nhiên.
- **Ví dụ 仅**: “他们认识仅三个月，就决定结婚了” – văn viết; xem có gượng không.
- **Từ tránh vì thuộc bài sau**: 不过, 就是 (nghĩa “chỉ có điều”), 不如, 互相, 散步, 心情, 敢, 方面, 真是 (cấp 7), 什么样 (样 cấp 6). Vì vậy dùng “他人怎么样？”, “这个小伙子真不错”.
- Glossary trống: mọi từ trong bài đều đã học (HSK3 + bài này) hoặc cấp 1.

## HSK 4 · Bài 2: 真正的朋友 – Người bạn đích thực

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **5 điểm ngữ pháp, 4 mục**: gộp 尽管 và 却 thành một mục (g3 “尽管……，可是/还是……” + phó từ 却) vì hai từ hay đi cùng nhau. Tag vẫn tách: `g:尽管`, `g:却`.
- **差不多 (xem kỹ hơn)**: dạy ba cách dùng (vị ngữ “gần giống nhau”, phó từ trước số lượng/động từ, “……差不多了”) và so sánh với 几乎. Lỗi mẫu “✗ 我和他的爱好几乎” – mời xem.
- **正好**: lỗi mẫu “✗ 这双鞋很正好” (coi 很 + 正好 làm vị ngữ là sai) – mời xác nhận. Lỗi “✗ 我正好到家” (muốn nói “vừa mới về”) dựa trên việc chữ “vừa” tiếng Việt có hai nghĩa.
- **而**: lỗi mẫu “✗ 我很想去，而我没有时间” ghi là “nghe không tự nhiên” chứ không nói là sai hẳn. Ví dụ 不是……而是…… được nhắc qua (là điểm HSK4 khác, chưa có trong curriculum).
- **却 trong hội thoại**: “可是那天公司突然有事，我却忘了告诉他” – xem 却 ở đây có tự nhiên không.
- **fill t8**: chấp nhận cả 却 và 还是 (他____没来).
- **readings_ok**: 得 de (来得正好, 笑得…), 长 cháng (很长时间 – pypinyin đọc riêng chữ 长 là zhǎng).
- **Từ tránh**: 生我的气 (生 là từ bài 17 khi bị tách) → “他还在生气吧”; 成了好朋友 (成 cấp 6) → 变成了好朋友; 打了招呼 bị tách thành 招/呼 (ngoài danh sách) → “笑着跟每个人打招呼”; 原来, 不过, 消息, 心情, 热闹 đều thuộc bài sau nên không dùng.
- **Tên người**: 小王 (nữ), 小张, 小周, 小月 (bài đọc), 小红 (bài nghe).
- Glossary trống.

## HSK 4 · Bài 3: 经理对我印象不错 – Giám đốc có ấn tượng tốt về tôi

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **5 điểm ngữ pháp, 4 mục**: gộp 首先……其次…… và 另外 thành một mục (g3 “trình bày theo thứ tự, bổ sung ý”). Tag vẫn tách: `g:首先其次`, `g:另外`.
- **挺 (xem kỹ hơn)**: nói 挺 gần với 很 nhưng thân mật hơn, thấp hơn 非常; không dùng trong câu 比; phủ định dùng 不太 (✗ 不挺好). Mời xác nhận cách nói về mức độ.
- **本来**: lỗi mẫu “✗ 本来他很瘦，现在也很瘦” (本来 ngầm báo có thay đổi) và “✗ 本来的时候”. Chưa so sánh với 原来 vì 原来 là từ bài 4.
- **不管**: so sánh 尽管 / 即使 / 不管 (ba từ cùng dịch là “dù”). Câu e9 “____工作多忙，他每天都锻炼” coi 尽管 là sai vì sau nó là ý mở (多忙). Câu t2 coi 即使 là sai trước “同意不同意”.
- **Hội thoại**: “贵公司”, “别紧张，我们随便聊聊”, “不管多忙多累，我都坚持下来了” – xem có tự nhiên trong buổi phỏng vấn không. Lời tiếng Việt cho ứng viên xưng “em”, gọi người phỏng vấn là “anh / giám đốc Vương”.
- **Từ 首, 部, 表, 证, 迟, 另**: chỉ xuất hiện trong ví dụ từ vựng và bài kiểm tra (t1 lượng từ 首/部/份/张); 毕业证 có trong bài nghe.
- **readings_ok**: 得 de (看得出来, 准备得很好), 都 dōu (都会 bị pypinyin đọc dūhuì).
- **Bộ tách từ**: “本科生还是” bị pypinyin đọc 生还 (huán) và 本科生 bị tách ra chữ 生 → đổi ví dụ thành “不管你是本科毕业还是硕士毕业”.
- **Từ tránh vì thuộc bài sau**: 当 (làm nghề – bài 4, nên viết 做老师), 加班, 结果, 通过, 消息, 不过, 打交道 (cấp 6), 简历, 实习 (cấp 5). Bài nghe dùng “不管能不能得到这份工作，我都学到了很多” thay cho 对……来说 (bài 5).
- Glossary trống.

## HSK 4 · Bài 4: 不要太着急赚钱 – Đừng quá vội kiếm tiền

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **5 điểm ngữ pháp, 4 mục**: gộp 以为 và 原来 vào g1 (“我以为……，原来……”). Tag câu hỏi vẫn tách riêng: `g:以为`, `g:原来`. 以为 là từ đã học ở HSK3 nên không có trong vocab bài này.
- **以为 / 认为**: bài nói “trong khẩu ngữ 以为 gần như luôn mang ý tưởng nhầm”. Văn viết trang trọng vẫn có 我以为 = tôi cho rằng. Mời xem quiz q1 (B đồng ý: 我____这个办法不错 → 认为) có đủ rõ để chỉ một đáp án đúng.
- **原来 / 本来**: lỗi mẫu “✗ 本来是你啊！” (nghĩa “hóa ra” chỉ có ở 原来). Bài tập e6 (我说他今天怎么这么累，原来……) dùng 本来 làm phương án sai.
- **并 liên từ**: ví dụ “他完成了任务，并写了一封邮件告诉经理” – xem có tự nhiên không.
- **甚至**: bài sắp xếp e10 chấp nhận cả “他周末甚至也要加班” – xem có nên giữ.
- **Câu cần xem độ tự nhiên**: “大学毕业以后，他走进了社会” (hay 走上社会/进入社会?); “按照公司的习惯，年底每个人都有奖金” (规定 tự nhiên hơn nhưng là từ bài 14); “他是学法的” (ví dụ cho 法).
- **Pinyin**: 好好 viết hǎohǎo, 慢慢 viết mànmàn, 买不起 mǎi bu qǐ, 回去 huíqu.
- **readings_ok**: 得 děi (也得去公司、还得去外地), 得 de (发展得很快), 里 li (厂里).
- **Từ tránh vì thuộc bài sau**: 积累, 轻松, 不过, 后悔, 低, 够, 计划, 规定, 定, 等于, 激烈, 所 (cấp 5). Vì vậy dùng “竞争这么大”, “去中学当老师”.
- Glossary trống: mọi từ trong bài đều đã học (HSK3, HSK4 bài 1–3, bài này) hoặc cấp 1.

## HSK 4 · Bài 5: 只买对的，不买贵的 – Chỉ mua đồ đúng, không mua đồ đắt

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **5 điểm ngữ pháp, 4 mục**: gộp 对……来说 và 尤其 vào g4 (hai cấu trúc hay đi cùng nhau: 对学生来说……，尤其是……). Tag tách riêng: `g:对来说`, `g:尤其`.
- **实际 / 实际上**: bài nói “实际 không đứng một mình ở đầu câu thay cho 实际上” (lỗi mẫu ✗ 实际，这件衣服并不贵). Ngoài đời đôi khi vẫn gặp 实际只要…; vì vậy e8 không dùng 实际 làm phương án sai.
- **尤其 + danh từ cần 是**: lỗi mẫu “✗ 尤其女孩儿喜欢”. Khẩu ngữ có lúc lược 是; quiz q6 chỉ dùng phương án sai rõ ràng (再说, 实际上, 肯定).
- **肯定 / 一定**: lỗi mẫu “✗ 你肯定要来我家吃饭！” (dặn dò dùng 一定要) – xem có quá cứng không.
- **打八折**: giải thích “trả 80% giá (giảm 20%)”; thêm 九五折 trong hội thoại. 折 đứng riêng (打完折, 打八折) là từ “beyond” nên có trong glossary.
- **Câu cần xem độ tự nhiên**: “贵是贵了点儿”; “牌子越有名，广告费越高，这些钱最后都要顾客来付”; “办会员卡收费吗？”; bài đọc “价格再低也没有用” (cấu trúc 再 + Adj + 也 chưa dạy chính thức).
- **Pinyin**: 实际上 viết shíjìshàng (theo đề cương), 费用 viết fèiyong (theo đề cương, thanh nhẹ), 看起来/用起来 viết qǐlai, 省下 shěng xia, 一千二 yìqiān èr.
- **readings_ok**: 里 li (商场里、超市里), 得 de (广告做得多).
- **Từ tránh vì thuộc bài sau hoặc cấp cao**: 质量 (bài 6) → “好牌子的衣服肯定能穿好几年”; 暖和 → “冬天穿它还是觉得冷”; 穿着 (danh sách xếp cấp 7); 码 đứng riêng (nên không viết 扫一下码); 身上; 各种各样 (各 thuộc bài 12); 西红柿.

## HSK 4 · Bài 6: 一分钱一分货 – Tiền nào của nấy

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

### Cần người biết tiếng Trung xem lại

- **5 điểm ngữ pháp, 4 mục**: gộp 倍 và 其中 vào g2 (“nói về số lượng”). Tag tách riêng: `g:倍`, `g:其中`.
- **倍 (xem kỹ)**: dạy theo chuẩn: 是……的两倍 = gấp đôi, 比……多一倍 = gấp đôi, 比……多两倍 = gấp ba; giảm thì dùng 一半. Khẩu ngữ hay dùng lỏng hơn, nên bài tập không dùng 比……多两倍 làm phương án sai (e8 dùng “多两个倍”).
- **竟然**: bài nói “thường đứng sau chủ ngữ” (lỗi mẫu ✗ 竟然这件衣服是假的 → dùng 没想到 ở đầu câu). Câu không chủ ngữ như 竟然有这种事 vẫn đúng; quiz q1 chỉ dùng phương án sai rõ ràng. e6 gắn tag `g:竟然` nhưng đáp án là 原来 (bài tập phân biệt).
- **值得 viết zhídé** (theo đề cương và 现代汉语词典 zhí//dé); pypinyin đọc zhíde nên đã xác nhận 得 dé trong readings_ok. 照片 viết zhàopiàn (片 piàn).
- **Câu cần xem độ tự nhiên**: “网页上有很多买过的人写的话” (người bản ngữ sẽ nói 评价/评论, nhưng hai từ này cấp 5–6); “就是在你的帮助下才买到了好的” (在……下 hơi văn viết trong hội thoại); “我这个是线下买的”; “这次我差点儿给妹妹也买了一个” (nghĩa: suýt mua, không mua).
- **Bài đọc**: số liệu tự đặt (一百位……其中有四十位……有的甚至……); “让人吃惊的是”.
- **readings_ok**: 得 de (说得对、写得很清楚), 得 děi (得找人修理), 得 dé (值得), 里 li, 片 piàn.
- **Từ tránh**: 退/退货 (cấp 5), 客服, 评价, 名牌, 一模一样, 消息, 往往, 只好, 结果; 在线 (người kiểm tra tách “在线下” thành 在线 + 下, nên viết “线下买的”, “线下购物”).
- Glossary trống.
