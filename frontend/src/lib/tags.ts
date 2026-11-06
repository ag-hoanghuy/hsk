/** Question tags look like "v:打算" (vocab), "g:结果补语好" (grammar) or a topic keyword. */
export function tagLabel(tag: string): string {
  if (tag.startsWith("v:")) return `Từ vựng · ${tag.slice(2)}`;
  if (tag.startsWith("g:")) return `Ngữ pháp · ${tag.slice(2)}`;
  const topics: Record<string, string> = {
    vocab: "Từ vựng (nối nghĩa)",
    dialogue: "Câu hội thoại",
    listening: "Nghe hiểu đoạn văn",
    reading: "Đọc hiểu",
  };
  return topics[tag] ?? tag;
}
