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

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

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

## Từ được phân bổ nhưng khó dùng tự nhiên

- 越: chỉ dạy trong khối 越来越 (越A越B để bài 9).
- 跑, 打: hầu như chỉ xuất hiện trong 跑步, 打篮球 (từ đã biết). 跑 đứng riêng chỉ có trong ví dụ 跑得很快.
- 游, 球, 自己, 早, 有时, 面条儿: chỉ có trong ví dụ từ vựng, ghép nối từ (match) hoặc một câu bài nghe.
- 斤 / 公斤: hội thoại nói “瘦了十斤”, phần dịch giải thích là 5 kg. Bài đọc có câu đúng/sai kiểm tra phép đổi 10 斤 = 5 公斤.

## Từ của bài sau đã tránh

Đã tránh 以前, 习惯, 应该, 只有 (bị tách thành một từ trong 只有五十公斤), 先, 跟 và 发现.

## HSK 3 · Bài 6: 怎么突然找不到了 – Sao đột nhiên không tìm thấy nữa

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

`readings_ok`:
- 得 de: bổ ngữ khả năng 听得见.
- 谁 shéi: khẩu ngữ; pypinyin mặc định là shuí.
- 啊 à: thán từ khi chợt nhận ra, “À, ở đằng kia”, ở hội thoại dòng 7.
- 里 li: 房间里.

## Cần người biết tiếng Trung xem lại

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

## Từ được phân bổ nhưng khó dùng tự nhiên

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

## Cần người biết tiếng Trung xem lại

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

## Từ được phân bổ nhưng khó dùng tự nhiên

- 时: chỉ có “上课时不要说话”.
- 段: chỉ có “这段时间”.
- 喜爱: văn viết, chỉ có trong ví dụ.
- 得分: chỉ có “还没得分”.
- 跳: chỉ trong 跳舞.
- 难听: chỉ có trong ví dụ.
- 天, 见, 遇见: có trong ví dụ, ghép nối từ và lời dẫn cảnh (scene_vi).

## HSK 3 · Bài 8: 你去哪儿我就去哪儿 – Bạn đi đâu tôi đi đó

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

## Cần người biết tiếng Trung xem lại

- **Lỗi “你去哪儿，我就去那儿”** (g2.mistakes_vi): mình đánh dấu ✗ và giải thích rằng cấu trúc hô ứng lặp lại cùng một đại từ 哪儿. Nhờ kiểm tra xem người bản ngữ có chấp nhận cách nói có 那儿 ở vế sau không. Nếu có, nên nói nhẹ đi (“không đúng cấu trúc đang học”) thay vì coi là sai hẳn. Bài tập e9 cố ý không dùng 那儿 làm phương án nhiễu để tránh tranh cãi.
- **“明天又是星期一了”**: đưa vào làm ngoại lệ (việc lặp lại chắc chắn trong tương lai vẫn dùng 又). Mời xem cách giải thích có đủ rõ không.
- **再说一次 / 再说一遍**: bộ tách từ đọc 再说 thành từ cấp 4 (“vả lại”), nên mình không dùng cụm này trong các văn bản được kiểm tra. Cụm này chỉ có trong mistakes_vi, review và câu hỏi e2 của bài 9.
- **Độ tự nhiên của câu thoại**: “这件大小正合适！” (Tiểu Trần nhận xét khi bạn mặc thử), “大一点儿的卖完了”, “这种裤子黑色的都卖完了，白色的还有”, “今天我又花了不少钱”.
- **元/角 và 块/毛**: câu viết dùng 元/角, câu nói dùng 块/毛 (x14: 三块五毛). Ở bài nghe, người kể nói 一百九十九元. Thực tế khi nói người ta hay dùng 块; mình giữ 元 vì đây là từ chính của bài.
- **Từ khó dùng tự nhiên**: 种 chỉ có trong ví dụ x2 và bài nghe; 毛 chỉ có trong ví dụ x14.
- **Đọc âm đã xác nhận trong readings_ok**: 长 cháng (有点儿长), 了 le (做好了), 谁 shéi (từ điển pypinyin mặc định là shuí).

## HSK 3 · Bài 9: 她的汉语说得跟中国人一样好 – Tiếng Trung của cô ấy giỏi như người Trung Quốc

Kết quả kiểm tra: validator 0 lỗi, 0 cảnh báo; grading_check đạt hết.

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

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

## Cần người biết tiếng Trung xem lại

- **Bổ ngữ xu hướng kép**: 过来 thuộc bài 14, còn 出来 và 起来 thuộc bài 19, nên bài này chỉ dùng 回来/回去, 上来/上去, 进来/进去, 下来/下去, 出去, 过去 (走过去, 开过去). Mời kiểm tra cách chọn 来/去 theo vị trí người nói trong e6, q1 (đã ghi rõ ngữ cảnh trong prompt_vi) và câu “我进房间去换一下衣服”.
- **过去 (v13)**: mình ghi pinyin guòqu (nhẹ) cho nghĩa động từ “đi sang”, còn danh sách từ ghi guòqù. Note_vi có nói khi là danh từ “quá khứ” thì thường đọc guòqù.
- **一边 với tính từ**: bài có dạy thêm 又……又…… để tránh lỗi kiểu “vừa nhanh vừa tiện → ✗ 一边快一边方便”. Phần này không có trong curriculum, mình thêm vào vì người Việt rất hay sai chỗ này.
- **不安全**: bộ tách từ của validator cắt “不安全” thành 不安 + 全, nên trong văn bản mình viết “要注意安全” hoặc “不太安全”. Câu “下雨天开车不安全” chỉ còn ở phần dịch (t15) và câu hỏi e4; chỗ đó validator không tách từ.
- **Câu trả lời thêm cho bài sắp xếp e11**: có chấp nhận “是我走回来的” (nhấn mạnh chủ ngữ). Mời xác nhận đáp án này có hợp lý không.
- **Nghe (lp1)**: tin nhắn thoại chỉ đường dùng “高铁晚点了你就给我打电话” (câu điều kiện không có 如果, vì 如果/的话 thuộc bài 16).
- **Đọc âm**: 边 đọc nhẹ bian (东边, 南边, 西边, 北边), 里 đọc nhẹ li, đã ghi trong readings_ok. 第一个 viết dì yī ge (số thứ tự, 一 không biến điệu).
