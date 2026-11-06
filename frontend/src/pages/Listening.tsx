import LessonPicker from "../components/LessonPicker";

export default function Listening() {
  return (
    <LessonPicker
      title="Luyện nghe"
      subtitle="Chọn một bài để nghe từ vựng, hội thoại, đoạn văn ngắn và làm bài nghe."
      basePath="/listening"
      section="listening"
      ready={(lesson) => lesson.available}
    />
  );
}
