import LessonPicker from "../components/LessonPicker";

export default function Reading() {
  return (
    <LessonPicker
      title="Luyện đọc"
      subtitle="Chọn một bài để đọc đoạn văn, xem pinyin, bản dịch, nghĩa từng từ và trả lời câu hỏi đọc hiểu."
      basePath="/reading"
      section="reading"
      ready={(lesson) => lesson.has.includes("reading")}
    />
  );
}
