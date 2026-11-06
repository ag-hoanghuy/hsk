import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ComingSoon from "./pages/ComingSoon";
import Home from "./pages/Home";
import Lesson from "./pages/Lesson";
import Listening from "./pages/Listening";
import ListeningLesson from "./pages/ListeningLesson";
import Reading from "./pages/Reading";
import ReadingLesson from "./pages/ReadingLesson";
import Speaking from "./pages/Speaking";
import SpeakingLesson from "./pages/SpeakingLesson";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="lesson/:id" element={<Lesson />} />
        <Route path="speaking" element={<Speaking />} />
        <Route path="speaking/:id" element={<SpeakingLesson />} />
        <Route path="reading" element={<Reading />} />
        <Route path="reading/:id" element={<ReadingLesson />} />
        <Route path="listening" element={<Listening />} />
        <Route path="listening/:id" element={<ListeningLesson />} />
        <Route path="tests" element={<ComingSoon title="Kiểm tra" />} />
      </Route>
    </Routes>
  );
}
