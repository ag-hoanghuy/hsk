import LessonPicker from "../components/LessonPicker";

export default function Speaking() {
  return (
    <LessonPicker
      title="Luyện nói"
      subtitle="Chọn một bài, nghe câu mẫu rồi ghi âm giọng của bạn để nhận điểm phát âm và gợi ý sửa từng âm tiết."
      basePath="/speaking"
      section="speaking"
      ready={(lesson) => lesson.available}
    />
  );
}
